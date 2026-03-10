from db.database import db
from models.student_enrollment_model import enrollment_create_model, enrollment_entity, enrollment_promote_update
from utils.logger import log_action

async def enroll_student(current_user, data):
    student = await db.student_details.find_one({"_id": data["student_id"]})
    if not student:
        return {"error": "Student not found"}

    sem = await db.semesters.find_one({"_id": data["sem_id"]})
    if not sem:
        return {"error": "Semester not found"}

    existing = await db.student_enrollments.find_one({
        "student_id": data["student_id"],
        "status": "active"
    })
    if existing:
        return {"error": "Student already has an active enrollment"}

    enrollment_data = enrollment_create_model(
        data["student_id"],
        data["dept_id"],
        data["sem_id"],
        data["academic_year_id"]
    )
    await db.student_enrollments.insert_one(enrollment_data)
    await log_action(current_user, "CREATE", "enrollment", enrollment_data["_id"])
    return enrollment_entity(enrollment_data)

async def promote_student(current_user, student_id: str, data):
    current_enrollment = await db.student_enrollments.find_one({
        "student_id": student_id,
        "status": "active"
    })
    if not current_enrollment:
        return {"error": "No active enrollment found"}

    next_sem = await db.semesters.find_one({"_id": data["next_sem_id"]})
    if not next_sem:
        return {"error": "Next semester not found"}

    await db.student_enrollments.update_one(
        {"_id": current_enrollment["_id"]},
        {"$set": {"status": "promoted", "promoted_at": __import__('datetime').datetime.utcnow()}}
    )

    new_enrollment = enrollment_promote_update(data["next_sem_id"], data["next_academic_year_id"])
    new_enrollment["student_id"] = student_id
    new_enrollment["dept_id"] = current_enrollment["dept_id"]
    await db.student_enrollments.insert_one(new_enrollment)

    await log_action(current_user, "PROMOTE", "student", student_id, {
        "from_sem": current_enrollment["sem_id"],
        "to_sem": data["next_sem_id"]
    })

    return enrollment_entity(new_enrollment)

async def get_student_enrollment_history(student_id: str):
    enrollments = await db.student_enrollments.find(
        {"student_id": student_id}
    ).sort("created_at", 1).to_list(None)
    return [enrollment_entity(e) for e in enrollments]

async def get_sem_students(sem_id: str):
    pipeline = [
        {"$match": {"sem_id": sem_id, "status": "active"}},
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
            "$project": {
                "_id": "$student._id",
                "first_name": "$student.first_name",
                "last_name": "$student.last_name",
                "roll_no": "$student.roll_no",
                "profile_pic": "$student.profile_pic",
                "enrollment_id": "$_id",
                "academic_year_id": 1,
                "status": 1
            }
        }
    ]
    return await db.student_enrollments.aggregate(pipeline).to_list(None)