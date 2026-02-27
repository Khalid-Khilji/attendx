from db.database import db
from datetime import datetime
import uuid

async def log_action(
    current_user: dict,
    action_type: str,
    module: str,
    message: str = "",
    resource_id: str = None,
    metadata: dict = None
):
    log_data = {
        "log_id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "role": current_user["role"],
        "action_type": action_type,
        "module": module,
        "resource_id": resource_id,
        "message": message,
        "metadata": metadata or {},
        "timestamp": datetime.utcnow()
    }

    await db.logs.insert_one(log_data)

    return log_data