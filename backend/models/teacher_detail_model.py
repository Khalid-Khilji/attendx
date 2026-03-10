from datetime import datetime

def teacher_entity(teacher) -> dict:
    return {
        "_id": str(teacher["_id"]),
        "user_id": teacher["user_id"],
        "first_name": teacher["first_name"],
        "last_name": teacher["last_name"],
        "faculty_id": teacher["faculty_id"],
        "dept_id": teacher["dept_id"],
        "created_at": teacher["created_at"]
    }

def teacher_create_model(user_id: str, first_name: str, last_name: str, faculty_id: str, dept_id: str) -> dict:
    return {
        "_id": user_id,
        "user_id": user_id,
        "first_name": first_name.lower().strip(),
        "last_name": last_name.lower().strip(),
        "faculty_id": faculty_id.upper().strip(),
        "dept_id": dept_id,
        "created_at": datetime.utcnow()
    }