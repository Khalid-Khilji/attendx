from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime

class EnrollmentCreate(BaseModel):
    student_id: str
    dept_id: str
    sem_id: str
    academic_year_id: str
    batch_id: Optional[str] = None

class EnrollmentPromote(BaseModel):
    next_sem_id: str
    next_academic_year_id: str
    next_batch_id: Optional[str] = None

class EnrollmentResponse(BaseModel):
    id: str
    student_id: str
    dept_id: str
    sem_id: str
    batch_id: Optional[str]
    academic_year_id: str
    status: Literal["active", "promoted", "dropped", "graduated"]
    promoted_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True