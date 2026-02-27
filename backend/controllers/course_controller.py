from db.database import db
from models.course_model import course_create_model, course_entity

async def create_course(current_user, data):

    semester = await db.semesters.find_one({"_id": data["sem_id"]})
    if not semester:
        return {"error": "Semester not found"}

    existing = await db.courses.find_one({
        "name": data["name"].lower(),
        "sem_id": data["sem_id"]
    })

    if existing:
        return {"error": "Course already exists in this semester"}

    for teacher in data["teachers"]:
        t = await db.teacher_details.find_one({"_id": teacher["teacher_id"]})
        if not t:
            return {"error": f"Teacher {teacher['teacher_id']} not found"}

    course_data = course_create_model(
        data["name"],
        data["sem_id"],
        data["teachers"]
    )

    await db.courses.insert_one(course_data)

    return course_entity(course_data)

async def update_course(course_id: str, data):

    course = await db.courses.find_one({"_id": course_id})
    if not course:
        return {"error": "Course not found"}

    await db.courses.update_one(
        {"_id": course_id},
        {"$set": {
            "name": data["name"].lower(),
            "sem_id": data["sem_id"],
            "teachers": data["teachers"]
        }}
    )

    updated = await db.courses.find_one({"_id": course_id})

    return course_entity(updated)

async def delete_course(course_id: str):

    course = await db.courses.find_one({"_id": course_id})
    if not course:
        return {"error": "Course not found"}

    await db.courses.delete_one({"_id": course_id})

    return {"message": "Course deleted successfully"}

async def get_all_courses(sem_id: str = None):

    query = {}
    if sem_id:
        query["sem_id"] = sem_id

    courses = await db.courses.find(query).to_list(None)

    return [course_entity(course) for course in courses]

async def get_my_courses(current_user):

    teacher_id = current_user["user_id"]

    pipeline = [
        {
            "$match": {
                "teachers.teacher_id": teacher_id
            }
        },
        {
            "$lookup": {
                "from": "semesters",
                "localField": "sem_id",
                "foreignField": "_id",
                "as": "semester"
            }
        },
        {
            "$unwind": "$semester"
        },
        {
            "$lookup": {
                "from": "departments",
                "localField": "semester.dept_id",
                "foreignField": "_id",
                "as": "department"
            }
        },
        {
            "$unwind": "$department"
        },
        {
            "$project": {
                "_id": 1,
                "name": 1,
                "sem_id": 1,
                "created_at": 1,
                "teachers": 1,
                "semester_number": "$semester.sem_number",
                "department_name": "$department.name",
                "department_short": "$department.short_name"
            }
        }
    ]

    courses = await db.courses.aggregate(pipeline).to_list(None)

    return courses