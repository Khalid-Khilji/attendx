from datetime import datetime
import uuid

def course_entity(course) -> dict:
    return {
        "_id": str(course["_id"]),
        "name": course["name"],
        "course_code": course["course_code"],
        "short_name": course.get("short_name", ""),
        "sem_id": course["sem_id"],
        "created_at": course["created_at"]
    }

def course_create_model(name: str, course_code: str, sem_id: str, short_name: str = "") -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "name": name.lower().strip(),
        "course_code": course_code.upper().strip(),
        "short_name": short_name.upper().strip() if short_name else "",
        "sem_id": sem_id,
        "created_at": datetime.utcnow()
    }