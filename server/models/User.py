from pydantic import BaseModel , EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password : str
    
class User(BaseModel):
    id: str
    email: EmailStr