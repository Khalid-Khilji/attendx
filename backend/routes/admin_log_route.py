from fastapi import APIRouter, Depends
from controllers.admin_log_controller import create_admin_log
from schemas.admin_log_schema import AdminLogCreate
from utils.dependencies import role_required

router = APIRouter(prefix="/api/admin/logs", tags=["Admin Logs"])

@router.post("/create")
async def add_admin_log(
    log: AdminLogCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await create_admin_log(current_user, log.dict())