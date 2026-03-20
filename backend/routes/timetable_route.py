from fastapi import APIRouter, Depends
from schemas.timetable_schema import TimetableCreate, TimetableUpdate
from controllers.timetable_controller import (
    create_slot,
    update_slot,
    delete_slot,
    get_sem_timetable,
    get_my_timetable,
    get_student_timetable
)
from utils.dependencies import role_required

router = APIRouter(prefix="/api/timetable", tags=["Timetable"])

@router.post("/create")
async def add_slot(
    slot: TimetableCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await create_slot(current_user, slot.model_dump())

@router.patch("/update/{slot_id}")
async def edit_slot(
    slot_id: str,
    slot: TimetableUpdate,
    current_user=Depends(role_required(["admin"]))
):
    return await update_slot(current_user, slot_id, slot.model_dump(exclude_none=True))

@router.delete("/delete/{slot_id}")
async def remove_slot(
    slot_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await delete_slot(current_user, slot_id)

@router.get("/sem/{sem_id}")
async def sem_timetable(
    sem_id: str,
    current_user=Depends(role_required(["admin", "teacher"]))
):
    return await get_sem_timetable(sem_id)

@router.get("/my")
async def my_timetable(
    current_user=Depends(role_required(["teacher"]))
):
    return await get_my_timetable(current_user)

@router.get("/student")
async def student_timetable(
    current_user=Depends(role_required(["student"]))
):
    return await get_student_timetable(current_user)