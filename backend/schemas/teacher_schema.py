from pydantic import BaseModel
from datetime import datetime

class TeacherCreate(BaseModel):
    first_name: str
    last_name: str
    faculty_id: str
    dept_id: str

class TeacherResponse(BaseModel):
    _id: str
    first_name: str
    last_name: str
    faculty_id: str
    dept_id: str
    created_at: datetime