from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CourseTeacherAssign(BaseModel):
    course_id: str
    teacher_id: str
    batch_id: Optional[str] = None
    is_primary: bool = False

class CourseTeacherUpdate(BaseModel):
    is_primary: bool
    batch_id: Optional[str] = None

class CourseTeacherResponse(BaseModel):
    id: str
    course_id: str
    teacher_id: str
    batch_id: Optional[str]
    is_primary: bool
    assigned_at: datetime

    class Config:
        from_attributes = True