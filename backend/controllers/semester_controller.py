from db.database import db
from models.semester_model import semester_create_model, semester_entity
from utils.logger import log_action

async def create_semester(current_user, data):
    dept = await db.departments.find_one({"_id": data["dept_id"]})
    if not dept:
        return {"error": "Department not found"}

    existing = await db.semesters.find_one({
        "dept_id": data["dept_id"],
        "sem_number": data["sem_number"]
    })
    if existing:
        return {"error": "Semester already exists"}

    sem_data = semester_create_model(
        data["dept_id"],
        data["sem_number"],
        data.get("status", "upcoming")
    )
    await db.semesters.insert_one(sem_data)
    
    await log_action(
        current_user, 
        "CREATE", 
        "SEMESTER", 
        sem_data["_id"], 
        f"{dept['short_name'].upper()} - SEM {data['sem_number']}"
    )
    return semester_entity(sem_data)

async def update_semester(current_user, sem_id: str, data):
    sem = await db.semesters.find_one({"_id": sem_id})
    if not sem:
        return {"error": "Semester not found"}

    dept = await db.departments.find_one({"_id": sem["dept_id"]})
    dept_name = dept["short_name"].upper() if dept else "UNKNOWN"

    await db.semesters.update_one({"_id": sem_id}, {"$set": data})
    
    await log_action(
        current_user, 
        "UPDATE", 
        "SEMESTER", 
        sem_id, 
        f"{dept_name} - SEM {sem['sem_number']}", 
        {"before": semester_entity(sem), "after": data}
    )

    updated = await db.semesters.find_one({"_id": sem_id})
    return semester_entity(updated)

async def delete_semester(current_user, sem_id: str):
    sem = await db.semesters.find_one({"_id": sem_id})
    if not sem:
        return {"error": "Semester not found"}

    dept = await db.departments.find_one({"_id": sem["dept_id"]})
    dept_name = dept["short_name"].upper() if dept else "UNKNOWN"

    await db.semesters.delete_one({"_id": sem_id})
    
    await log_action(
        current_user, 
        "DELETE", 
        "SEMESTER", 
        sem_id, 
        f"{dept_name} - SEM {sem['sem_number']}"
    )
    return {"message": "Semester deleted"}

async def get_all_semesters(dept_id: str):
    sems = await db.semesters.find({"dept_id": dept_id}).sort("sem_number", 1).to_list(None)
    return [semester_entity(s) for s in sems]