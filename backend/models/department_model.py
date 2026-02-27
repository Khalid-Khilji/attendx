import uuid
from datetime import datetime

def department_entity(dept) -> dict:
    return {
        "_id": dept["_id"],
        "name": dept["name"],
        "short_name": dept["short_name"],
        "created_at": dept["created_at"]
    }

def department_create_model(name: str, short_name: str):
    return {
        "_id": str(uuid.uuid4()),
        "name": name.lower(),
        "short_name": short_name.lower(),
        "created_at": datetime.utcnow()
    }