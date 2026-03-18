from db.database import db
from models.teacher_detail_model import teacher_create_model, teacher_entity
from utils.hash import hash_password
from utils.logger import log_action
import uuid
import asyncio
from datetime import datetime

async def create_teacher(current_user, data):
    dept = await db.departments.find_one({"_id": data["dept_id"]})
    if not dept:
        return {"error": "Department not found"}

    existing_fid = await db.teacher_details.find_one({"faculty_id": data["faculty_id"].upper().strip()})
    if existing_fid:
        return {"error": "Faculty ID already exists"}

    first_name = data["first_name"].lower().strip()
    last_name = data["last_name"].lower().strip()
    faculty_id = data["faculty_id"].upper().strip()
    dept_short = dept["short_name"].upper()

    email = f"{first_name}.{faculty_id.lower()}.{dept_short.lower()}@mhssce.ac.in"

    existing_email = await db.users.find_one({"email": email})
    if existing_email:
        return {"error": "User already exists"}

    raw_password = f"@{first_name.capitalize()}@{last_name.capitalize()}"
    user_id = str(uuid.uuid4())

    user_data = {
        "_id": user_id,
        "email": email,
        "password": hash_password(raw_password),
        "role": "teacher",
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    await db.users.insert_one(user_data)

    teacher_data = teacher_create_model(user_id, first_name, last_name, faculty_id, data["dept_id"])
    await db.teacher_details.insert_one(teacher_data)

    await log_action(
        current_user, 
        "CREATE", 
        "TEACHER", 
        user_id, 
        f"{first_name} {last_name} ({faculty_id})"
    )

    return {
        "teacher": teacher_entity(teacher_data),
        "email": email,
        "generated_password": raw_password
    }

async def update_teacher(current_user, teacher_id: str, data):
    teacher = await db.teacher_details.find_one({"_id": teacher_id})
    if not teacher:
        return {"error": "Teacher not found"}

    update = {k: v.lower().strip() if isinstance(v, str) else v for k, v in data.items()}
    await db.teacher_details.update_one({"_id": teacher_id}, {"$set": update})
    
    await log_action(
        current_user, 
        "UPDATE", 
        "TEACHER", 
        teacher_id, 
        f"{teacher['first_name']} {teacher['last_name']} ({teacher['faculty_id']})", 
        {"changes": update}
    )

    updated = await db.teacher_details.find_one({"_id": teacher_id})
    return teacher_entity(updated)

async def delete_teacher(current_user, teacher_id: str):
    teacher = await db.teacher_details.find_one({"_id": teacher_id})
    if not teacher:
        return {"error": "Teacher not found"}

    await db.users.update_one({"_id": teacher_id}, {"$set": {"is_active": False}})
    
    await log_action(
        current_user, 
        "DELETE", 
        "TEACHER", 
        teacher_id, 
        f"{teacher['first_name']} {teacher['last_name']} ({teacher['faculty_id']})"
    )
    
    return {"message": "Teacher disabled"}

async def get_all_teachers():
    pipeline = [
        {
            "$lookup": {
                "from": "users",
                "localField": "_id",
                "foreignField": "_id",
                "as": "user"
            }
        },
        {"$unwind": "$user"},
        {
            "$lookup": {
                "from": "departments",
                "localField": "dept_id",
                "foreignField": "_id",
                "as": "department"
            }
        },
        {"$unwind": "$department"},
        {
            "$project": {
                "_id": 1,
                "user_id": 1,
                "first_name": 1,
                "last_name": 1,
                "faculty_id": 1,
                "dept_id": 1,
                "dept_name": "$department.name",
                "email": "$user.email",
                "is_active": "$user.is_active",
                "created_at": 1
            }
        }
    ]
    return await db.teacher_details.aggregate(pipeline).to_list(None)

async def get_my_profile(current_user):
    teacher_id = current_user["user_id"]
    
    teacher = await db.teacher_details.find_one({"_id": teacher_id})
    if not teacher:
        return {"error": "Teacher not found"}

    user, dept, total_courses, total_sessions = await asyncio.gather(
        db.users.find_one({"_id": teacher_id}),
        db.departments.find_one({"_id": teacher["dept_id"]}),
        db.course_teachers.count_documents({"teacher_id": teacher_id}),
        db.attendance_sessions.count_documents({"teacher_id": teacher_id}),
    )

    total_students_pipeline = [
        {"$match": {"teacher_id": teacher_id}},
        {"$lookup": {"from": "courses", "localField": "course_id", "foreignField": "_id", "as": "course"}},
        {"$unwind": "$course"},
        {"$lookup": {"from": "student_enrollments", "localField": "course.sem_id", "foreignField": "sem_id", "as": "enrollments"}},
        {"$unwind": "$enrollments"},
        {"$match": {"enrollments.status": "active"}},
        {"$group": {"_id": "$enrollments.student_id"}},
        {"$count": "total"}
    ]
    students_result = await db.course_teachers.aggregate(total_students_pipeline).to_list(None)
    total_students = students_result[0]["total"] if students_result else 0

    return {
        "_id": str(teacher["_id"]),
        "first_name": teacher["first_name"],
        "last_name": teacher["last_name"],
        "faculty_id": teacher["faculty_id"],
        "dept_id": teacher["dept_id"],
        "dept_name": dept["name"] if dept else "",
        "dept_short": dept["short_name"] if dept else "",
        "email": user["email"] if user else "",
        "is_active": user.get("is_active", True) if user else True,
        "created_at": teacher["created_at"],
        "stats": {
            "total_courses": total_courses,
            "total_sessions": total_sessions,
            "total_students": total_students,
        }
    }