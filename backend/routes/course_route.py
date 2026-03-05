from fastapi import APIRouter, Depends
from schemas.course_schema import CourseCreate
from controllers.course_controller import (
    create_course,
    update_course,
    delete_course,
    get_all_courses,
    get_my_courses
)
from utils.dependencies import role_required

router = APIRouter(prefix="/api/courses", tags=["Courses"])

@router.post("/create")
async def add_course(
    course: CourseCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await create_course(current_user, course.dict())

@router.put("/update/{course_id}")
async def edit_course(
    course_id: str,
    course: CourseCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await update_course(current_user, course_id, course.dict())

@router.delete("/delete/{course_id}")
async def remove_course(
    course_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await delete_course(current_user, course_id)

@router.get("/{dept_id}/{sem_id}")
async def list_courses(
    dept_id: str,
    sem_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await get_all_courses(sem_id)

@router.get("/my")
async def my_courses(
    current_user=Depends(role_required(["teacher"]))
):
    return await get_my_courses(current_user)