from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class SessionCreate(BaseModel):
    timetable_id: str
    teacher_id: Optional[str] = None
    date: date
    group_photo: Optional[str] = None

class SessionResponse(BaseModel):
    id: str
    timetable_id: str
    course_id: str
    sem_id: str
    teacher_id: str
    date: date
    group_photo: Optional[str]
    created_at: datetime

    class Config:
        populate_by_name = True