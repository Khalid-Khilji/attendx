from pydantic import BaseModel
from typing import Literal
from datetime import datetime

class RecordCreate(BaseModel):
    session_id: str
    student_id: str
    status: Literal["present", "review", "absent"]

class RecordBulkCreate(BaseModel):
    session_id: str
    records: list[RecordCreate]

class RecordReview(BaseModel):
    status: Literal["present", "absent"]

class RecordResponse(BaseModel):
    id: str
    session_id: str
    student_id: str
    status: str
    confidence: float
    marked_at: datetime

    class Config:
        populate_by_name = True