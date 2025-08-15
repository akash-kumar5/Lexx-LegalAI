from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    designation: Optional[str] = None  # Advocate, Law Student, etc.
    enrollment_number: Optional[str] = None  # Bar council enrollment or student ID
    company_name: Optional[str] = None  # Firm/Chamber/Institution name
    address: Optional[str] = None
    phone: Optional[str] = None
    signature: Optional[str] = None  # Could store signature image URL or text
    seal: Optional[str] = None  # Firm seal/stamp image URL
