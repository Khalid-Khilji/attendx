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