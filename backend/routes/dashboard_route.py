from fastapi import APIRouter, Depends
from controllers.dashboard_controller import get_admin_dashboard
from utils.dependencies import role_required

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/admin")
async def admin_dashboard(current_user=Depends(role_required(["admin"]))):
    return await get_admin_dashboard()