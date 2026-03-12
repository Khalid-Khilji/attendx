from db.database import db
from models.activity_log_model import log_create_model

async def log_action(current_user, action: str, entity: str, entity_id: str, entity_name: str, meta: dict = None):
    try:
        log_data = log_create_model(
            actor_id=current_user["user_id"],
            actor_role=current_user["role"],
            action=action,
            entity=entity,
            entity_id=str(entity_id),
            entity_name=entity_name,
            meta=meta
        )
        await db.activity_logs.insert_one(log_data)
    except Exception as e:
        print(f"Log error: {e}")