from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class TimetableCreate(BaseModel):
    sem_id: str
    course_id: str
    teacher_id: str
    batch_id: Optional[str] = None
    academic_year_id: str
    day_of_week: str
    start_time: str
    end_time: str
    version_tag: str
    valid_from: date

class TimetableUpdate(BaseModel):
    is_active: bool | None = None
    valid_until: date | None = None
    batch_id: str | None = None

class TimetableResponse(BaseModel):
    id: str
    sem_id: str
    course_id: str
    teacher_id: str
    batch_id: Optional[str]
    academic_year_id: str
    day_of_week: str
    start_time: str
    end_time: str
    version_tag: str
    valid_from: date
    valid_until: Optional[date]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True