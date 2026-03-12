from pydantic import BaseModel
from typing import Literal, Optional, Dict, Any
from datetime import datetime

class LogCreate(BaseModel):
    actor_id: str
    actor_role: Literal["admin", "teacher"]
    action: Literal["CREATE", "UPDATE", "DELETE", "PROMOTE"]
    entity: str
    entity_id: str
    entity_name: str
    meta: Optional[Dict[str, Any]] = None

class LogResponse(BaseModel):
    id: str
    actor_id: str
    actor_role: str
    action: str
    entity: str
    entity_id: str
    entity_name: str
    meta: Optional[Dict[str, Any]]
    timestamp: datetime

    class Config:
        populate_by_name = True