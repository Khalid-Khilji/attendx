from db.database import db
from models.attendance_session_model import session_create_model, session_entity
from models.attendance_record_model import record_create_model
from utils.imagekit import upload_image
from utils.face import process_frames
from utils.logger import log_action

async def create_session(current_user, data):
    slot = await db.timetable.find_one({"_id": data["timetable_id"], "is_active": True})
    if not slot:
        return {"error": "Timetable slot not found"}

    course = await db.courses.find_one({"_id": data["course_id"]})
    course_name = course["name"] if course else "Unknown Course"

    existing = await db.attendance_sessions.find_one({
        "timetable_id": data["timetable_id"],
        "date": data["date"]
    })
    if existing:
        return {"error": "Session already exists for this slot today"}

    session_data = session_create_model(
        data["timetable_id"], data["course_id"],
        data["sem_id"], data["teacher_id"],
        data["date"], data.get("group_photo")
    )
    await db.attendance_sessions.insert_one(session_data)
    
    await log_action(
        current_user, 
        "CREATE", 
        "ATTENDANCE_SESSION", 
        session_data["_id"], 
        f"{course_name} ({data['date']})"
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

    course = await db.courses.find_one({"_id": session["course_id"]})
    course_name = course["name"] if course else "Unknown Course"

    already = await db.attendance_records.find_one({"session_id": session_id})
    if already:
        return {"error": "Attendance already marked for this session"}

    enrollments = await db.student_enrollments.find({
        "sem_id": session["sem_id"],
        "status": "active"
    }).to_list(None)

    student_ids = [e["student_id"] for e in enrollments]

    students = await db.student_details.find({
        "_id": {"$in": student_ids},
        "face_embedding": {"$ne": None}
    }).to_list(None)

    if not students:
        return {"error": "No students with registered faces found"}

    stored_embeddings = [
        {"student_id": s["_id"], "embedding": s["face_embedding"]}
        for s in students
    ]

    frames_bytes = [await f.read() for f in frames]

    face_result = await process_frames(frames_bytes, stored_embeddings)

    if "error" in face_result:
        return face_result

    results = face_result["results"]

    records_to_insert = [
        record_create_model(session_id, r["student_id"], r["status"], r["confidence"])
        for r in results
        if r["status"] in ("present", "review", "absent")
    ]

    if records_to_insert:
        await db.attendance_records.insert_many(records_to_insert)

    if frames_bytes:
        image_url = await upload_image(frames_bytes[0], f"sessions/{session_id}/frame.jpg")
        if image_url:
            await db.attendance_sessions.update_one(
                {"_id": session_id},
                {"$set": {"group_photo": image_url}}
            )

    await log_action(
        current_user, 
        "CREATE", 
        "ATTENDANCE_RECORDS", 
        session_id, 
        f"{course_name} ({session['date']})",
        {"faces_detected": face_result["faces_detected"], "present": sum(1 for r in results if r["status"] == "present")}
    )

    present = sum(1 for r in results if r["status"] == "present")
    review = sum(1 for r in results if r["status"] == "review")
    absent = sum(1 for r in results if r["status"] == "absent")

    return {
        "session_id": session_id,
        "total_students": len(results),
        "present": present,
        "review": review,
        "absent": absent,
        "spoof_attempts": face_result["spoof_attempts"],
        "frames_processed": face_result["frames_processed"],
        "faces_detected": face_result["faces_detected"],
        "results": results
    }