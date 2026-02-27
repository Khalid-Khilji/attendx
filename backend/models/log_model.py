from datetime import datetime
import uuid

def log_entity(log) -> dict:
    return {
        "log_id": log["log_id"],
        "user_id": log["user_id"],
        "role": log["role"],
        "action_type": log["action_type"],
        "module": log["module"],
        "resource_id": log.get("resource_id"),
        "message": log["message"],
        "metadata": log.get("metadata"),
        "timestamp": log["timestamp"]
    }

def log_create_model(
    user_id: str,
    role: str,
    action_type: str,
    module: str,
    message: str,
    resource_id: str = None,
    metadata: dict = None
):
    return {
        "log_id": str(uuid.uuid4()),
        "user_id": user_id,
        "role": role,
        "action_type": action_type,
        "module": module,
        "resource_id": resource_id,
        "message": message,
        "metadata": metadata,
        "timestamp": datetime.utcnow()
    }