from pydantic import BaseModel
from datetime import datetime

class DepartmentCreate(BaseModel):
    name: str
    short_name: str

class DepartmentUpdate(BaseModel):
    name: str | None = None
    short_name: str | None = None

class DepartmentResponse(BaseModel):
    id: str
    name: str
    short_name: str
    created_at: datetime

    class Config:
        populate_by_name = True