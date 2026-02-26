from pydantic import BaseModel, EmailStr
from typing import Literal
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Literal["teacher", "student"]

class UserResponse(BaseModel):
    user_id: str
    email: EmailStr
    role: str
    created_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str