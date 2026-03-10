from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    roll_no: str
    dept_id: str
    profile_pic: Optional[str] = None

class StudentUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    profile_pic: str | None = None

class StudentResponse(BaseModel):
    id: str
    user_id: str
    first_name: str
    last_name: str
    roll_no: str
    dept_id: str
    profile_pic: Optional[str]
    created_at: datetime

    class Config:
        populate_by_name = True