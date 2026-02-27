from datetime import datetime
import uuid

def admin_log_entity(log) -> dict:
    return {
        "log_id": log["log_id"],
        "admin_id": log["admin_id"],
        "action": log["action"],
        "timestamp": log["timestamp"]
    }

def admin_log_create_model(admin_id: str, action: str):
    return {
        "log_id": str(uuid.uuid4()),
        "admin_id": admin_id,
        "action": action,
        "timestamp": datetime.utcnow()
    }