from db.database import db
from models.attendance_record_model import record_create_model, record_entity
from utils.logger import log_action

async def mark_attendance(current_user, data):
    session = await db.attendance_sessions.find_one({"_id": data["session_id"]})
    if not session:
        return {"error": "Session not found"}

    course = await db.courses.find_one({"_id": session["course_id"]})
    course_name = course["name"] if course else "Unknown Course"

    results = []
    for record in data["records"]:
        existing = await db.attendance_records.find_one({
            "session_id": data["session_id"],
            "student_id": record["student_id"]
        })
        if existing:
            results.append({"student_id": record["student_id"], "status": "already marked"})
            continue

        record_data = record_create_model(
            data["session_id"],
            record["student_id"],
            record["status"]
        )
        await db.attendance_records.insert_one(record_data)
        results.append({"student_id": record["student_id"], "status": record["status"]})

    await log_action(
        current_user, 
        "CREATE", 
        "ATTENDANCE_BATCH", 
        data["session_id"], 
        f"{course_name} ({session['date']})",
        {"record_count": len(data["records"])}
    )
    return {"session_id": data["session_id"], "results": results}

async def get_session_records(session_id: str):
    pipeline = [
        {"$match": {"session_id": session_id}},
        {
            "$lookup": {
                "from": "student_details",
                "localField": "student_id",
                "foreignField": "_id",
                "as": "student"
            }
        },
        {"$unwind": "$student"},
        {
            "$lookup": {
                "from": "batches",
                "localField": "student.batch_id",
                "foreignField": "_id",
                "as": "batch"
            }
        },
        {"$unwind": {"path": "$batch", "preserveNullAndEmptyArrays": True}},
        {
            "$lookup": {
                "from": "departments",
                "localField": "student.dept_id",
                "foreignField": "_id",
                "as": "department"
            }
        },
        {"$unwind": {"path": "$department", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 1,
                "session_id": 1,
                "status": 1,
                "marked_at": 1,
                "student_id": 1,
                "roll_no": "$student.roll_no",
                "first_name": "$student.first_name",
                "last_name": "$student.last_name",
                "batch_id": "$student.batch_id",
                "batch_name": "$batch.name",
                "department_id": "$student.dept_id",
                "department_name": "$department.name"
            }
        }
    ]
    return await db.attendance_records.aggregate(pipeline).to_list(None)

async def get_student_attendance(student_id: str, course_id: str = None):
    match = {"student_id": student_id}

    if course_id:
        sessions = await db.attendance_sessions.find(
            {"course_id": course_id}
        ).to_list(None)
        session_ids = [s["_id"] for s in sessions]
        match["session_id"] = {"$in": session_ids}

    pipeline = [
        {"$match": match},
        {
            "$lookup": {
                "from": "attendance_sessions",
                "localField": "session_id",
                "foreignField": "_id",
                "as": "session"
            }
        },
        {"$unwind": "$session"},
        {
            "$lookup": {
                "from": "courses",
                "localField": "session.course_id",
                "foreignField": "_id",
                "as": "course"
            }
        },
        {"$unwind": "$course"},
        {
            "$project": {
                "_id": 1, "status": 1, "marked_at": 1,
                "date": "$session.date",
                "course_name": "$course.name",
                "course_code": "$course.course_code"
            }
        },
        {"$sort": {"date": -1}}
    ]

    records = await db.attendance_records.aggregate(pipeline).to_list(None)

    total = len(records)
    present = sum(1 for r in records if r["status"] == "present")
    percentage = round((present / total * 100), 2) if total > 0 else 0

    return {
        "student_id": student_id,
        "total_classes": total,
        "present": present,
        "absent": total - present,
        "percentage": percentage,
        "records": records
    }

async def update_record_status(current_user, record_id: str, data):
    record = await db.attendance_records.find_one({"_id": record_id})
    if not record:
        return {"error": "Record not found"}
    
    student = await db.student_details.find_one({"_id": record["student_id"]})
    student_name = f"{student['first_name']} {student['last_name']}" if student else "Unknown Student"

    await db.attendance_records.update_one(
        {"_id": record_id},
        {"$set": {"status": data["status"], "reviewed": True}}
    )

    await log_action(
        current_user, 
        "UPDATE", 
        "ATTENDANCE_RECORD", 
        record_id, 
        student_name,
        {"old_status": record["status"], "new_status": data["status"]}
    )

    return {"message": "Updated", "status": data["status"]}