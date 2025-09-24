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

def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")
    token = authorization.split("Bearer ")[1]
    payload = verify_jwt(token)
    if not payload:
        raise HTTPException(status_code=403, detail="Invalid or expired token")
    user_data = users_collection.find_one({"_id": ObjectId(payload["user_id"])})
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
