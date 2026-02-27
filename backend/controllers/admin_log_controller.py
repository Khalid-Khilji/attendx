from db.database import db
from models.admin_log_model import admin_log_create_model, admin_log_entity

async def create_admin_log(current_user, data):

    if current_user["role"] != "admin":
        return {"error": "Only admin can create logs"}

    log_data = admin_log_create_model(
        admin_id=current_user["user_id"],
        action=data["action"]
    )

    await db.admin_logs.insert_one(log_data)

    return admin_log_entity(log_data)