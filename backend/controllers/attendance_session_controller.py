from db.database import db
from models.attendance_session_model import session_entity
from models.attendance_record_model import record_create_model
from utils.imagekit import upload_image
from utils.face import process_frames
from utils.logger import log_action
from datetime import datetime, time, date
import uuid

async def create_session(current_user, data):
    slot = await db.timetable.find_one({"_id": data["timetable_id"], "is_active": True})
    
    if not slot:
        return {"error": "Timetable slot not found"}

    course_id = slot.get("course_id")
    sem_id = slot.get("sem_id")
    teacher_id = slot.get("teacher_id")
    batch_id = slot.get("batch_id")

    course = await db.courses.find_one({"_id": course_id})
    course_name = course["name"] if course else "Unknown Course"

    session_date = data["date"]
    
    if isinstance(session_date, date) and not isinstance(session_date, datetime):
        query_date = datetime(session_date.year, session_date.month, session_date.day, 0, 0, 0)
    else:
        query_date = session_date

    date_str = query_date.strftime("%Y-%m-%d")
    
    existing = await db.attendance_sessions.find_one({
        "timetable_id": data["timetable_id"],
        "$expr": {
            "$eq": [
                {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}},
                date_str
            ]
        }
    })
    
    if existing:
        return {"error": f"Session already exists for {date_str}"}

    session_data = {
        "_id": str(uuid.uuid4()),
        "timetable_id": data["timetable_id"],
        "course_id": course_id,
        "sem_id": sem_id,
        "teacher_id": teacher_id,
        "batch_id": batch_id,
        "date": query_date,
        "group_photo": data.get("group_photo"),
        "created_at": datetime.utcnow()
    }
    
    await db.attendance_sessions.insert_one(session_data)
    
    display_date = query_date.strftime("%Y-%m-%d")
    
    await log_action(
        current_user, 
        "CREATE", 
        "ATTENDANCE_SESSION", 
        session_data["_id"], 
        f"{course_name} ({display_date})"
    )
    
    return {
        "_id": session_data["_id"],
        "timetable_id": session_data["timetable_id"],
        "course_id": session_data["course_id"],
        "sem_id": session_data["sem_id"],
        "teacher_id": session_data["teacher_id"],
        "batch_id": session_data["batch_id"],
        "date": session_data["date"],
        "group_photo": session_data["group_photo"],
        "created_at": session_data["created_at"]
    }

async def get_course_sessions(course_id: str):
    pipeline = [
        {"$match": {"course_id": course_id}},
        {"$sort": {"date": -1}},
        {
            "$lookup": {
                "from": "courses",
                "localField": "course_id",
                "foreignField": "_id",
                "as": "course_info"
            }
        },
        {"$unwind": {"path": "$course_info", "preserveNullAndEmptyArrays": True}},
        {
            "$lookup": {
                "from": "semesters",
                "localField": "sem_id",
                "foreignField": "_id",
                "as": "semester_info"
            }
        },
        {"$unwind": {"path": "$semester_info", "preserveNullAndEmptyArrays": True}},
        {
            "$lookup": {
                "from": "batches",
                "localField": "batch_id",
                "foreignField": "_id",
                "as": "batch_info"
            }
        },
        {"$unwind": {"path": "$batch_info", "preserveNullAndEmptyArrays": True}},
        {
            "$lookup": {
                "from": "teacher_details",
                "localField": "teacher_id",
                "foreignField": "_id",
                "as": "teacher_info"
            }
        },
        {"$unwind": {"path": "$teacher_info", "preserveNullAndEmptyArrays": True}},
        {
            "$lookup": {
                "from": "users",
                "localField": "teacher_info.user_id",
                "foreignField": "_id",
                "as": "user_info"
            }
        },
        {"$unwind": {"path": "$user_info", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 1,
                "timetable_id": 1,
                "course_id": 1,
                "course_code": "$course_info.course_code",
                "course_name": "$course_info.name",
                "sem_id": 1,
                "sem_number": "$semester_info.sem_number",
                "teacher_id": 1,
                "teacher_name": {
                    "$concat": [
                        {"$ifNull": ["$teacher_info.first_name", ""]},
                        " ",
                        {"$ifNull": ["$teacher_info.last_name", ""]}
                    ]
                },
                "teacher_email": "$user_info.email",
                "batch_id": 1,
                "batch_name": "$batch_info.name",
                "date": 1,
                "group_photo": 1,
                "created_at": 1
            }
        }
    ]
    return await db.attendance_sessions.aggregate(pipeline).to_list(None)

