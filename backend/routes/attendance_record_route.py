from fastapi import APIRouter, Depends
from schemas.attendance_record_schema import RecordBulkCreate, RecordReview
from controllers.attendance_record_controller import (
    mark_attendance,
    get_session_records,
    get_student_attendance,
    update_record_status,
)
from utils.dependencies import role_required

router = APIRouter(prefix="/api/attendance", tags=["Attendance Records"])

@router.post("/mark")
async def mark(
    data: RecordBulkCreate,
    current_user=Depends(role_required(["teacher"]))
):
    return await mark_attendance(current_user, data.model_dump())

@router.get("/session/{session_id}")
async def session_records(
    session_id: str,
    current_user=Depends(role_required(["admin", "teacher"]))
):
    return await get_session_records(session_id)

@router.get("/my")
async def my_attendance(
    course_id: str = None,
    current_user=Depends(role_required(["student"]))
):
    return await get_student_attendance(current_user["user_id"], course_id)

@router.patch("/review/{record_id}")
async def review_record(
    record_id: str,
    data: RecordReview,
    current_user=Depends(role_required(["teacher"]))
):
    return await update_record_status(current_user, record_id, data.model_dump())