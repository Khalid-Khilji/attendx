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

    teacher_info = await db.teacher_details.find_one({"_id": teacher_id})
    teacher_name = f"{teacher_info.get('first_name', '')} {teacher_info.get('last_name', '')}" if teacher_info else "Teacher"

    unique_courses_pipeline = [
        {"$match": {"teacher_id": teacher_id}},
        {"$group": {"_id": "$course_id"}},
        {"$count": "total"}
    ]

    total_courses_result = await db.course_teachers.aggregate(unique_courses_pipeline).to_list(None)
    total_courses = total_courses_result[0]["total"] if total_courses_result else 0

    total_sessions = await db.attendance_sessions.count_documents({"teacher_id": teacher_id})
    todays_sessions = await db.attendance_sessions.count_documents({"teacher_id": teacher_id, "date": {"$gte": today}})

    recent_sessions = await db.attendance_sessions.find({"teacher_id": teacher_id}).sort("date", -1).limit(5).to_list(None)

    todays_slots_pipeline = [
        {"$match": {"teacher_id": teacher_id, "day_of_week": today_day, "is_active": True}},
        {"$lookup": {"from": "courses", "localField": "course_id", "foreignField": "_id", "as": "course"}},
        {"$unwind": "$course"},
        {"$lookup": {"from": "semesters", "localField": "sem_id", "foreignField": "_id", "as": "semester"}},
        {"$unwind": "$semester"},
        {"$lookup": {"from": "batches", "localField": "batch_id", "foreignField": "_id", "as": "batch"}},
        {"$unwind": {"path": "$batch", "preserveNullAndEmptyArrays": True}},
        {"$project": {
            "_id": 1, "start_time": 1, "end_time": 1, "course_id": "$course._id",
            "course_name": "$course.name", "course_code": "$course.course_code",
            "sem_number": "$semester.sem_number", "batch_name": "$batch.name"
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

    unique_slots = []
    seen_courses = set()
    for slot in todays_slots:
        if slot["course_id"] not in seen_courses:
            seen_courses.add(slot["course_id"])
            unique_slots.append(slot)

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
        "teacher_name": teacher_name,
        "stats": {
            "total_courses": total_courses,
            "total_students": total_students,
            "total_sessions": total_sessions,
            "todays_sessions": todays_sessions,
        },
        "todays_slots": unique_slots,
        "recent_sessions": sessions_with_course,
    }

async def get_student_dashboard(current_user):
    student_id = current_user["user_id"]

    student, enrollment = await asyncio.gather(
        db.student_details.find_one({"_id": student_id}),
        db.student_enrollments.find_one({"student_id": student_id, "status": "active"})
    )

    if not student:
        return {"error": "Student not found"}

    sem_id = enrollment["sem_id"] if enrollment else None

    attendance_pipeline = [
        {"$match": {"student_id": student_id}},
        {"$lookup": {"from": "attendance_sessions", "localField": "session_id", "foreignField": "_id", "as": "session"}},
        {"$unwind": "$session"},
        {"$lookup": {"from": "courses", "localField": "session.course_id", "foreignField": "_id", "as": "course"}},
        {"$unwind": "$course"},
        {"$group": {
            "_id": "$session.course_id",
            "course_name": {"$first": "$course.name"},
            "course_code": {"$first": "$course.course_code"},
            "total": {"$sum": 1},
            "present": {"$sum": {"$cond": [{"$eq": ["$status", "present"]}, 1, 0]}}
        }},
        {"$project": {
            "course_name": 1, "course_code": 1, "total": 1, "present": 1,
            "percentage": {"$round": [{"$multiply": [{"$divide": ["$present", "$total"]}, 100]}, 1]}
        }}
    ]

    todays_slots_pipeline = []
    if sem_id:
        today_day = datetime.utcnow().strftime("%A")
        todays_slots_pipeline = [
            {"$match": {"sem_id": sem_id, "day_of_week": today_day, "is_active": True}},
            {"$lookup": {"from": "courses", "localField": "course_id", "foreignField": "_id", "as": "course"}},
            {"$unwind": "$course"},
            {"$project": {
                "_id": 1, "start_time": 1, "end_time": 1, "day_of_week": 1,
                "course_name": "$course.name", "course_code": "$course.course_code"
            }},
            {"$sort": {"start_time": 1}}
        ]

    recent_records_pipeline = [
        {"$match": {"student_id": student_id}},
        {"$sort": {"marked_at": -1}},
        {"$limit": 5},
        {"$lookup": {"from": "attendance_sessions", "localField": "session_id", "foreignField": "_id", "as": "session"}},
        {"$unwind": "$session"},
        {"$lookup": {"from": "courses", "localField": "session.course_id", "foreignField": "_id", "as": "course"}},
        {"$unwind": "$course"},
        {"$project": {
            "_id": 1, "status": 1, "marked_at": 1,
            "course_name": "$course.name", "course_code": "$course.course_code",
            "date": "$session.date"
        }}
    ]

    tasks = [
        db.attendance_records.aggregate(attendance_pipeline).to_list(None),
        db.attendance_records.aggregate(recent_records_pipeline).to_list(None),
    ]
    if sem_id and todays_slots_pipeline:
        tasks.append(db.timetable.aggregate(todays_slots_pipeline).to_list(None))

    results = await asyncio.gather(*tasks)
    course_attendance = results[0]
    recent_records = results[1]
    todays_slots = results[2] if len(results) > 2 else []

    total_classes = sum(c["total"] for c in course_attendance)
    total_present = sum(c["present"] for c in course_attendance)
    overall_percentage = round((total_present / total_classes * 100), 1) if total_classes > 0 else 0

    dept = await db.departments.find_one({"_id": student["dept_id"]})

    return {
        "student": {
            "first_name": student["first_name"],
            "last_name": student["last_name"],
            "roll_no": student["roll_no"],
            "dept_name": dept["name"] if dept else "",
            "face_registered": student.get("face_embedding") is not None,
            "sem_number": enrollment["sem_id"] if enrollment else None,
        },
        "stats": {
            "total_classes": total_classes,
            "total_present": total_present,
            "overall_percentage": overall_percentage,
            "total_courses": len(course_attendance),
        },
        "course_attendance": course_attendance,
        "todays_slots": todays_slots,
        "recent_records": recent_records,
    }