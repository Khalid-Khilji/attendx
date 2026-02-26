from fastapi import APIRouter
from controllers.user_controller import create_user, login_user
from schemas.user_schema import UserCreate, UserLogin

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("/create")
async def add_user(user: UserCreate):
    return await create_user(user.dict())

@router.post("/login")
async def login(user: UserLogin):
    return await login_user(user.dict())