from datetime import datetime
import uuid

def user_entity(user) -> dict:
    return {
        "_id": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
        "is_active": user["is_active"],
        "created_at": user["created_at"]
    }

def user_create_model(email: str, password: str, role: str) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "email": email.lower().strip(),
        "password": password,
        "role": role,
        "is_active": True,
        "created_at": datetime.utcnow()
    }