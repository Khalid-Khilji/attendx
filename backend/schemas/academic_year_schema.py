from pydantic import BaseModel
from datetime import date, datetime

class AcademicYearCreate(BaseModel):
    label: str
    start_date: date
    end_date: date
    is_current: bool = False

class AcademicYearUpdate(BaseModel):
    label: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool | None = None

class AcademicYearResponse(BaseModel):
    id: str
    label: str
    start_date: date
    end_date: date
    is_current: bool
    created_at: datetime

    class Config:
        populate_by_name = True