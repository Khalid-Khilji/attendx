from fastapi import APIRouter, Depends
from controllers.activity_log_controller import get_all_logs, get_my_logs
from utils.dependencies import role_required

router = APIRouter(prefix="/api/logs", tags=["Logs"])

@router.get("/all")
async def list_all_logs(
    actor_role: str = None,
    action: str = None,
    entity: str = None,
    start_date: str = None,
    end_date: str = None,
    page: int = 1,
    limit: int = 20,
    current_user=Depends(role_required(["admin"]))
):
    return await get_all_logs(actor_role, action, entity, start_date, end_date, page, limit)

@router.get("/my")
async def list_my_logs(
    start_date: str = None,
    end_date: str = None,
    page: int = 1,
    limit: int = 20,
    current_user=Depends(role_required(["teacher"]))
):
    return await get_my_logs(current_user, start_date, end_date, page, limit)