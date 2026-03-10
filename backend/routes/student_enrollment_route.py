from fastapi import APIRouter, Depends
from schemas.student_enrollment_schema import EnrollmentCreate, EnrollmentPromote
from controllers.student_enrollment_controller import (
    enroll_student,
    promote_student,
    get_student_enrollment_history,
    get_sem_students
)
from utils.dependencies import role_required

router = APIRouter(prefix="/api/enrollments", tags=["Enrollments"])

@router.post("/enroll")
async def enroll(
    data: EnrollmentCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await enroll_student(current_user, data.model_dump())

@router.post("/promote/{student_id}")
async def promote(
    student_id: str,
    data: EnrollmentPromote,
    current_user=Depends(role_required(["admin"]))
):
    return await promote_student(current_user, student_id, data.model_dump())

@router.get("/history/{student_id}")
async def enrollment_history(
    student_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await get_student_enrollment_history(student_id)

@router.get("/sem/{sem_id}")
async def students_in_sem(
    sem_id: str,
    current_user=Depends(role_required(["admin", "teacher"]))
):
    return await get_sem_students(sem_id)