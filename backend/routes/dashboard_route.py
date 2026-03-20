from fastapi import APIRouter, Depends
from controllers.dashboard_controller import get_admin_dashboard, get_teacher_dashboard, get_student_dashboard
from utils.dependencies import role_required

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/admin")
async def admin_dashboard(current_user=Depends(role_required(["admin"]))):
    return await get_admin_dashboard()

@router.get("/teacher")
async def teacher_dashboard(current_user=Depends(role_required(["teacher"]))):
    return await get_teacher_dashboard(current_user)

@router.get("/student")
async def student_dashboard(current_user=Depends(role_required(["student"]))):
    return await get_student_dashboard(current_user)