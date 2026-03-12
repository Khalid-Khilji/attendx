from pydantic import BaseModel
from typing import Literal
from datetime import datetime

class SemesterCreate(BaseModel):
    dept_id: str
    sem_number: int
    status: str = "upcoming"

class SemesterUpdate(BaseModel):
    sem_number: int | None = None
    status: Literal["upcoming", "ongoing", "completed"] | None = None

class SemesterResponse(BaseModel):
    id: str
    dept_id: str
    sem_number: int
    status: str
    created_at: datetime

    class Config:
        populate_by_name = True