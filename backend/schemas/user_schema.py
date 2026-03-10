from pydantic import BaseModel, EmailStr
from typing import Literal
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Literal["admin", "teacher", "student"]

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        populate_by_name = True