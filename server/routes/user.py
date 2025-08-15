# routes/user.py
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from utils.auth_utils import db, get_current_user
from models.User import User  # Pydantic model for current_user

router = APIRouter(prefix="/user")

# --- Pydantic model for profile updates ---
# This model now correctly mirrors the frontend's ProfileData state.
# It uses aliases to map incoming camelCase JSON keys to Python's snake_case attributes.
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, alias='fullName')
    professional_title: Optional[str] = Field(None, alias='professionalTitle')
    bar_number: Optional[str] = Field(None, alias='barNumber')
    company_name: Optional[str] = Field(None, alias='companyName')
    email: Optional[str] = Field(None, alias='email')
    phone: Optional[str] = Field(None, alias='phone')
    address: Optional[str] = Field(None, alias='address')
    court_preferences: Optional[str] = Field(None, alias='courtPreferences')
    signature_block: Optional[str] = Field(None, alias='signatureBlock')

    class Config:
        # This allows Pydantic to populate the model using the aliases
        allow_population_by_field_name = True


# --- Get current user profile ---
@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    user_data = db["users"].find_one({"_id": ObjectId(current_user.id)})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Map database fields (snake_case) back to frontend's expected camelCase keys.
    # This ensures the form is populated correctly on page load.
    profile_response = {
        "fullName": user_data.get("full_name"),
        "professionalTitle": user_data.get("professional_title"),
        "barNumber": user_data.get("bar_number"),
        "companyName": user_data.get("company_name"),
        "email": user_data.get("email"),
        "phone": user_data.get("phone"),
        "address": user_data.get("address"),
        "courtPreferences": user_data.get("court_preferences"),
        "signatureBlock": user_data.get("signature_block"),
    }
    return profile_response


# --- Update current user profile ---
@router.put("/me")
def update_my_profile(
    update_data: ProfileUpdate,  # Use the new, correct Pydantic model
    current_user: User = Depends(get_current_user)
):
    # Create a dictionary with snake_case keys from the validated model.
    # `exclude_unset=True` ensures we only update fields that were actually provided in the request.
    update_fields = update_data.dict(exclude_unset=True)

    if not update_fields:
        raise HTTPException(status_code=400, detail="No changes provided")

    # The $set operator updates the fields in the document or creates them if they don't exist.
    result = db["users"].update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_fields}
    )

    # Check if the user exists if no modifications were made
    if result.modified_count == 0:
        user_exists = db["users"].count_documents({"_id": ObjectId(current_user.id)}) > 0
        if not user_exists:
            raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Profile updated successfully"}


# --- Delete current user ---
# This endpoint was likely correct, but delete_one is not an async function in pymongo
@router.delete("/me")
def delete_my_account(current_user: User = Depends(get_current_user)):
    result = db["users"].delete_one({"_id": ObjectId(current_user.id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Account deleted successfully"}