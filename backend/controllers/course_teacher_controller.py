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
    course_teachers = await db.course_teachers.find({"course_id": course_id}).to_list(None)
    
    result = []
    for ct in course_teachers:
        teacher = await db.teacher_details.find_one({"_id": ct["teacher_id"]})
        if not teacher:
            continue
        
        batch_name = None
        batch_id = ct.get("batch_id")
        
        if batch_id is not None:
            batch = await db.batches.find_one({"_id": batch_id})
            if batch:
                batch_name = batch.get("name")
        
        first_name = teacher.get("first_name", "")
        last_name = teacher.get("last_name", "")
        
        if first_name:
            first_name = first_name[0].upper() + first_name[1:].lower()
        if last_name:
            last_name = last_name[0].upper() + last_name[1:].lower()
        
        result.append({
            "_id": ct["_id"],
            "course_id": ct["course_id"],
            "teacher_id": ct["teacher_id"],
            "batch_id": batch_id,
            "is_primary": ct.get("is_primary", False),
            "assigned_at": ct.get("assigned_at"),
            "first_name": first_name,
            "last_name": last_name,
            "faculty_id": teacher.get("faculty_id"),
            "batch_name": batch_name
        })
    
    return result