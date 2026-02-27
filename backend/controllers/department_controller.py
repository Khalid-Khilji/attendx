from db.database import db
from models.department_model import department_create_model, department_entity
from utils.logger import log_action

async def create_department(current_user, data):

    name = data["name"].lower()
    short_name = data["short_name"].lower()

    existing = await db.departments.find_one({
        "$or": [
            {"name": name},
            {"short_name": short_name}
        ]
    })

    if existing:
        return {"error": "Department already exists"}

    dept_data = department_create_model(name, short_name)

    await db.departments.insert_one(dept_data)

    await log_action(
        current_user,
        action_type="CREATE",
        module="DEPARTMENT",
        resource_id=dept_data["_id"],
        message=f"Created department {name}"
    )

    return department_entity(dept_data)

async def update_department(current_user, dept_id: str, data):

    department = await db.departments.find_one({"_id": dept_id})
    if not department:
        return {"error": "Department not found"}

    name = data["name"].lower()
    short_name = data["short_name"].lower()

    await db.departments.update_one(
        {"_id": dept_id},
        {"$set": {
            "name": name,
            "short_name": short_name
        }}
    )

    await log_action(
        current_user,
        action_type="UPDATE",
        module="DEPARTMENT",
        resource_id=dept_id,
        message=f"Updated department {name}"
    )

    updated = await db.departments.find_one({"_id": dept_id})

    return department_entity(updated)

async def delete_department(current_user, dept_id: str):

    department = await db.departments.find_one({"_id": dept_id})
    if not department:
        return {"error": "Department not found"}

    await db.departments.delete_one({"_id": dept_id})

    await log_action(
        current_user,
        action_type="DELETE",
        module="DEPARTMENT",
        resource_id=dept_id,
        message=f"Deleted department {department['name']}"
    )

    return {"message": "Department deleted successfully"}

async def get_all_departments():

    departments = await db.departments.find().to_list(None)

    return [department_entity(dept) for dept in departments]