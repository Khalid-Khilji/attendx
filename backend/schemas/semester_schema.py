from pydantic import BaseModel
from datetime import datetime

class SemesterCreate(BaseModel):
    dept_id: str
    sem_number: int
    is_active: bool

class SemesterResponse(BaseModel):
    _id: str
    dept_id: str
    sem_number: int
    is_active: bool
    created_at: datetime