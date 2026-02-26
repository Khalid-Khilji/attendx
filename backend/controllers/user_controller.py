from db.database import db
from utils.hash import hash_password, verify_password
from utils.jwt import create_access_token
from models.user_model import user_create_model, user_entity

async def create_user(data):

    existing = await db.users.find_one({"email": data["email"]})
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

    user = await db.users.find_one({"email": data["email"]})
    if not user:
        return {"error": "Invalid credentials"}

    if not verify_password(data["password"], user["password"]):
        return {"error": "Invalid credentials"}

    token = create_access_token({
        "user_id": user["user_id"],
        "role": user["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }