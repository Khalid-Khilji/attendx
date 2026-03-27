from fastapi import APIRouter, Depends
from schemas.batch_schema import BatchCreate
from controllers.batch_controller import create_batch, get_sem_batches, delete_batch
from utils.dependencies import role_required

router = APIRouter(prefix="/api/batches", tags=["Batches"])

@router.post("/create")
async def add_batch(
    data: BatchCreate,
    current_user=Depends(role_required(["admin"]))
):
    return await create_batch(current_user, data.model_dump())

@router.get("/sem/{sem_id}")
async def list_sem_batches(
    sem_id: str,
    current_user=Depends(role_required(["admin", "teacher"]))
):
    return await get_sem_batches(sem_id)

@router.delete("/delete/{batch_id}")
async def remove_batch(
    batch_id: str,
    current_user=Depends(role_required(["admin"]))
):
    return await delete_batch(current_user, batch_id)