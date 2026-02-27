import uuid
from datetime import datetime

def semester_entity(sem) -> dict:
    return {
        "_id": sem["_id"],
        "dept_id": sem["dept_id"],
        "sem_number": sem["sem_number"],
        "is_active": sem["is_active"],
        "created_at": sem["created_at"]
    }

def semester_create_model(dept_id: str, sem_number: int, is_active: bool):
    return {
        "_id": str(uuid.uuid4()),
        "dept_id": dept_id,
        "sem_number": sem_number,
        "is_active": is_active,
        "created_at": datetime.utcnow()
    }