from db.database import db
from models.academic_year_model import academic_year_create_model, academic_year_entity
from utils.logger import log_action

async def create_academic_year(current_user, data):
    existing = await db.academic_years.find_one({"label": data["label"].strip()})
    if existing:
        return {"error": "Academic year already exists"}

    if data.get("is_current"):
        await db.academic_years.update_many({}, {"$set": {"is_current": False}})

    ay_data = academic_year_create_model(
        data["label"],
        data["start_date"],
        data["end_date"],
        data.get("is_current", False)
    )
    await db.academic_years.insert_one(ay_data)
    await log_action(current_user, "CREATE", "academic_year", ay_data["_id"])
    return academic_year_entity(ay_data)

async def update_academic_year(current_user, ay_id: str, data):
    ay = await db.academic_years.find_one({"_id": ay_id})
    if not ay:
        return {"error": "Academic year not found"}

    if data.get("is_current"):
        await db.academic_years.update_many(
            {"_id": {"$ne": ay_id}},
            {"$set": {"is_current": False}}
        )

    await db.academic_years.update_one({"_id": ay_id}, {"$set": data})
    await log_action(current_user, "UPDATE", "academic_year", ay_id, {"before": academic_year_entity(ay), "after": data})

    updated = await db.academic_years.find_one({"_id": ay_id})
    return academic_year_entity(updated)

async def delete_academic_year(current_user, ay_id: str):
    ay = await db.academic_years.find_one({"_id": ay_id})
    if not ay:
        return {"error": "Academic year not found"}

    await db.academic_years.delete_one({"_id": ay_id})
    await log_action(current_user, "DELETE", "academic_year", ay_id)
    return {"message": "Academic year deleted"}

async def get_all_academic_years():
    ays = await db.academic_years.find().sort("start_date", -1).to_list(None)
    return [academic_year_entity(ay) for ay in ays]

async def get_current_academic_year():
    ay = await db.academic_years.find_one({"is_current": True})
    if not ay:
        return {"error": "No current academic year set"}
    return academic_year_entity(ay)