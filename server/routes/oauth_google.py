# server/routes/oauth_google.py
from fastapi import APIRouter, Request, HTTPException, Response
from fastapi.responses import RedirectResponse
import os, time, secrets
import httpx, jwt
from urllib.parse import urlencode
from db import users_collection
from typing import Optional
from itsdangerous import URLSafeTimedSerializer, BadTimeSignature, SignatureExpired

# Use the SAME JWT creator/secret as the rest of your app
from utils.auth_utils import create_jwt  # HS256 with SECRET_KEY + exp

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") or ""
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET") or ""
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI") or ""
FRONTEND_URL = (os.getenv("FRONTEND_URL", "http://localhost:3000")).rstrip("/")
ENV = os.getenv("ENV", "dev").lower()
IS_PROD = ENV in ("prod", "production")

# These are only for decoding the cookie in /auth/session when needed
from utils.auth_utils import SECRET_KEY  # same one used by create_jwt
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_SECONDS = int(os.getenv("JWT_EXPIRE_SECONDS", "86400"))

STATE_SECRET = os.getenv("STATE_SECRET", "another-secret")
STATE_MAX_AGE = 600  # 10 min

if not (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI):
  raise RuntimeError("Missing Google OAuth env vars")

serializer = URLSafeTimedSerializer(STATE_SECRET)

def set_session_cookie(resp: Response, token: str):
  """
  In dev (http on localhost): SameSite=Lax, secure=False
  In prod (https): SameSite=None, secure=True
  """
  resp.set_cookie(
    key="app_session",
    value=token,
    httponly=True,
    secure=IS_PROD,
    samesite="none" if IS_PROD else "lax",
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
    "prompt": "select_account",  # or "consent" the first time to get refresh_token
    "state": state,
    "nonce": nonce,
  }
  url = f"{base}?{urlencode(params)}"

  resp = RedirectResponse(url)
  # Dev-friendly flags for this transient cookie
  resp.set_cookie(
    "oauth_nonce",
    nonce,
    max_age=STATE_MAX_AGE,
    secure=IS_PROD,         # secure only in prod
    httponly=True,
    samesite="lax",         # fine for this same-site redirect step
    path="/",
  )
  return resp

# CORS for this route must allow credentials on the app
@router.get("/auth/session")
async def session(request: Request):
  token = request.cookies.get("app_session")
  if not token:
    return {"authenticated": False}
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
    return {
      "authenticated": True,
      "sub": payload.get("user_id") or payload.get("sub"),
      "email": payload.get("email"),
      "name": payload.get("name"),
      "image": payload.get("image"),
    }
  except jwt.InvalidTokenError:
    return {"authenticated": False}

@router.get("/auth/google/callback")
async def google_callback(
  code: Optional[str] = None,
  state: Optional[str] = None,
  error: Optional[str] = None,
  error_description: Optional[str] = None,
  request: Request = None,
):
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
    tr.raise_for_status()
    token_resp = tr.json()

    access_token = token_resp.get("access_token")
    if not access_token:
      raise HTTPException(status_code=400, detail="No access token from Google")

    # Fetch userinfo (optionally verify id_token + JWKS in production)
    r2 = await client.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      headers={"Authorization": f"Bearer {access_token}"},
    )
    r2.raise_for_status()
    info = r2.json()

    email = info.get("email")
    if not email:
      raise HTTPException(status_code=400, detail="Google account has no email")
    if info.get("email_verified") is False:
      raise HTTPException(status_code=400, detail="Email not verified with Google")

    # Upsert user
    existing = await users_collection.find_one({"email": email})
    now = int(time.time())
    if not existing:
      doc = {
        "email": email,
        "oauth_provider": "google",
        "oauth_id": info.get("sub"),
        "name": info.get("name") or "",
        "name_source": "oauth",
        "image": info.get("picture") or "",
        "image_source": "oauth",

        # app profile fields
        "professional_title": None,
        "bar_number": None,
        "company_name": None,
        "address": None,
        "phone": None,
        "court_preferences": None,
        "signature_block": None,

        "created_at": now,
        "updated_at": now,
      }
      res = await users_collection.insert_one(doc)
      user_id = str(res.inserted_id)
    else:
      update = {
        "oauth_provider": "google",
        "oauth_id": info.get("sub"),
        "updated_at": now,
      }
      # keep user overrides intact
      if (not existing.get("name")) or (existing.get("name_source") == "oauth"):
        update["name"] = info.get("name") or existing.get("name", "")
        update["name_source"] = "oauth"
      if (not existing.get("image")) or (existing.get("image_source") == "oauth"):
        update["image"] = info.get("picture") or existing.get("image", "")
        update["image_source"] = "oauth"

      await users_collection.update_one({"_id": existing["_id"]}, {"$set": update})
      user_id = str(existing["_id"])

  # Issue a JWT compatible with your normal /user/me guard
  # Use 'user_id' claim so get_current_user (bearer flow) works
  jwt_token = create_jwt({"user_id": user_id, "email": email})

  # Set HttpOnly cookie (optional) AND redirect with ?token= so SPA stores Bearer
  redirect = RedirectResponse(f"{FRONTEND_URL}/auth?token={jwt_token}")
  set_session_cookie(redirect, jwt_token)

  # Clear transient cookie
  redirect.delete_cookie("oauth_nonce", path="/")
  return redirect
