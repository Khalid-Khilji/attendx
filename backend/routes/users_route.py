from fastapi import APIRouter, Depends
from controllers.user_controller import create_user, login_user, delete_user
from schemas.user_schema import UserCreate, UserLogin
from utils.dependencies import role_required

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("/create")
async def add_user(user: UserCreate):
    return await create_user(user.dict())

@router.post("/login")
async def login(user: UserLogin):
    return await login_user(user.dict())

@router.delete("/delete/{user_id}")
async def remove_user(
    user_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await delete_user(current_user, user_id)