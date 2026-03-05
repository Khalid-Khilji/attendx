from db.database import db
from models.semester_model import semester_create_model, semester_entity
from utils.logger import log_action

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

    await log_action(
        current_user,
        action_type="CREATE",
        module="SEMESTER",
        resource_id=sem_data["_id"],
        message=f"Created semester {data['sem_number']} for dept {data['dept_id']}"
    )

    return semester_entity(sem_data)

async def update_semester(current_user, sem_id: str, data):

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

    await log_action(
        current_user,
        action_type="UPDATE",
        module="SEMESTER",
        resource_id=sem_id,
        message=f"Updated semester {data['sem_number']}"
    )

    updated = await db.semesters.find_one({"_id": sem_id})

    return semester_entity(updated)

async def delete_semester(current_user, sem_id: str):

    semester = await db.semesters.find_one({"_id": sem_id})
    if not semester:
        return {"error": "Semester not found"}

    await db.semesters.delete_one({"_id": sem_id})

    await log_action(
        current_user,
        action_type="DELETE",
        module="SEMESTER",
        resource_id=sem_id,
        message=f"Deleted semester {semester['sem_number']}"
    )

    return {"message": "Semester deleted successfully"}

async def get_all_semesters(dept_id: str):
    query = {"dept_id": dept_id}
    
    semesters = await db.semesters.find(query).to_list(None)
    
    return [semester_entity(sem) for sem in semesters]