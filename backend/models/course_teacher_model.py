from datetime import datetime
import uuid

def course_teacher_entity(ct) -> dict:
    return {
        "_id": str(ct["_id"]),
        "course_id": ct["course_id"],
        "teacher_id": ct["teacher_id"],
        "is_primary": ct["is_primary"],
        "assigned_at": ct["assigned_at"]
    }

def course_teacher_create_model(course_id: str, teacher_id: str, is_primary: bool = False) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "course_id": course_id,
        "teacher_id": teacher_id,
        "is_primary": is_primary,
        "assigned_at": datetime.utcnow()
    }