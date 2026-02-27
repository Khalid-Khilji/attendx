from pydantic import BaseModel

class AdminLogCreate(BaseModel):
    action: str