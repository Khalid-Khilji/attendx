from pydantic import BaseModel
from typing import Optional, Dict

class LogCreate(BaseModel):
    message: str
    metadata: Optional[Dict] = None