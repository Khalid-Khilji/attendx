from fastapi import APIRouter, Depends
from schemas.department_schema import DepartmentCreate, DepartmentUpdate
from controllers.department_controller import (
    create_department,
    update_department,
    delete_department,
    get_all_departments
)
from utils.dependencies import role_required

router = APIRouter(prefix="/api/departments", tags=["Departments"])

@router.post("/create")
async def add_department(
    dept: DepartmentCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await create_department(current_user, dept.model_dump())

@router.patch("/update/{dept_id}")
async def edit_department(
    dept_id: str,
    dept: DepartmentUpdate,
    current_user=Depends(role_required(["admin"]))
):
    return await update_department(current_user, dept_id, dept.model_dump(exclude_none=True))

@router.delete("/delete/{dept_id}")
async def remove_department(
    dept_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await delete_department(current_user, dept_id)

@router.get("/all")
async def list_departments(
    current_user=Depends(role_required(["admin", "teacher"]))
):
    return await get_all_departments()