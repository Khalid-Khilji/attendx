from pydantic import BaseModel
from datetime import datetime

class DepartmentCreate(BaseModel):
    name: str
    short_name: str

class DepartmentResponse(BaseModel):
    _id: str
    name: str
    short_name: str
    created_at: datetime