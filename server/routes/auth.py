from fastapi import APIRouter, HTTPException, Request, Response
from db import users_collection
from models.User import UserCreate
from utils.auth_utils import hash_password, verify_password, create_jwt
from bson import ObjectId

router = APIRouter()

@router.post("/auth/signup")
async def signup(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hash_password(user.password)
    user_doc = {"email": user.email, "password": hashed_pwd}
    result = await users_collection.insert_one(user_doc)
    token = create_jwt({"user_id": str(result.inserted_id), "email": user.email})

    return {"token": token}

@router.post("/auth/login")
async def login(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if not existing or not verify_password(user.password, existing["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt({"user_id": str(existing["_id"]), "email": existing["email"]})
    return {"token": token}

@router.post("/auth/logout")
async def logout(request: Request, response: Response):
    response.delete_cookie(
        "app_session",
        path="/",
        httponly=True,
        samesite="lax",  # or "none" if cross-site
        secure=False,    # True if using https
    )
    return {"message": "Logged out"}
