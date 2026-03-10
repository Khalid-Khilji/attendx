from fastapi import APIRouter, Depends, UploadFile, File, Form
from typing import List
from schemas.attendance_session_schema import SessionCreate
from controllers.attendance_session_controller import (
    create_session,
    get_course_sessions,
    mark_attendance_by_frames
)
from utils.dependencies import role_required

router = APIRouter(prefix="/api/sessions", tags=["Attendance Sessions"])

@router.post("/create")
async def start_session(
    session: SessionCreate,
    current_user=Depends(role_required(["teacher"]))
):
    return await create_session(current_user, session.model_dump())

@router.get("/{course_id}")
async def course_sessions(
    course_id: str,
    current_user=Depends(role_required(["admin", "teacher"]))
):
    return await get_course_sessions(course_id)

@router.post("/mark-by-frames/{session_id}")
async def mark_by_frames(
    session_id: str,
    frames: List[UploadFile] = File(...),
    current_user=Depends(role_required(["teacher"]))
):
    return await mark_attendance_by_frames(current_user, session_id, frames)