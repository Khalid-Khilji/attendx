from db.database import db
from models.student_enrollment_model import enrollment_create_model, enrollment_entity, enrollment_promote_update
from utils.logger import log_action
from datetime import datetime

async def enroll_student(current_user, data):
    batch_id = data.get("batch_id")
    if batch_id:
        batch = await db.batches.find_one({"_id": batch_id})
        if not batch: return {"error": "Batch not found"}

    enrollment_data = enrollment_create_model(
        data["student_id"], data["dept_id"], data["sem_id"], data["academic_year_id"], batch_id
    )
    await db.student_enrollments.insert_one(enrollment_data)
    return enrollment_entity(enrollment_data)

async def promote_student(current_user, student_id: str, data):
    current = await db.student_enrollments.find_one({"student_id": student_id, "status": "active"})
    if not current: return {"error": "No active enrollment"}

    await db.student_enrollments.update_one(
        {"_id": current["_id"]},
        {"$set": {"status": "promoted", "promoted_at": datetime.utcnow()}}
    )

    new_enrollment = enrollment_promote_update(data["next_sem_id"], data["next_academic_year_id"])
    new_enrollment["student_id"] = student_id
    new_enrollment["dept_id"] = current["dept_id"]
    new_enrollment["batch_id"] = data.get("next_batch_id")
    
    await db.student_enrollments.insert_one(new_enrollment)
    return enrollment_entity(new_enrollment)

async def get_sem_students(sem_id: str, batch_id: str = None):
    match_query = {"sem_id": sem_id, "status": "active"}
    if batch_id:
        match_query["batch_id"] = batch_id

    pipeline = [
        {"$match": match_query},
        {"$lookup": {"from": "student_details", "localField": "student_id", "foreignField": "_id", "as": "student"}},
        {"$unwind": "$student"},
        {"$lookup": {"from": "batches", "localField": "batch_id", "foreignField": "_id", "as": "batch"}},
        {"$unwind": {"path": "$batch", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": "$student._id", "first_name": "$student.first_name", "last_name": "$student.last_name",
                "roll_no": "$student.roll_no", "batch_name": "$batch.name"
            }
        }
    ]
    return await db.student_enrollments.aggregate(pipeline).to_list(None)

async def get_student_enrollment_history(student_id: str):
    pipeline = [
        {"$match": {"student_id": student_id}},
        {"$sort": {"created_at": -1}},
        {
            "$lookup": {
                "from": "semesters",
                "localField": "sem_id",
                "foreignField": "_id",
                "as": "semester_data"
            }
        },
        {"$unwind": {"path": "$semester_data", "preserveNullAndEmptyArrays": True}},
        {
            "$lookup": {
                "from": "batches",
                "localField": "batch_id",
                "foreignField": "_id",
                "as": "batch_data"
            }
        },
        {"$unwind": {"path": "$batch_data", "preserveNullAndEmptyArrays": True}},
        {
            "$lookup": {
                "from": "academic_years",
                "localField": "academic_year_id",
                "foreignField": "_id",
                "as": "ay_data"
            }
        },
        {"$unwind": {"path": "$ay_data", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 1,
                "student_id": 1,
                "dept_id": 1,
                "sem_id": 1,
                "sem_number": "$semester_data.sem_number",
                "batch_id": 1,
                "batch_name": "$batch_data.name",
                "academic_year_id": 1,
                "academic_year_label": "$ay_data.label",
                "status": 1,
                "promoted_at": 1,
                "created_at": 1
            }
        }
    ]
    
    return await db.student_enrollments.aggregate(pipeline).to_list(None)

async def update_enrollment(current_user, enrollment_id: str, data):
    enrollment = await db.student_enrollments.find_one({"_id": enrollment_id})
    if not enrollment:
        return {"error": "Enrollment not found"}
    
    update_data = {}
    if "sem_id" in data:
        update_data["sem_id"] = data["sem_id"]
    if "batch_id" in data:
        update_data["batch_id"] = data["batch_id"]
    if "academic_year_id" in data:
        update_data["academic_year_id"] = data["academic_year_id"]
    if "status" in data:
        update_data["status"] = data["status"]
    
    await db.student_enrollments.update_one(
        {"_id": enrollment_id},
        {"$set": update_data}
    )
    
    updated = await db.student_enrollments.find_one({"_id": enrollment_id})
    return enrollment_entity(updated)

async def delete_enrollment(current_user, enrollment_id: str):
    enrollment = await db.student_enrollments.find_one({"_id": enrollment_id})
    if not enrollment:
        return {"error": "Enrollment not found"}
    
    await db.student_enrollments.delete_one({"_id": enrollment_id})
    
    await log_action(
        current_user,
        "DELETE",
        "ENROLLMENT",
        enrollment_id,
        f"Deleted enrollment for student {enrollment['student_id']}"
    )
    
    return {"message": "Enrollment deleted successfully"}