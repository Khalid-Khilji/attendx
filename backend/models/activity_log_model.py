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
        "entity_name": log.get("entity_name", "Unknown"),
        "meta": log.get("meta"),
        "timestamp": log["timestamp"]
    }

def log_create_model(actor_id: str, actor_role: str, action: str, entity: str, entity_id: str, entity_name: str, meta: dict = None) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "actor_id": actor_id,
        "actor_role": actor_role,   
        "action": action,         
        "entity": entity,           
        "entity_id": entity_id,
        "entity_name": entity_name,
        "meta": meta,              
        "timestamp": datetime.utcnow()
    }