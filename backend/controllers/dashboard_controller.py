from db.database import db
from datetime import datetime
import asyncio

async def get_admin_dashboard():
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    (
        total_teachers,
        total_students,
        total_departments,
        total_courses,
        active_enrollments,
        face_registered,
        current_year,
        recent_logs,
        dept_stats_raw,
        todays_sessions
    ) = await asyncio.gather(
        db.teacher_details.count_documents({}),
        db.student_details.count_documents({}),
        db.departments.count_documents({}),
        db.courses.count_documents({}),
        db.student_enrollments.count_documents({"status": "active"}),
        db.student_details.count_documents({"face_embedding": {"$ne": None}}),
        db.academic_years.find_one({"is_current": True}),
        db.activity_logs.find().sort("timestamp", -1).limit(10).to_list(None),
        db.departments.aggregate([
            {"$lookup": {"from": "student_details", "localField": "_id", "foreignField": "dept_id", "as": "students"}},
            {"$project": {"name": 1, "short_name": 1, "student_count": {"$size": "$students"}}}
        ]).to_list(None),
        db.attendance_sessions.count_documents({"date": {"$gte": today}})
    )

    logs = [
        {
            "_id": str(log["_id"]),
            "actor_id": log.get("actor_id", ""),
            "actor_role": log.get("actor_role", ""),
            "action": log.get("action", ""),
            "entity": log.get("entity", ""),
            "entity_name": log.get("entity_name", ""),
            "created_at": log.get("timestamp", "")
        }
        for log in recent_logs
    ]

    dept_stats = [
        {
            "_id": str(d["_id"]),
            "name": d["name"],
            "short_name": d["short_name"],
            "student_count": d["student_count"]
        }
        for d in dept_stats_raw
    ]

    return {
        "counts": {
            "teachers": total_teachers,
            "students": total_students,
            "departments": total_departments,
            "courses": total_courses,
            "active_enrollments": active_enrollments,
            "face_registered": face_registered,
            "face_not_registered": total_students - face_registered,
            "todays_sessions": todays_sessions
        },
        "current_year": {"_id": str(current_year["_id"]), "label": current_year["label"]} if current_year else None,
        "dept_stats": dept_stats,
        "recent_logs": logs
    }

async def get_teacher_dashboard(current_user):
    teacher_id = current_user["user_id"]
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_day = datetime.utcnow().strftime("%A")

    total_courses, total_sessions, todays_sessions, recent_sessions = await asyncio.gather(
        db.course_teachers.count_documents({"teacher_id": teacher_id}),
        db.attendance_sessions.count_documents({"teacher_id": teacher_id}),
        db.attendance_sessions.count_documents({"teacher_id": teacher_id, "date": {"$gte": today}}),
        db.attendance_sessions.find({"teacher_id": teacher_id}).sort("date", -1).limit(5).to_list(None),
    )

    todays_slots_pipeline = [
        {"$match": {"teacher_id": teacher_id, "day_of_week": today_day, "is_active": True}},
        {"$lookup": {"from": "courses", "localField": "course_id", "foreignField": "_id", "as": "course"}},
        {"$unwind": "$course"},
        {"$lookup": {"from": "semesters", "localField": "sem_id", "foreignField": "_id", "as": "semester"}},
        {"$unwind": "$semester"},
        {"$project": {
            "_id": 1, "start_time": 1, "end_time": 1,
            "course_name": "$course.name", "course_code": "$course.course_code",
            "sem_number": "$semester.sem_number"
        }},
        {"$sort": {"start_time": 1}}
    ]

    total_students_pipeline = [
        {"$match": {"teacher_id": teacher_id}},
        {"$lookup": {"from": "courses", "localField": "course_id", "foreignField": "_id", "as": "course"}},
        {"$unwind": "$course"},
        {"$lookup": {"from": "student_enrollments", "localField": "course.sem_id", "foreignField": "sem_id", "as": "enrollments"}},
        {"$unwind": "$enrollments"},
        {"$match": {"enrollments.status": "active"}},
        {"$group": {"_id": "$enrollments.student_id"}},
        {"$count": "total"}
    ]

    todays_slots, students_result = await asyncio.gather(
        db.timetable.aggregate(todays_slots_pipeline).to_list(None),
        db.course_teachers.aggregate(total_students_pipeline).to_list(None),
    )

    total_students = students_result[0]["total"] if students_result else 0

    sessions_with_course = []
    for s in recent_sessions:
        course = await db.courses.find_one({"_id": s["course_id"]})
        sessions_with_course.append({
            "_id": str(s["_id"]),
            "course_name": course["name"] if course else "",
            "course_code": course["course_code"] if course else "",
            "date": s["date"],
        })

    return {
        "stats": {
            "total_courses": total_courses,
            "total_students": total_students,
            "total_sessions": total_sessions,
            "todays_sessions": todays_sessions,
        },
        "todays_slots": todays_slots,
        "recent_sessions": sessions_with_course,
    }