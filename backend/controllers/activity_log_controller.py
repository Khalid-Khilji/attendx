from db.database import db
from datetime import datetime

async def get_all_logs(
    actor_role: str = None,
    action: str = None,
    entity: str = None,
    start_date: str = None,
    end_date: str = None,
    page: int = 1,
    limit: int = 20
):
    match = {}
    if actor_role:
        match["actor_role"] = actor_role
    if action:
        match["action"] = action
    if entity:
        match["entity"] = entity
    if start_date and end_date:
        match["timestamp"] = {
            "$gte": datetime.fromisoformat(start_date),
            "$lte": datetime.fromisoformat(end_date)
        }

    pipeline = [
        {"$match": match},
        {
            "$lookup": {
                "from": "teacher_details",
                "localField": "actor_id",
                "foreignField": "_id",
                "as": "teacher"
            }
        },
        {
            "$unwind": {
                "path": "$teacher",
                "preserveNullAndEmptyArrays": True
            }
        },
        {"$sort": {"timestamp": -1}},
        {"$skip": (page - 1) * limit},
        {"$limit": limit},
        {
            "$project": {
                "_id": 1, "actor_id": 1, "actor_role": 1,
                "action": 1, "entity": 1, "entity_id": 1,
                "meta": 1, "timestamp": 1,
                "actor_name": {
                    "$cond": [
                        {"$eq": ["$actor_role", "teacher"]},
                        {"$concat": ["$teacher.first_name", " ", "$teacher.last_name"]},
                        "Admin"
                    ]
                },
                "faculty_id": {
                    "$cond": [
                        {"$eq": ["$actor_role", "teacher"]},
                        "$teacher.faculty_id",
                        None
                    ]
                }
            }
        }
    ]

    total = await db.activity_logs.count_documents(match)
    logs = await db.activity_logs.aggregate(pipeline).to_list(None)

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": -(-total // limit),
        "logs": logs
    }

async def get_my_logs(
    current_user,
    start_date: str = None,
    end_date: str = None,
    page: int = 1,
    limit: int = 20
):
    match = {"actor_id": current_user["user_id"]}
    if start_date and end_date:
        match["timestamp"] = {
            "$gte": datetime.fromisoformat(start_date),
            "$lte": datetime.fromisoformat(end_date)
        }

    total = await db.activity_logs.count_documents(match)
    logs = await db.activity_logs.find(match).sort(
        "timestamp", -1
    ).skip((page - 1) * limit).limit(limit).to_list(None)

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": -(-total // limit),
        "logs": logs
    }