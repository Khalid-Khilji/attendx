from db.database import db
from models.batch_model import batch_create_model, batch_entity
from utils.logger import log_action

async def create_batch(current_user, data):
    sem = await db.semesters.find_one({"_id": data["sem_id"]})
    if not sem:
        return {"error": "Semester not found"}
    
    existing = await db.batches.find_one({
        "sem_id": data["sem_id"],
        "name": data["name"].upper().strip()
    })
    if existing:
        return {"error": "Batch name already exists in this semester"}

    batch_data = batch_create_model(data["sem_id"], data["name"])
    await db.batches.insert_one(batch_data)
    
    await log_action(
        current_user, 
        "CREATE", 
        "BATCH", 
        batch_data["_id"], 
        f"Batch {batch_data['name']} -> Sem {sem['sem_number']}"
    )
    
    return batch_entity(batch_data)

async def get_sem_batches(sem_id: str):
    batches = await db.batches.find({"sem_id": sem_id}).to_list(None)
    return [batch_entity(b) for b in batches]

async def delete_batch(current_user, batch_id: str):
    batch = await db.batches.find_one({"_id": batch_id})
    if not batch:
        return {"error": "Batch not found"}

    await db.batches.delete_one({"_id": batch_id})
    await log_action(current_user, "DELETE", "BATCH", batch_id, f"Batch {batch['name']}")
    
    return {"message": "Batch deleted"}