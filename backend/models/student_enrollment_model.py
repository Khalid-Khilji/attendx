from datetime import datetime
import uuid

def enrollment_entity(enrollment) -> dict:
    return {
        "_id": str(enrollment["_id"]),
        "student_id": enrollment["student_id"],
        "dept_id": enrollment["dept_id"],
        "sem_id": enrollment["sem_id"],
        "academic_year_id": enrollment["academic_year_id"],
        "status": enrollment["status"],
        "promoted_at": enrollment.get("promoted_at"),
        "created_at": enrollment["created_at"]
    }

def enrollment_create_model(student_id: str, dept_id: str, sem_id: str, academic_year_id: str) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "student_id": student_id,
        "dept_id": dept_id,
        "sem_id": sem_id,
        "academic_year_id": academic_year_id,
        "status": "active",     
        "promoted_at": None,
        "created_at": datetime.utcnow()
    }

def enrollment_promote_update(next_sem_id: str, next_academic_year_id: str) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "sem_id": next_sem_id,
        "academic_year_id": next_academic_year_id,
        "status": "active",
        "promoted_at": None,
        "created_at": datetime.utcnow()
    }