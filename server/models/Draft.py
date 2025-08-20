# models/Draft.py
from pydantic import BaseModel
from typing import Optional

class Draft(BaseModel):
    slug: str
    draft_content: str
    timestamp: int