async def mark_attendance_by_frames(current_user, session_id: str, frames):
    session = await db.attendance_sessions.find_one({"_id": session_id})
    if not session:
        return {"error": "Session not found"}

    batch_id = session.get("batch_id")
    
    if batch_id:
        enrollments = await db.student_enrollments.find({
            "batch_id": batch_id,
            "status": "active"
        }).to_list(None)
        
        if not enrollments:
            batch = await db.batches.find_one({"_id": batch_id})
            batch_name = batch["name"] if batch else batch_id
            return {"error": f"No active students found in Batch {batch_name}"}
    else:
        enrollments = await db.student_enrollments.find({
            "sem_id": session["sem_id"],
            "status": "active"
        }).to_list(None)
        
        if not enrollments:
            return {"error": "No active enrollments found for this semester"}

    student_ids = [e["student_id"] for e in enrollments]

    students = await db.student_details.find({
        "_id": {"$in": student_ids},
        "face_embedding": {"$ne": None}
    }).to_list(None)

    if not students:
        return {"error": "No students in this batch have registered faces"}

    stored_embeddings = [
        {"student_id": s["_id"], "embedding": s["face_embedding"]}
        for s in students
    ]

    frames_bytes = [await f.read() for f in frames]
    face_result = await process_frames(frames_bytes, stored_embeddings)

    if "error" in face_result:
        return face_result

    detected_student_ids = [r["student_id"] for r in face_result["results"]]
    
    results_with_names = []
    student_map = {s["_id"]: s for s in students}
    
    for student in students:
        if student["_id"] in detected_student_ids:
            matched = next(r for r in face_result["results"] if r["student_id"] == student["_id"])
            results_with_names.append({
                "student_id": student["_id"],
                "name": f"{student['first_name']} {student['last_name']}".strip(),
                "roll_no": student["roll_no"],
                "status": matched["status"],
                "confidence": matched.get("confidence", 0.0)
            })
        else:
            results_with_names.append({
                "student_id": student["_id"],
                "name": f"{student['first_name']} {student['last_name']}".strip(),
                "roll_no": student["roll_no"],
                "status": "absent",
                "confidence": 0.0
            })

    if frames_bytes:
        image_url = await upload_image(frames_bytes[0], f"sessions/{session_id}/frame.jpg")
        if image_url:
            await db.attendance_sessions.update_one(
                {"_id": session_id},
                {"$set": {"group_photo": image_url}}
            )

    batch_name = None
    if batch_id:
        batch = await db.batches.find_one({"_id": batch_id})
        batch_name = batch["name"] if batch else None

    return {
        "session_id": session_id,
        "batch_id": batch_id,
        "batch_name": batch_name,
        "total_students": len(results_with_names),
        "present": sum(1 for r in results_with_names if r["status"] == "present"),
        "review": sum(1 for r in results_with_names if r["status"] == "review"),
        "absent": sum(1 for r in results_with_names if r["status"] == "absent"),
        "spoof_attempts": face_result["spoof_attempts"],
        "frames_processed": face_result["frames_processed"],
        "faces_detected": face_result["faces_detected"],
        "results": results_with_names
    }

async def confirm_attendance(current_user, session_id: str, results: list):
    session = await db.attendance_sessions.find_one({"_id": session_id})
    if not session:
        return {"error": "Session not found"}

    course = await db.courses.find_one({"_id": session["course_id"]})
    course_name = course["name"] if course else "Unknown Course"

    await db.attendance_records.delete_many({"session_id": session_id})

    records_to_insert = [
        record_create_model(session_id, r["student_id"], r["status"], r.get("confidence", 0.0))
        for r in results
    ]

    if records_to_insert:
        await db.attendance_records.insert_many(records_to_insert)

    await log_action(
        current_user,
        "CREATE",
        "ATTENDANCE_RECORDS",
        session_id,
        f"{course_name} ({session['date']})",
        {"present": sum(1 for r in results if r["status"] == "present")}
    )

    return {"message": "Attendance confirmed", "total": len(records_to_insert)}

async def cancel_session(current_user, session_id: str):
    session = await db.attendance_sessions.find_one({"_id": session_id})
    if not session:
        return {"error": "Session not found"}

    await db.attendance_records.delete_many({"session_id": session_id})
    await db.attendance_sessions.delete_one({"_id": session_id})

    await log_action(current_user, "DELETE", "ATTENDANCE_SESSION", session_id, "Session cancelled")
    return {"message": "Session cancelled"}