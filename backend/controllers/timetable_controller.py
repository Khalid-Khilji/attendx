from db.database import db
from models.timetable_model import timetable_create_model, timetable_entity
from utils.logger import log_action
from datetime import date

async def create_slot(current_user, data):
    sem = await db.semesters.find_one({"_id": data["sem_id"]})
    if not sem:
        return {"error": "Semester not found"}

    course = await db.courses.find_one({"_id": data["course_id"]})
    course_name = course["name"].upper() if course else "Unknown Course"

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
        data["version_tag"], data["valid_from"]
    )
    await db.timetable.insert_one(slot_data)
    
    await log_action(
        current_user, 
        "CREATE", 
        "TIMETABLE", 
        slot_data["_id"], 
        f"{course_name} | {data['day_of_week']} ({data['start_time']})"
    )
    
    return timetable_entity(slot_data)

async def update_slot(current_user, slot_id: str, data):
    slot = await db.timetable.find_one({"_id": slot_id})
    if not slot:
        return {"error": "Slot not found"}

    course = await db.courses.find_one({"_id": slot["course_id"]})
    course_name = course["name"].upper() if course else "Unknown Course"

    await db.timetable.update_one({"_id": slot_id}, {"$set": data})
    
    await log_action(
        current_user, 
        "UPDATE", 
        "TIMETABLE", 
        slot_id, 
        f"{course_name} | {slot['day_of_week']}",
        {"changes": data}
    )

    updated = await db.timetable.find_one({"_id": slot_id})
    return timetable_entity(updated)

async def delete_slot(current_user, slot_id: str):
    slot = await db.timetable.find_one({"_id": slot_id})
    if not slot:
        return {"error": "Slot not found"}

    course = await db.courses.find_one({"_id": slot["course_id"]})
    course_name = course["name"].upper() if course else "Unknown Course"

    await db.timetable.delete_one({"_id": slot_id})
    
    await log_action(
        current_user, 
        "DELETE", 
        "TIMETABLE", 
        slot_id, 
        f"{course_name} | {slot['day_of_week']} ({slot['start_time']})"
    )
    
    return {"message": "Slot deleted"}

async def get_sem_timetable(sem_id: str):
    pipeline = [
        {"$match": {"sem_id": sem_id, "is_active": True}},
        {
            "$lookup": {
                "from": "courses",
                "localField": "course_id",
                "foreignField": "_id",
                "as": "course"
            }
        },
        {"$unwind": "$course"},
        {
            "$lookup": {
                "from": "teacher_details",
                "localField": "teacher_id",
                "foreignField": "_id",
                "as": "teacher"
            }
        },
        {"$unwind": "$teacher"},
        {
            "$project": {
                "_id": 1, "day_of_week": 1, "start_time": 1, "end_time": 1,
                "version_tag": 1, "valid_from": 1, "valid_until": 1,
                "course_name": "$course.name",
                "course_code": "$course.course_code",
                "teacher_name": {"$concat": ["$teacher.first_name", " ", "$teacher.last_name"]},
                "faculty_id": "$teacher.faculty_id"
            }
        },
        {"$sort": {"day_of_week": 1, "start_time": 1}}
    ]
    return await db.timetable.aggregate(pipeline).to_list(None)

async def get_my_timetable(current_user):
    pipeline = [
        {"$match": {"teacher_id": current_user["user_id"], "is_active": True}},
        {
            "$lookup": {
                "from": "courses",
                "localField": "course_id",
                "foreignField": "_id",
                "as": "course"
            }
        },
        {"$unwind": "$course"},
        {
            "$lookup": {
                "from": "semesters",
                "localField": "sem_id",
                "foreignField": "_id",
                "as": "semester"
            }
        },
        {"$unwind": "$semester"},
        {
            "$project": {
            "_id": 1, "day_of_week": 1, "start_time": 1, "end_time": 1,
            "course_id": 1, "sem_id": 1, "teacher_id": 1,
            "course_name": "$course.name",
            "course_code": "$course.course_code",
            "sem_number": "$semester.sem_number"
            }
        },
        {"$sort": {"day_of_week": 1, "start_time": 1}}
    ]
    return await db.timetable.aggregate(pipeline).to_list(None)