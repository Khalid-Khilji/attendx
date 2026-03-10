from datetime import datetime, date
import uuid

def timetable_entity(slot) -> dict:
    return {
        "_id": str(slot["_id"]),
        "sem_id": slot["sem_id"],
        "course_id": slot["course_id"],
        "teacher_id": slot["teacher_id"],
        "academic_year_id": slot["academic_year_id"],
        "day_of_week": slot["day_of_week"],
        "start_time": slot["start_time"],
        "end_time": slot["end_time"],
        "version_tag": slot["version_tag"],
        "valid_from": slot["valid_from"],
        "valid_until": slot.get("valid_until"),
        "is_active": slot["is_active"],
        "created_at": slot["created_at"]
    }

def timetable_create_model(sem_id: str, course_id: str, teacher_id: str, academic_year_id: str, day_of_week: str, start_time: str, end_time: str, version_tag: str, valid_from: date) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "sem_id": sem_id,
        "course_id": course_id,
        "teacher_id": teacher_id,
        "academic_year_id": academic_year_id,
        "day_of_week": day_of_week,
        "start_time": start_time,
        "end_time": end_time,
        "version_tag": version_tag,
        "valid_from": valid_from,
        "valid_until": None,
        "is_active": True,
        "created_at": datetime.utcnow()
    }