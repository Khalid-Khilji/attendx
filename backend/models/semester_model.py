from datetime import datetime
import uuid

def semester_entity(sem) -> dict:
    return {
        "_id": str(sem["_id"]),
        "dept_id": sem["dept_id"],
        "academic_year_id": sem["academic_year_id"],
        "sem_number": sem["sem_number"],
        "status": sem["status"],
        "created_at": sem["created_at"]
    }

def semester_create_model(dept_id: str, academic_year_id: str, sem_number: int, status: str = "upcoming") -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "dept_id": dept_id,
        "academic_year_id": academic_year_id,
        "sem_number": sem_number,
        "status": status,        
        "created_at": datetime.utcnow()
    }