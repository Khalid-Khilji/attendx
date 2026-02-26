from datetime import datetime
import uuid

def user_entity(user) -> dict:
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"]
    }


def user_create_model(email: str, password: str, role: str):
    return {
        "user_id": str(uuid.uuid4()),
        "email": email,
        "password": password,  
        "role": role,
        "created_at": datetime.utcnow()
    }