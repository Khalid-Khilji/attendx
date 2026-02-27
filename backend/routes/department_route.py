from fastapi import APIRouter, Depends
from schemas.department_schema import DepartmentCreate
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
    return await create_department(current_user, dept.dict())

@router.put("/update/{dept_id}")
async def edit_department(
    dept_id: str,
    dept: DepartmentCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await update_department(dept_id, dept.dict())

@router.delete("/delete/{dept_id}")
async def remove_department(
    dept_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await delete_department(dept_id)

@router.get("/all")
async def list_departments(
    current_user=Depends(role_required(["admin"]))
):
    return await get_all_departments()