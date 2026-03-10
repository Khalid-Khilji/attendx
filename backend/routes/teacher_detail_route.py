from fastapi import APIRouter, Depends
from schemas.teacher_detail_schema import TeacherCreate, TeacherUpdate
from controllers.teacher_detail_controller import (
    create_teacher,
    update_teacher,
    delete_teacher,
    get_all_teachers,
    get_my_profile
)
from utils.dependencies import role_required

router = APIRouter(prefix="/api/teachers", tags=["Teachers"])

@router.post("/create")
async def add_teacher(
    teacher: TeacherCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await create_teacher(current_user, teacher.model_dump())

@router.patch("/update/{teacher_id}")
async def edit_teacher(
    teacher_id: str,
    teacher: TeacherUpdate,
    current_user=Depends(role_required(["admin"]))
):
    return await update_teacher(current_user, teacher_id, teacher.model_dump(exclude_none=True))

@router.delete("/delete/{teacher_id}")
async def remove_teacher(
    teacher_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await delete_teacher(current_user, teacher_id)

@router.get("/all")
async def list_teachers(
    current_user=Depends(role_required(["admin"]))
):
    return await get_all_teachers()

@router.get("/me")
async def my_profile(
    current_user=Depends(role_required(["teacher"]))
):
    return await get_my_profile(current_user)