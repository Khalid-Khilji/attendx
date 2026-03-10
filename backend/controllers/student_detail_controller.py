from db.database import db
from models.student_detail_model import student_create_model, student_entity
from utils.hash import hash_password
from utils.logger import log_action
from utils.imagekit import upload_image
from utils.face import extract_embedding
import uuid
from datetime import datetime

async def create_student(current_user, data):
    dept = await db.departments.find_one({"_id": data["dept_id"]})
    if not dept:
        return {"error": "Department not found"}

    existing = await db.student_details.find_one({"roll_no": data["roll_no"].upper().strip()})
    if existing:
        return {"error": "Roll number already exists"}

    first_name = data["first_name"].lower().strip()
    last_name = data["last_name"].lower().strip()
    roll_no = data["roll_no"].upper().strip()
    dept_short = dept["short_name"].lower()

    email = f"{roll_no.lower()}.{dept_short}@mhssce.ac.in"
    existing_email = await db.users.find_one({"email": email})
    if existing_email:
        return {"error": "User already exists"}

    raw_password = f"@{first_name.capitalize()}@{roll_no}"
    user_id = str(uuid.uuid4())

    user_data = {
        "_id": user_id,
        "email": email,
        "password": hash_password(raw_password),
        "role": "student",
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    await db.users.insert_one(user_data)

    student_data = student_create_model(user_id, first_name, last_name, roll_no, data["dept_id"])
    await db.student_details.insert_one(student_data)

    await log_action(current_user, "CREATE", "student", user_id)

    return {
        "student": student_entity(student_data),
        "email": email,
        "generated_password": raw_password
    }

async def update_student(current_user, student_id: str, data):
    student = await db.student_details.find_one({"_id": student_id})
    if not student:
        return {"error": "Student not found"}

    update = {k: v.lower().strip() if isinstance(v, str) else v for k, v in data.items()}
    await db.student_details.update_one({"_id": student_id}, {"$set": update})
    await log_action(current_user, "UPDATE", "student", student_id, {"before": student_entity(student), "after": update})

    updated = await db.student_details.find_one({"_id": student_id})
    return student_entity(updated)

async def delete_student(current_user, student_id: str):
    student = await db.student_details.find_one({"_id": student_id})
    if not student:
        return {"error": "Student not found"}

    await db.users.update_one({"_id": student_id}, {"$set": {"is_active": False}})
    await log_action(current_user, "DELETE", "student", student_id)
    return {"message": "Student disabled"}

async def get_all_students(sem_id: str = None, dept_id: str = None):
    if sem_id:
        enrollments = await db.student_enrollments.find(
            {"sem_id": sem_id, "status": "active"}
        ).to_list(None)
        student_ids = [e["student_id"] for e in enrollments]
        query = {"_id": {"$in": student_ids}}
    elif dept_id:
        query = {"dept_id": dept_id}
    else:
        query = {}

    students = await db.student_details.find(query).to_list(None)
    return [student_entity(s) for s in students]

async def get_my_profile(current_user):
    student = await db.student_details.find_one({"_id": current_user["user_id"]})
    if not student:
        return {"error": "Student not found"}
    return student_entity(student)

async def upload_face(current_user, student_id: str, file):
    student = await db.student_details.find_one({"_id": student_id})
    if not student:
        return {"error": "Student not found"}

    contents = await file.read()

    image_url = await upload_image(contents, f"students/{student_id}/profile.jpg")
    if not image_url:
        return {"error": "Image upload failed"}

    # ArcFace embedding extract
    embedding = await extract_embedding(contents)
    if embedding is None:
        return {"error": "Face not detected in image"}

    await db.student_details.update_one(
        {"_id": student_id},
        {"$set": {
            "profile_pic": image_url,
            "face_embedding": embedding
        }}
    )

    return {"message": "Face registered", "profile_pic": image_url}