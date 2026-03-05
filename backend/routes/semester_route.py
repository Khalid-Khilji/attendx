from fastapi import APIRouter, Depends
from schemas.semester_schema import SemesterCreate
from controllers.semester_controller import (
    create_semester,
    update_semester,
    delete_semester,
    get_all_semesters
)
from utils.dependencies import role_required

router = APIRouter(prefix="/api/semesters", tags=["Semesters"])

@router.post("/create")
async def add_semester(
    sem: SemesterCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await create_semester(current_user, sem.dict())

@router.put("/update/{sem_id}")
async def edit_semester(
    sem_id: str,
    sem: SemesterCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await update_semester(current_user, sem_id, sem.dict())

@router.delete("/delete/{sem_id}")
async def remove_semester(
    sem_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await delete_semester(current_user, sem_id)

@router.get("/{dept_id}")
async def list_semesters(
    dept_id: str, 
    current_user=Depends(role_required(["admin"]))
):
    return await get_all_semesters(dept_id)