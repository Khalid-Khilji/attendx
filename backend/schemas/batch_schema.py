from pydantic import BaseModel
from datetime import datetime

class BatchCreate(BaseModel):
    sem_id: str
    name: str

class BatchResponse(BaseModel):
    id: str
    sem_id: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True