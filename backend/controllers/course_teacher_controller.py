from db.database import db
from models.course_teacher_model import course_teacher_create_model, course_teacher_entity
from utils.logger import log_action

async def assign_teacher(current_user, data):
    course = await db.courses.find_one({"_id": data["course_id"]})
    if not course:
        return {"error": "Course not found"}

    teacher = await db.teacher_details.find_one({"_id": data["teacher_id"]})
    if not teacher:
        return {"error": "Teacher not found"}

    batch_id = data.get("batch_id")
    if batch_id:
        batch = await db.batches.find_one({"_id": batch_id})
        if not batch:
            return {"error": "Batch not found"}

    existing = await db.course_teachers.find_one({
        "course_id": data["course_id"],
        "teacher_id": data["teacher_id"],
        "batch_id": batch_id
    })
    if existing:
        return {"error": "Teacher already assigned to this course/batch"}

    if data.get("is_primary"):
        await db.course_teachers.update_many(
            {"course_id": data["course_id"], "batch_id": batch_id},
            {"$set": {"is_primary": False}}
        )

    ct_data = course_teacher_create_model(
        data["course_id"],
        data["teacher_id"],
        batch_id,
        data.get("is_primary", False)
    )
    await db.course_teachers.insert_one(ct_data)
    
    log_msg = f"{teacher['first_name']} -> {course['name'].upper()}"
    if batch_id:
        batch = await db.batches.find_one({"_id": batch_id})
        log_msg += f" (Batch {batch['name']})"

    await log_action(current_user, "CREATE", "COURSE_TEACHER", ct_data["_id"], log_msg)
    return course_teacher_entity(ct_data)

async def update_teacher_assignment(current_user, ct_id: str, data):
    ct = await db.course_teachers.find_one({"_id": ct_id})
    if not ct:
        return {"error": "Assignment not found"}

    if data.get("is_primary"):
        await db.course_teachers.update_many(
            {"course_id": ct["course_id"], "batch_id": ct.get("batch_id"), "_id": {"$ne": ct_id}},
            {"$set": {"is_primary": False}}
        )

    await db.course_teachers.update_one({"_id": ct_id}, {"$set": data})
    updated = await db.course_teachers.find_one({"_id": ct_id})
    return course_teacher_entity(updated)

async def remove_teacher(current_user, ct_id: str):
    ct = await db.course_teachers.find_one({"_id": ct_id})
    if not ct:
        return {"error": "Assignment not found"}
    await db.course_teachers.delete_one({"_id": ct_id})
    return {"message": "Teacher removed"}

async def get_course_teachers(course_id: str):
    pipeline = [
        {"$match": {"course_id": course_id}},
        {"$lookup": {"from": "teacher_details", "localField": "teacher_id", "foreignField": "_id", "as": "teacher"}},
        {"$unwind": "$teacher"},
        {"$lookup": {"from": "batches", "localField": "batch_id", "foreignField": "_id", "as": "batch"}},
        {"$unwind": {"path": "$batch", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 1, "course_id": 1, "teacher_id": 1, "batch_id": 1, "is_primary": 1, "assigned_at": 1,
                "first_name": "$teacher.first_name", "last_name": "$teacher.last_name", "faculty_id": "$teacher.faculty_id",
                "batch_name": "$batch.name"
            }
        }
    ]
    return await db.course_teachers.aggregate(pipeline).to_list(None)