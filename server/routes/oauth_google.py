# server/routes/oauth_google.py
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
import os
import httpx
import time
import jwt  # PyJWT
from urllib.parse import urlencode
from models import User  # adapt to your model
from db import users_collection  # adapt to your DB / collection
from dotenv import load_dotenv
from typing import Optional

load_dotenv(".env.local")

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_SECONDS = int(os.getenv("JWT_EXPIRE_SECONDS", "86400"))

if not (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI):
    # log warning in production
    pass


def create_jwt_for_user(user_id: str, email: str) -> str:
    now = int(time.time())
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": now,
        "exp": now + JWT_EXPIRE_SECONDS,
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


@router.get("/auth/google/login")
def google_login():
    """
    Redirect user to Google's OAuth consent screen.
    """
    base = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",  # or "consent" if you want refresh token each time
        # Optional: add a state param for CSRF protection; see notes below.
    }
    url = f"{base}?{urlencode(params)}"
    return RedirectResponse(url)


@router.get("/auth/google/callback")
async def google_callback(code: Optional[str] = None, request: Request = None):
    """
    Google calls back here with ?code=... . We exchange code for tokens,
    get userinfo, then create/find user in DB and issue our JWT token.
    Finally redirect to FRONTEND_URL with ?token=JWT.
    """
    if not code:
        raise HTTPException(status_code=400, detail="Missing code parameter from Google.")

    token_url = "https://oauth2.googleapis.com/token"
    userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"

    async with httpx.AsyncClient() as client:
        # Exchange code for tokens
        data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }
        r = await client.post(token_url, data=data, headers={"Accept": "application/json"})
        if r.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch token from Google.")
        token_resp = r.json()
        access_token = token_resp.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="No access token returned from Google.")

        # Fetch userinfo
        r2 = await client.get(userinfo_url, headers={"Authorization": f"Bearer {access_token}"})
        if r2.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info from Google.")
        info = r2.json()
        # info contains at least: sub (id), email, email_verified, name, picture
        email = info.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Google account has no email.")

        # Find or create user in your DB
        # Adjust this to match your user model / creation logic
        user = await users_collection.find_one({"email": email})
        if not user:
            new_user = {
                "email": email,
                "fullName": info.get("name"),
                "profilePictureUrl": info.get("picture"),
                "createdAt": time.time(),
                "oauth_provider": "google",
                "oauth_id": info.get("sub"),
            }
            res = await users_collection.insert_one(new_user)
            user_id = str(res.inserted_id)
        else:
            user_id = str(user["_id"])

        jwt_token = create_jwt_for_user(user_id, email)

        # Redirect to frontend with token (optionally set cookie instead)
        # For security, prefer setting HttpOnly cookie from backend. Simpler: redirect with token.
        redirect_url = f"{FRONTEND_URL.rstrip('/')}/auth?token={jwt_token}"
        return RedirectResponse(redirect_url)
