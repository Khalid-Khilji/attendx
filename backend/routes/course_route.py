from fastapi import APIRouter, Depends
from schemas.course_schema import CourseCreate, CourseUpdate
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
    return await create_course(current_user, course.model_dump())

@router.patch("/update/{course_id}")
async def edit_course(
    course_id: str,
    course: CourseUpdate,
    current_user=Depends(role_required(["admin"]))
):
    return await update_course(current_user, course_id, course.model_dump(exclude_none=True))

@router.delete("/delete/{course_id}")
async def remove_course(
    course_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await delete_course(current_user, course_id)

@router.get("/my")
async def my_courses(
    current_user=Depends(role_required(["teacher"]))
):
    return await get_my_courses(current_user)

@router.get("/{sem_id}")
async def list_courses(
    sem_id: str,
    current_user=Depends(role_required(["admin", "teacher", "student"]))
):
    return await get_all_courses(sem_id)