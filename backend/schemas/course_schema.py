from pydantic import BaseModel
from datetime import datetime

class CourseCreate(BaseModel):
    name: str
    course_code: str
    sem_id: str
    short_name: str | None = None

class CourseUpdate(BaseModel):
    name: str | None = None
    course_code: str | None = None
    short_name: str | None = None

class CourseResponse(BaseModel):
    id: str
    name: str
    course_code: str
    short_name: str | None
    sem_id: str
    created_at: datetime

    class Config:
        populate_by_name = True