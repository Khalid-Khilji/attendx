from db.database import db
from utils.hash import hash_password, verify_password
from utils.jwt import create_access_token
from models.user_model import user_create_model, user_entity
from utils.logger import log_action

async def create_user(data):
    existing = await db.users.find_one({"email": data["email"].lower().strip()})
    if existing:
        return {"error": "Email already exists"}

    user_data = user_create_model(
        email=data["email"],
        password=hash_password(data["password"]),
        role=data["role"]
    )

    await db.users.insert_one(user_data)
    
    return user_entity(user_data)

async def login_user(data):
    user = await db.users.find_one({"email": data["email"].lower().strip()})
    if not user:
        return {"error": "Invalid credentials"}

    if not user.get("is_active", True):
        return {"error": "Account disabled"}

    if not verify_password(data["password"], user["password"]):
        return {"error": "Invalid credentials"}

    token = create_access_token({
        "user_id": str(user["_id"]),
        "role": user["role"]
    })

    current_user_context = {"user_id": str(user["_id"]), "role": user["role"]}
    await log_action(
        current_user_context, 
        "UPDATE", 
        "AUTH", 
        str(user["_id"]), 
        user['email'],
        {"action": "user_logged_in"}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_entity(user)
    }

async def delete_user(current_user, user_id: str):
    user = await db.users.find_one({"_id": user_id})
    if not user:
        return {"error": "User not found"}

    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"is_active": False}}
    )

    await log_action(
        current_user, 
        "DELETE", 
        "USER_ACCOUNT", 
        user_id, 
        user['email']
    )

    return {"message": "User disabled successfully"}