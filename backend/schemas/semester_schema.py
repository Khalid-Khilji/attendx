from pydantic import BaseModel
from typing import Literal
from datetime import datetime

class SemesterCreate(BaseModel):
    dept_id: str
    academic_year_id: str
    sem_number: int
    status: Literal["upcoming", "ongoing", "completed"] = "upcoming"

class SemesterUpdate(BaseModel):
    status: Literal["upcoming", "ongoing", "completed"] | None = None

class SemesterResponse(BaseModel):
    id: str
    dept_id: str
    academic_year_id: str
    sem_number: int
    status: str
    created_at: datetime

    class Config:
        populate_by_name = True