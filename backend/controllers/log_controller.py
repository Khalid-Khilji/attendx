from db.database import db
from datetime import datetime
from models.log_model import log_create_model, log_entity

async def get_all_logs(
    role: str = None,
    start_date: str = None,
    end_date: str = None,
    search: str = None,
    page: int = 1,
    limit: int = 10
):

    match_stage = {}

    if role:
        match_stage["role"] = role

    if start_date and end_date:
        match_stage["timestamp"] = {
            "$gte": datetime.fromisoformat(start_date),
            "$lte": datetime.fromisoformat(end_date)
        }

    pipeline = []

    if match_stage:
        pipeline.append({"$match": match_stage})

    pipeline.extend([
        {
            "$lookup": {
                "from": "teacher_details",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "teacher"
            }
        },
        {
            "$unwind": {
                "path": "$teacher",
                "preserveNullAndEmptyArrays": True
            }
        }
    ])

    if search:
        pipeline.append({
            "$match": {
                "$or": [
                    {"action": {"$regex": search, "$options": "i"}},
                    {"teacher.first_name": {"$regex": search, "$options": "i"}},
                    {"teacher.last_name": {"$regex": search, "$options": "i"}},
                    {"teacher.faculty_id": {"$regex": search, "$options": "i"}}
                ]
            }
        })

    pipeline.extend([
        {"$sort": {"timestamp": -1}},
        {"$skip": (page - 1) * limit},
        {"$limit": limit},
        {
            "$project": {
                "log_id": 1,
                "user_id": 1,
                "role": 1,
                "action": 1,
                "timestamp": 1,
                "teacher_name": {
                    "$cond": [
                        {"$eq": ["$role", "teacher"]},
                        {"$concat": ["$teacher.first_name", " ", "$teacher.last_name"]},
                        None
                    ]
                },
                "faculty_id": {
                    "$cond": [
                        {"$eq": ["$role", "teacher"]},
                        "$teacher.faculty_id",
                        None
                    ]
                }
            }
        }
    ])

    logs = await db.logs.aggregate(pipeline).to_list(None)

    return logs

async def get_my_logs(
    current_user,
    start_date: str = None,
    end_date: str = None,
    page: int = 1,
    limit: int = 10
):

    match_stage = {
        "user_id": current_user["user_id"]
    }

    if start_date and end_date:
        match_stage["timestamp"] = {
            "$gte": datetime.fromisoformat(start_date),
            "$lte": datetime.fromisoformat(end_date)
        }

    pipeline = [
        {"$match": match_stage},
        {"$sort": {"timestamp": -1}},
        {"$skip": (page - 1) * limit},
        {"$limit": limit}
    ]

    logs = await db.logs.aggregate(pipeline).to_list(None)

    return logs