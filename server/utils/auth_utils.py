import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
from models.User import User
from fastapi import Depends, HTTPException, Header
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv(".env.local")

SECRET_KEY = os.getenv("SECRET_KEY")
client = MongoClient(os.getenv("MONGO_URI"))
db = client["Lexi"]
users_collection = db["users"]

def serialize_user(user_data):
    return {
        "id": str(user_data["_id"]),
        "email": user_data["email"]
    }

# utils/auth_utils.py
from fastapi import Depends, HTTPException, Header, Request

SECRET_KEY = os.getenv("SECRET_KEY")  # <- use the same value everywhere

def get_current_user(
    request: Request,
    authorization: str | None = Header(None),
):
    # 1) Pick token from header or cookie
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    else:
        token = request.cookies.get("app_session")

    if not token:
        raise HTTPException(status_code=401, detail="Missing auth token")

    payload = verify_jwt(token)  # uses SECRET_KEY
    if not payload:
        raise HTTPException(status_code=403, detail="Invalid or expired token")

    # 2) Support both payload shapes
    uid = payload.get("user_id") or payload.get("sub")
    if not uid:
        raise HTTPException(status_code=403, detail="Invalid token payload")

    user_data = users_collection.find_one({"_id": ObjectId(uid)})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    return User(**serialize_user(user_data))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_jwt(data: dict, expires_delta: timedelta = timedelta(days=365)):
    to_encode = data.copy()
    expire = datetime.now() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

def verify_jwt(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
