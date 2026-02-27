from pydantic import BaseModel
from datetime import datetime
from typing import List

class CourseTeacher(BaseModel):
    teacher_id: str
    is_primary: bool

class CourseCreate(BaseModel):
    name: str
    sem_id: str
    teachers: List[CourseTeacher]

class CourseResponse(BaseModel):
    _id: str
    name: str
    sem_id: str
    teachers: List[CourseTeacher]
    created_at: datetime