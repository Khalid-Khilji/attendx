import uuid
from datetime import datetime

def teacher_entity(teacher) -> dict:
    return {
        "_id": teacher["_id"],
        "first_name": teacher["first_name"],
        "last_name": teacher["last_name"],
        "faculty_id": teacher["faculty_id"],
        "dept_id": teacher["dept_id"],
        "created_at": teacher["created_at"]
    }

def teacher_create_model(user_id: str, first_name: str, last_name: str, faculty_id: str, dept_id: str):
    return {
        "_id": user_id,
        "user_id": user_id,
        "first_name": first_name.lower(),
        "last_name": last_name.lower(),
        "faculty_id": faculty_id.lower(),
        "dept_id": dept_id,
        "created_at": datetime.utcnow()
    }