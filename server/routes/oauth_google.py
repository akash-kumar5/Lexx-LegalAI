# server/routes/oauth_google.py
from fastapi import APIRouter, Request, HTTPException, Response
from fastapi.responses import RedirectResponse
import os, time, json, secrets
import httpx, jwt
from urllib.parse import urlencode
from models import User
from db import users_collection
from typing import Optional
from itsdangerous import URLSafeTimedSerializer, BadTimeSignature, SignatureExpired

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") or ""
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET") or ""
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI") or ""
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Prefer RS256 if possible; showing HS256 for brevity
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-now")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_SECONDS = int(os.getenv("JWT_EXPIRE_SECONDS", "86400"))

STATE_SECRET = os.getenv("STATE_SECRET", "another-secret")
STATE_MAX_AGE = 600  # 10 min

if not (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI):
    raise RuntimeError("Missing Google OAuth env vars")

serializer = URLSafeTimedSerializer(STATE_SECRET)

def create_jwt_for_user(user_id: str, email: str) -> str:
    now = int(time.time())
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": now,
        "nbf": now - 5,  # small clock skew
        "exp": now + JWT_EXPIRE_SECONDS,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def set_session_cookie(resp: Response, token: str):
    # Adjust domain and secure flags per your deployment
    resp.set_cookie(
        key="app_session",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=JWT_EXPIRE_SECONDS,
        path="/",
    )

@router.get("/auth/google/login")
def google_login():
    # Generate state + nonce and store in a signed cookie
    nonce = secrets.token_urlsafe(16)
    state = serializer.dumps({"nonce": nonce})
    base = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        # Use consent at least once if you need a refresh_token
        "prompt": "select_account",  # or "consent"
        "state": state,
        "nonce": nonce,
    }
    url = f"{base}?{urlencode(params)}"
    resp = RedirectResponse(url)
    print(resp)
    resp.set_cookie("oauth_nonce", nonce, max_age=STATE_MAX_AGE, secure=True, httponly=True, samesite="lax", path="/")
    return resp

# add this route (CORS must allow credentials)
@router.get("/auth/session")
async def session(request: Request):
    token = request.cookies.get("app_session")
    if not token:
        return {"authenticated": False}
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"authenticated": True, "sub": payload.get("sub"), "email": payload.get("email")}
    except jwt.InvalidTokenError:
        return {"authenticated": False}


@router.get("/auth/google/callback")
async def google_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None, error_description: Optional[str] = None, request: Request = None):
    if error:
        raise HTTPException(status_code=400, detail=f"Google OAuth error: {error} ({error_description or 'no description'})")
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")

    # Validate state + nonce
    try:
        data = serializer.loads(state, max_age=STATE_MAX_AGE)
        expected_nonce = request.cookies.get("oauth_nonce")
        if not expected_nonce or expected_nonce != data.get("nonce"):
            raise HTTPException(status_code=400, detail="Invalid nonce/state")
    except SignatureExpired:
        raise HTTPException(status_code=400, detail="State expired")
    except BadTimeSignature:
        raise HTTPException(status_code=400, detail="Invalid state")

    token_url = "https://oauth2.googleapis.com/token"
    async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=5.0)) as client:
        # Exchange code for tokens
        token_payload = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        tr = await client.post(token_url, data=token_payload, headers={"Accept": "application/json"})
        try:
            tr.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch token: {e.response.text[:300]}")

        token_resp = tr.json()
        access_token = token_resp.get("access_token")
        id_token = token_resp.get("id_token")  # consider verifying
        refresh_token = token_resp.get("refresh_token")  # may be None unless prompt=consent

        if not access_token:
            raise HTTPException(status_code=400, detail="No access token from Google")

        # Option A: Verify id_token (recommended). Skipping JWKS for brevity.
        # Option B: Call userinfo
        r2 = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        try:
            r2.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch userinfo: {e.response.text[:300]}")

        info = r2.json()
        email = info.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Google account has no email")
        if info.get("email_verified") is False:
            raise HTTPException(status_code=400, detail="Email not verified with Google")

        # Upsert user
        existing = await users_collection.find_one({"email": email})
        if existing:
            # Optional: ensure oauth_provider matches, update fields if changed
            await users_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "fullName": info.get("name"),
                    "profilePictureUrl": info.get("picture"),
                    "oauth_provider": "google",
                    "oauth_id": info.get("sub"),
                    "updatedAt": time.time(),
                }}
            )
            user_id = str(existing["_id"])
        else:
            doc = {
                "email": email,
                "fullName": info.get("name"),
                "profilePictureUrl": info.get("picture"),
                "createdAt": time.time(),
                "oauth_provider": "google",
                "oauth_id": info.get("sub"),
                # If you keep refresh_token, encrypt it before storing
                # "google_refresh_token": refresh_token,
            }
            res = await users_collection.insert_one(doc)
            user_id = str(res.inserted_id)

    jwt_token = create_jwt_for_user(user_id, email)

    # Set HttpOnly cookie and redirect cleanly
    redirect = RedirectResponse(f"{FRONTEND_URL.rstrip('/')}/")
    set_session_cookie(redirect, jwt_token)
    # Clear transient cookie(s)
    redirect.delete_cookie("oauth_nonce", path="/")
    return redirect
