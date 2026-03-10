from datetime import datetime

def student_entity(student) -> dict:
    return {
        "_id": str(student["_id"]),
        "user_id": student["user_id"],
        "first_name": student["first_name"],
        "last_name": student["last_name"],
        "roll_no": student["roll_no"],
        "profile_pic": student.get("profile_pic"),
        "face_embedding": student.get("face_embedding"),
        "dept_id": student["dept_id"],
        "created_at": student["created_at"]
    }

def student_create_model(user_id: str, first_name: str, last_name: str, roll_no: str, dept_id: str, profile_pic: str = None) -> dict:
    return {
        "_id": user_id,
        "user_id": user_id,
        "first_name": first_name.lower().strip(),
        "last_name": last_name.lower().strip(),
        "roll_no": roll_no.upper().strip(),
        "profile_pic": profile_pic,
        "face_embedding": None,
        "dept_id": dept_id,
        "created_at": datetime.utcnow()
    }