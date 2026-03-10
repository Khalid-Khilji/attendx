from db.database import db
from models.course_model import course_create_model, course_entity
from utils.logger import log_action

async def create_course(current_user, data):
    sem = await db.semesters.find_one({"_id": data["sem_id"]})
    if not sem:
        return {"error": "Semester not found"}

    existing = await db.courses.find_one({
        "$or": [
            {"name": data["name"].lower(), "sem_id": data["sem_id"]},
            {"course_code": data["course_code"].upper()}
        ]
    })
    if existing:
        return {"error": "Course already exists"}

    course_data = course_create_model(data["name"], data["course_code"], data["sem_id"])
    await db.courses.insert_one(course_data)
    await log_action(current_user, "CREATE", "course", course_data["_id"])
    return course_entity(course_data)

async def update_course(current_user, course_id: str, data):
    course = await db.courses.find_one({"_id": course_id})
    if not course:
        return {"error": "Course not found"}

    update = {}
    if "name" in data:
        update["name"] = data["name"].lower().strip()
    if "course_code" in data:
        update["course_code"] = data["course_code"].upper().strip()

    await db.courses.update_one({"_id": course_id}, {"$set": update})
    await log_action(current_user, "UPDATE", "course", course_id, {"before": course_entity(course), "after": update})

    updated = await db.courses.find_one({"_id": course_id})
    return course_entity(updated)

async def delete_course(current_user, course_id: str):
    course = await db.courses.find_one({"_id": course_id})
    if not course:
        return {"error": "Course not found"}

    await db.courses.delete_one({"_id": course_id})
    await db.course_teachers.delete_many({"course_id": course_id})
    await log_action(current_user, "DELETE", "course", course_id)
    return {"message": "Course deleted"}

async def get_all_courses(sem_id: str):
    courses = await db.courses.find({"sem_id": sem_id}).to_list(None)
    return [course_entity(c) for c in courses]

async def get_my_courses(current_user):
    teacher_id = current_user["user_id"]

    pipeline = [
        {"$match": {"teacher_id": teacher_id}},
        {
            "$lookup": {
                "from": "courses",
                "localField": "course_id",
                "foreignField": "_id",
                "as": "course"
            }
        },
        {"$unwind": "$course"},
        {
            "$lookup": {
                "from": "semesters",
                "localField": "course.sem_id",
                "foreignField": "_id",
                "as": "semester"
            }
        },
        {"$unwind": "$semester"},
        {
            "$lookup": {
                "from": "departments",
                "localField": "semester.dept_id",
                "foreignField": "_id",
                "as": "department"
            }
        },
        {"$unwind": "$department"},
        {
            "$project": {
                "_id": "$course._id",
                "name": "$course.name",
                "course_code": "$course.course_code",
                "sem_id": "$course.sem_id",
                "is_primary": 1,
                "sem_number": "$semester.sem_number",
                "dept_name": "$department.name",
                "dept_short": "$department.short_name",
                "created_at": "$course.created_at"
            }
        }
    ]

    return await db.course_teachers.aggregate(pipeline).to_list(None)