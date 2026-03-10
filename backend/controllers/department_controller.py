from db.database import db
from models.department_model import department_create_model, department_entity
from utils.logger import log_action

async def create_department(current_user, data):
    name = data["name"].lower().strip()
    short_name = data["short_name"].lower().strip()

    existing = await db.departments.find_one({
        "$or": [{"name": name}, {"short_name": short_name}]
    })
    if existing:
        return {"error": "Department already exists"}

    dept_data = department_create_model(name, short_name)
    await db.departments.insert_one(dept_data)

    await log_action(current_user, "CREATE", "department", dept_data["_id"])
    return department_entity(dept_data)

async def update_department(current_user, dept_id: str, data):
    dept = await db.departments.find_one({"_id": dept_id})
    if not dept:
        return {"error": "Department not found"}

    update = {k: v.lower().strip() for k, v in data.items() if v}
    await db.departments.update_one({"_id": dept_id}, {"$set": update})

    await log_action(current_user, "UPDATE", "department", dept_id, {"before": department_entity(dept), "after": update})

    updated = await db.departments.find_one({"_id": dept_id})
    return department_entity(updated)

async def delete_department(current_user, dept_id: str):
    dept = await db.departments.find_one({"_id": dept_id})
    if not dept:
        return {"error": "Department not found"}

    await db.departments.delete_one({"_id": dept_id})
    await log_action(current_user, "DELETE", "department", dept_id)
    return {"message": "Department deleted"}

async def get_all_departments():
    depts = await db.departments.find().to_list(None)
    return [department_entity(d) for d in depts]