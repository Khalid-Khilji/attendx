import uuid
from datetime import datetime

def course_entity(course) -> dict:
    return {
        "_id": course["_id"],
        "name": course["name"],
        "sem_id": course["sem_id"],
        "teachers": course.get("teachers", []),
        "created_at": course["created_at"]
    }

def course_create_model(name: str, sem_id: str, teachers: list):
    return {
        "_id": str(uuid.uuid4()),
        "name": name.lower(),
        "sem_id": sem_id,
        "teachers": teachers,
        "created_at": datetime.utcnow()
    }