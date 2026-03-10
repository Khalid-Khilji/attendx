from pydantic import BaseModel
from datetime import datetime

class TeacherCreate(BaseModel):
    first_name: str
    last_name: str
    faculty_id: str
    dept_id: str

class TeacherUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    dept_id: str | None = None

class TeacherResponse(BaseModel):
    id: str
    user_id: str
    first_name: str
    last_name: str
    faculty_id: str
    dept_id: str
    created_at: datetime

    class Config:
        populate_by_name = True