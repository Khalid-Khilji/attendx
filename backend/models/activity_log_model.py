from datetime import datetime
import uuid

def log_entity(log) -> dict:
    return {
        "_id": str(log["_id"]),
        "actor_id": log["actor_id"],
        "actor_role": log["actor_role"],
        "action": log["action"],
        "entity": log["entity"],
        "entity_id": log["entity_id"],
        "meta": log.get("meta"),
        "timestamp": log["timestamp"]
    }

def log_create_model(actor_id: str, actor_role: str, action: str, entity: str, entity_id: str, meta: dict = None) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "actor_id": actor_id,
        "actor_role": actor_role,   
        "action": action,         
        "entity": entity,           
        "entity_id": entity_id,
        "meta": meta,              
        "timestamp": datetime.utcnow()
    }