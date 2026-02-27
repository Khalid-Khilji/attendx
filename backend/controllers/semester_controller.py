from db.database import db
from models.semester_model import semester_create_model, semester_entity

async def create_semester(current_user, data):

    existing = await db.semesters.find_one({
        "dept_id": data["dept_id"],
        "sem_number": data["sem_number"]
    })

    if existing:
        return {"error": "Semester already exists for this department"}

    sem_data = semester_create_model(
        data["dept_id"],
        data["sem_number"],
        data["is_active"]
    )

    await db.semesters.insert_one(sem_data)

    return semester_entity(sem_data)

async def update_semester(sem_id: str, data):

    semester = await db.semesters.find_one({"_id": sem_id})
    if not semester:
        return {"error": "Semester not found"}

    await db.semesters.update_one(
        {"_id": sem_id},
        {"$set": {
            "dept_id": data["dept_id"],
            "sem_number": data["sem_number"],
            "is_active": data["is_active"]
        }}
    )

    updated = await db.semesters.find_one({"_id": sem_id})

    return semester_entity(updated)

async def delete_semester(sem_id: str):

    semester = await db.semesters.find_one({"_id": sem_id})
    if not semester:
        return {"error": "Semester not found"}

    await db.semesters.delete_one({"_id": sem_id})

    return {"message": "Semester deleted successfully"}

async def get_all_semesters(dept_id: str = None):

    query = {}
    if dept_id:
        query["dept_id"] = dept_id

    semesters = await db.semesters.find(query).to_list(None)

    return [semester_entity(sem) for sem in semesters]