from datetime import datetime
import uuid

def course_entity(course) -> dict:
    return {
        "_id": str(course["_id"]),
        "name": course["name"],
        "course_code": course["course_code"],
        "sem_id": course["sem_id"],
        "created_at": course["created_at"]
    }

def course_create_model(name: str, course_code: str, sem_id: str) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "name": name.lower().strip(),
        "course_code": course_code.upper().strip(),
        "sem_id": sem_id,
        "created_at": datetime.utcnow()
    }