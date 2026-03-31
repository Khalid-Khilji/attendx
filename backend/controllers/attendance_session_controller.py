from db.database import db
from models.attendance_session_model import session_create_model, session_entity
from models.attendance_record_model import record_create_model
from utils.imagekit import upload_image
from utils.face import process_frames
from utils.logger import log_action
from datetime import datetime, time, date

async def create_session(current_user, data):
    slot = await db.timetable.find_one({"_id": data["timetable_id"], "is_active": True})
    
    if not slot:
        return {"error": "Timetable slot not found"}

    course_id = slot.get("course_id")
    sem_id = slot.get("sem_id")
    teacher_id = slot.get("teacher_id")

    course = await db.courses.find_one({"_id": course_id})
    course_name = course["name"] if course else "Unknown Course"

    session_date = data["date"]
    if isinstance(session_date, date) and not isinstance(session_date, datetime):
        query_date = datetime.combine(session_date, time.min)
    else:
        query_date = session_date

    existing = await db.attendance_sessions.find_one({
        "timetable_id": data["timetable_id"],
        "date": query_date 
    })
    
    if existing:
        return {"error": "Session already exists for this slot today"}

    session_data = session_create_model(
        data["timetable_id"], 
        course_id, 
        sem_id, 
        teacher_id, 
        query_date,
        data.get("group_photo")
    )
    
    await db.attendance_sessions.insert_one(session_data)
    
    display_date = session_date.strftime("%Y-%m-%d") if isinstance(session_date, date) else str(session_date)
    
    await log_action(
        current_user, 
        "CREATE", 
        "ATTENDANCE_SESSION", 
        session_data["_id"], 
        f"{course_name} ({display_date})"
    )
    
    return session_entity(session_data)

async def get_course_sessions(course_id: str):
    sessions = await db.attendance_sessions.find(
        {"course_id": course_id}
    ).sort("date", -1).to_list(None)
    return [session_entity(s) for s in sessions]

async def mark_attendance_by_frames(current_user, session_id: str, frames):
    session = await db.attendance_sessions.find_one({"_id": session_id})
    if not session:
        return {"error": "Session not found"}

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
        return {"error": "No students in this class have registered faces"}

    stored_embeddings = [
        {"student_id": s["_id"], "embedding": s["face_embedding"]}
        for s in students
    ]

    frames_bytes = [await f.read() for f in frames]
    face_result = await process_frames(frames_bytes, stored_embeddings)

    if "error" in face_result:
        return face_result

    results = face_result["results"]
    
    student_map = {s["_id"]: s for s in students}
    results_with_names = []
    
    for r in results:
        s_detail = student_map.get(r["student_id"], {})
        results_with_names.append({
            **r,
            "name": f"{s_detail.get('first_name', '')} {s_detail.get('last_name', '')}".strip() or "Unknown",
            "roll_no": s_detail.get("roll_no", "N/A")
        })

    if frames_bytes:
        image_url = await upload_image(frames_bytes[0], f"sessions/{session_id}/frame.jpg")
        if image_url:
            await db.attendance_sessions.update_one(
                {"_id": session_id},
                {"$set": {"group_photo": image_url}}
            )

    return {
        "session_id": session_id,
        "total_students": len(results_with_names),
        "present": sum(1 for r in results if r["status"] == "present"),
        "review": sum(1 for r in results if r["status"] == "review"),
        "absent": sum(1 for r in results if r["status"] == "absent"),
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