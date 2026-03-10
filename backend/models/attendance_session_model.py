from datetime import datetime, date
import uuid

def session_entity(session) -> dict:
    return {
        "_id": str(session["_id"]),
        "timetable_id": session["timetable_id"],
        "course_id": session["course_id"],
        "sem_id": session["sem_id"],
        "teacher_id": session["teacher_id"],
        "date": session["date"],
        "group_photo": session.get("group_photo"),
        "created_at": session["created_at"]
    }

def session_create_model(timetable_id: str, course_id: str, sem_id: str, teacher_id: str, session_date: date, group_photo: str = None) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "timetable_id": timetable_id,
        "course_id": course_id,
        "sem_id": sem_id,
        "teacher_id": teacher_id,
        "date": session_date,
        "group_photo": group_photo,
        "created_at": datetime.utcnow()
    }