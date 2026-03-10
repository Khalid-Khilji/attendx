from fastapi import APIRouter, Depends, UploadFile, File
from schemas.student_detail_schema import StudentCreate, StudentUpdate
from controllers.student_detail_controller import (
    create_student,
    update_student,
    delete_student,
    get_all_students,
    get_my_profile,
    upload_face
)
from utils.dependencies import role_required

router = APIRouter(prefix="/api/students", tags=["Students"])

@router.post("/create")
async def add_student(
    student: StudentCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await create_student(current_user, student.model_dump())

@router.patch("/update/{student_id}")
async def edit_student(
    student_id: str,
    student: StudentUpdate,
    current_user=Depends(role_required(["admin"]))
):
    return await update_student(current_user, student_id, student.model_dump(exclude_none=True))

@router.delete("/delete/{student_id}")
async def remove_student(
    student_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await delete_student(current_user, student_id)

@router.get("/all")
async def list_students(
    sem_id: str = None,
    dept_id: str = None,
    current_user=Depends(role_required(["admin", "teacher"]))
):
    return await get_all_students(sem_id, dept_id)

@router.get("/me")
async def my_profile(
    current_user=Depends(role_required(["student"]))
):
    return await get_my_profile(current_user)

@router.post("/face/{student_id}")
async def register_face(
    student_id: str,
    file: UploadFile = File(...),
    current_user=Depends(role_required(["admin"]))
):
    return await upload_face(current_user, student_id, file)