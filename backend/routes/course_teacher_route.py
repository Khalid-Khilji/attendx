from fastapi import APIRouter, Depends
from schemas.course_teacher_schema import CourseTeacherAssign, CourseTeacherUpdate
from controllers.course_teacher_controller import (
    assign_teacher,
    update_teacher_assignment,
    remove_teacher,
    get_course_teachers,
)
from utils.dependencies import role_required

router = APIRouter(prefix="/api/course-teachers", tags=["Course Teachers"])

@router.post("/assign")
async def assign_teacher_to_course(
    data: CourseTeacherAssign,
    current_user=Depends(role_required(["admin"]))
):
    return await assign_teacher(current_user, data.model_dump())

@router.patch("/update/{ct_id}")
async def edit_assignment(
    ct_id: str,
    data: CourseTeacherUpdate,
    current_user=Depends(role_required(["admin"]))
):
    return await update_teacher_assignment(current_user, ct_id, data.model_dump(exclude_none=True))

@router.delete("/remove/{ct_id}")
async def remove_teacher_from_course(
    ct_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await remove_teacher(current_user, ct_id)

@router.get("/{course_id}")
async def list_course_teachers(
    course_id: str,
    current_user=Depends(role_required(["admin", "teacher"]))
):
    return await get_course_teachers(course_id)