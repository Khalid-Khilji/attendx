from fastapi import APIRouter, Depends
from schemas.academic_year_schema import AcademicYearCreate, AcademicYearUpdate
from controllers.academic_year_controller import (
    create_academic_year,
    update_academic_year,
    delete_academic_year,
    get_all_academic_years,
    get_current_academic_year
)
from utils.dependencies import role_required

router = APIRouter(prefix="/api/academic-years", tags=["Academic Years"])

@router.post("/")
async def create(
    data: AcademicYearCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await create_academic_year(current_user, data.model_dump())

@router.get("/")
async def get_all(
    current_user=Depends(role_required(["admin", "teacher"]))
):
    return await get_all_academic_years()

@router.get("/current")
async def get_current(
    current_user=Depends(role_required(["admin", "teacher"]))
):
    return await get_current_academic_year()

@router.patch("/{ay_id}")
async def update(
    ay_id: str,
    data: AcademicYearUpdate,
    current_user=Depends(role_required(["admin"]))
):
    return await update_academic_year(current_user, ay_id, data.model_dump(exclude_none=True))

@router.delete("/{ay_id}")
async def delete(
    ay_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await delete_academic_year(current_user, ay_id)