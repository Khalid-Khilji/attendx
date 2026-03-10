from pydantic import BaseModel
from datetime import datetime

class CourseTeacherAssign(BaseModel):
    course_id: str
    teacher_id: str
    is_primary: bool = False

class CourseTeacherUpdate(BaseModel):
    is_primary: bool

class CourseTeacherResponse(BaseModel):
    id: str
    course_id: str
    teacher_id: str
    is_primary: bool
    assigned_at: datetime

    class Config:
        populate_by_name = True