# routes/user.py
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from utils.auth_utils import db, get_current_user
from models.User import User  # Pydantic model for current_user
import time

router = APIRouter(prefix="/user")

# --- Pydantic model for profile updates ---
# This model now correctly mirrors the frontend's ProfileData state.
# It uses aliases to map incoming camelCase JSON keys to Python's snake_case attributes.
class ProfileUpdate(BaseModel):
    professional_title: Optional[str] = Field(None, alias='professionalTitle')
    bar_number: Optional[str] = Field(None, alias='barNumber')
    company_name: Optional[str] = Field(None, alias='companyName')
    phone: Optional[str] = Field(None, alias='phone')
    address: Optional[str] = Field(None, alias='address')
    court_preferences: Optional[str] = Field(None, alias='courtPreferences')
    signature_block: Optional[str] = Field(None, alias='signatureBlock')

    class Config:
        allow_population_by_field_name = True



# --- Get current user profile ---
@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    user_data = db["users"].find_one({"_id": ObjectId(current_user.id)})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "name": user_data.get("name") or "",
        "image": user_data.get("image") or "",
        "email": user_data.get("email") or "",
        "professionalTitle": user_data.get("professional_title"),
        "barNumber": user_data.get("bar_number"),
        "companyName": user_data.get("company_name"),
        "phone": user_data.get("phone"),
        "address": user_data.get("address"),
        "courtPreferences": user_data.get("court_preferences"),
        "signatureBlock": user_data.get("signature_block"),
    }



# --- Update current user profile ---
@router.put("/me")
def update_my_profile(update_data: ProfileUpdate, current_user: User = Depends(get_current_user)):
    update_fields = update_data.dict(exclude_unset=True)  # snake_case keys
    if not update_fields:
        raise HTTPException(status_code=400, detail="No changes provided")

    update_fields["updated_at"] = int(time.time())

    result = db["users"].update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_fields}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Profile updated successfully"}


@router.patch("/me/display")
def update_display(payload: dict, current_user: User = Depends(get_current_user)):
    updates = {}
    if "name" in payload and isinstance(payload["name"], str):
        updates["name"] = payload["name"]
        updates["name_source"] = "user"
    if "image" in payload and isinstance(payload["image"], str):
        updates["image"] = payload["image"]
        updates["image_source"] = "user"
    if not updates:
        raise HTTPException(status_code=400, detail="No changes provided")

    updates["updated_at"] = int(time.time())
    db["users"].update_one({"_id": ObjectId(current_user.id)}, {"$set": updates})
    return {"message": "Display updated"}



# --- Delete current user ---
# This endpoint was likely correct, but delete_one is not an async function in pymongo
@router.delete("/me")
def delete_my_account(current_user: User = Depends(get_current_user)):
    result = db["users"].delete_one({"_id": ObjectId(current_user.id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Account deleted successfully"}