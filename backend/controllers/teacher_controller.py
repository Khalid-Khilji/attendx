from db.database import db
from models.teacher_model import teacher_create_model, teacher_entity
from controllers.user_controller import delete_user
from utils.hash import hash_password
import uuid
from datetime import datetime

async def create_teacher(current_user, data):

    first_name = data["first_name"].lower()
    last_name = data["last_name"].lower()
    faculty_id = data["faculty_id"].lower()
    dept_id = data["dept_id"]

    department = await db.departments.find_one({"_id": dept_id})
    if not department:
        return {"error": "Department not found"}

    dept_short = department["short_name"].lower()

    email = f"{first_name}.{faculty_id}.{dept_short}@mhssce.ac.in"

    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        return {"error": "User already exists"}

    first_name = data["first_name"].lower()
    last_name = data["last_name"].lower()

    first_name_cap = first_name.capitalize()
    last_name_cap = last_name.capitalize()

    raw_password = f"@{first_name_cap}@{last_name_cap}"
    hashed_password = hash_password(raw_password)

    user_id = str(uuid.uuid4())

    user_data = {
        "_id": user_id,
        "user_id": user_id,
        "email": email,
        "password": hashed_password,
        "role": "teacher",
        "created_at": datetime.utcnow()
    }

    await db.users.insert_one(user_data)

    teacher_data = teacher_create_model(
        user_id,
        first_name,
        last_name,
        faculty_id,
        dept_id
    )

    await db.teacher_details.insert_one(teacher_data)

    return {
        "teacher": teacher_entity(teacher_data),
        "email": email,
        "generated_password": raw_password
    }

async def delete_teacher(current_user, teacher_id: str):

    teacher = await db.teacher_details.find_one({"_id": teacher_id})
    if not teacher:
        return {"error": "Teacher not found"}

    await db.users.update_one(
        {"user_id": teacher_id},
        {"$set": {"is_active": False}}
    )

    await db.teacher_details.delete_one({"_id": teacher_id})

    return {"message": "Teacher disabled successfully"}

async def get_all_teachers():

    teachers = await db.teacher_details.find().to_list(None)

    return [teacher_entity(t) for t in teachers]

async def get_my_profile(current_user):

    teacher = await db.teacher_details.find_one({"_id": current_user["user_id"]})

    if not teacher:
        return {"error": "Teacher not found"}

    return teacher_entity(teacher)