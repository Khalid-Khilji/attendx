from datetime import datetime
import uuid

def department_entity(dept) -> dict:
    return {
        "_id": str(dept["_id"]),
        "name": dept["name"],
        "short_name": dept["short_name"],
        "created_at": dept["created_at"]
    }

def department_create_model(name: str, short_name: str) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "name": name.lower().strip(),
        "short_name": short_name.lower().strip(),
        "created_at": datetime.utcnow()
    }