from db.database import db
from models.timetable_model import timetable_create_model, timetable_entity
from utils.logger import log_action
from datetime import datetime, date, time

def to_datetime(d):
    if isinstance(d, date) and not isinstance(d, datetime):
        return datetime.combine(d, time.min)
    return d

async def create_slot(current_user, data):
    if "valid_from" in data: data["valid_from"] = to_datetime(data["valid_from"])
    
    batch_id = data.get("batch_id")
    
    conflict = await db.timetable.find_one({
        "teacher_id": data["teacher_id"],
        "day_of_week": data["day_of_week"],
        "start_time": data["start_time"],
        "is_active": True
    })
    if conflict:
        return {"error": "Teacher already has a class at this time"}

    slot_data = timetable_create_model(
        data["sem_id"], data["course_id"], data["teacher_id"],
        data["academic_year_id"], data["day_of_week"],
        data["start_time"], data["end_time"],
        data["version_tag"], data["valid_from"],
        batch_id
    )
    await db.timetable.insert_one(slot_data)
    return timetable_entity(slot_data)

async def update_slot(current_user, slot_id: str, data):
    await db.timetable.update_one({"_id": slot_id}, {"$set": data})
    updated = await db.timetable.find_one({"_id": slot_id})
    return timetable_entity(updated)

async def delete_slot(current_user, slot_id: str):
    await db.timetable.delete_one({"_id": slot_id})
    return {"message": "Slot deleted"}

async def get_sem_timetable(sem_id: str, batch_id: str = None): 
    match_query = {"sem_id": sem_id, "is_active": True}
    
    if batch_id:
        match_query["batch_id"] = batch_id

    pipeline = [
        {"$match": match_query},
        {"$lookup": {"from": "courses", "localField": "course_id", "foreignField": "_id", "as": "course"}},
        {"$unwind": {"path": "$course", "preserveNullAndEmptyArrays": True}},
        {"$lookup": {"from": "batches", "localField": "batch_id", "foreignField": "_id", "as": "batch"}},
        {"$unwind": {"path": "$batch", "preserveNullAndEmptyArrays": True}},
        {"$lookup": {"from": "teacher_details", "localField": "teacher_id", "foreignField": "_id", "as": "teacher"}},
        {"$unwind": {"path": "$teacher", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 1, "day_of_week": 1, "start_time": 1, "end_time": 1, "course_id": 1, "batch_id": 1,
                "course_name": "$course.name", 
                "batch_name": {"$ifNull": ["$batch.name", "Theory (All Batches)"]}, # Batch ka naam clear dikhega
                "teacher_name": {"$concat": ["$teacher.first_name", " ", "$teacher.last_name"]}
            }
        },
        {"$sort": {"day_of_week": 1, "start_time": 1}}
    ]
    return await db.timetable.aggregate(pipeline).to_list(None)

async def get_my_timetable(current_user):
    teacher_id = current_user.get("user_id")
    pipeline = [
        {"$match": {"teacher_id": teacher_id, "is_active": True}},
        {"$lookup": {"from": "courses", "localField": "course_id", "foreignField": "_id", "as": "course"}},
        {"$unwind": "$course"},
        {"$lookup": {"from": "semesters", "localField": "sem_id", "foreignField": "_id", "as": "semester"}},
        {"$unwind": "$semester"},
        {"$lookup": {"from": "batches", "localField": "batch_id", "foreignField": "_id", "as": "batch"}},
        {"$unwind": {"path": "$batch", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 1, "day_of_week": 1, "start_time": 1, "end_time": 1,
                "course_id": 1, "sem_id": 1, "teacher_id": 1, "batch_id": 1,
                "course_name": "$course.name",
                "course_code": "$course.course_code",
                "sem_number": "$semester.sem_number",
                "batch_name": {"$ifNull": ["$batch.name", None]}
            }
        },
        {"$sort": {"day_of_week": 1, "start_time": 1}}
    ]
    return await db.timetable.aggregate(pipeline).to_list(None)
    
async def get_student_timetable(current_user):
    enrollment = await db.student_enrollments.find_one({"student_id": current_user["user_id"], "status": "active"})
    if not enrollment: return []
    
    student_batch_id = enrollment.get("batch_id")
    
    pipeline = [
        {
            "$match": {
                "sem_id": enrollment["sem_id"], 
                "is_active": True,
                "$or": [
                    {"batch_id": None}, 
                    {"batch_id": student_batch_id}
                ]
            }
        },
        {"$lookup": {"from": "courses", "localField": "course_id", "foreignField": "_id", "as": "course"}},
        {"$unwind": "$course"},
        {"$lookup": {"from": "batches", "localField": "batch_id", "foreignField": "_id", "as": "batch"}},
        {"$unwind": {"path": "$batch", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 1, "day_of_week": 1, "start_time": 1, "end_time": 1,
                "course_name": "$course.name",
                "batch_name": {"$ifNull": ["$batch.name", "Theory"]},
                "is_batch_specific": {"$cond": [{"$ifNull": ["$batch_id", False]}, True, False]}
            }
        },
        {"$sort": {"day_of_week": 1, "start_time": 1}}
    ]
    return await db.timetable.aggregate(pipeline).to_list(None)