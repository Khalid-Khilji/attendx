from datetime import datetime
import uuid

def batch_entity(batch) -> dict:
    return {
        "_id": str(batch["_id"]),
        "sem_id": batch["sem_id"],
        "name": batch["name"],
        "created_at": batch["created_at"]
    }

def batch_create_model(sem_id: str, name: str) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "sem_id": sem_id,
        "name": name.upper().strip(),
        "created_at": datetime.utcnow()
    }