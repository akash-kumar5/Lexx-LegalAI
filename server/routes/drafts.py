# routes/drafts.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from utils.auth_utils import db, get_current_user
from models.User import User  # to access current_user
from models.Draft import Draft

router = APIRouter(prefix="/drafts")

# --- Get all drafts for the current user ---
@router.get("/", response_model=List[Draft])
def get_my_drafts(current_user: User = Depends(get_current_user)):
    drafts = list(db["drafts"].find({"user_id": ObjectId(current_user.id)}))
    return [
        {
            "slug": d.get("slug"),
            "draft_content": d.get("draft_content"),
            "timestamp": d.get("timestamp"),
        }
        for d in drafts
    ]


# --- Save a new draft ---
@router.post("/")
def save_draft(draft: Draft, current_user: User = Depends(get_current_user)):
    new_draft = draft.dict()
    new_draft["user_id"] = ObjectId(current_user.id)
    db["drafts"].insert_one(new_draft)
    return {"message": "Draft saved successfully"}


# --- Update an existing draft (by timestamp) ---
@router.put("/{timestamp}")
def update_draft(
    timestamp: int,
    draft: Draft,
    current_user: User = Depends(get_current_user)
):
    result = db["drafts"].update_one(
        {"user_id": ObjectId(current_user.id), "timestamp": timestamp},
        {"$set": draft.dict()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Draft not found")
    return {"message": "Draft updated successfully"}


# --- Delete a draft (by timestamp) ---
@router.delete("/{timestamp}")
def delete_draft(timestamp: int, current_user: User = Depends(get_current_user)):
    result = db["drafts"].delete_one(
        {"user_id": ObjectId(current_user.id), "timestamp": timestamp}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Draft not found")
    return {"message": "Draft deleted successfully"}
