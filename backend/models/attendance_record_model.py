from datetime import datetime
import uuid

def record_entity(record) -> dict:
    return {
        "_id": str(record["_id"]),
        "session_id": record["session_id"],
        "student_id": record["student_id"],
        "status": record["status"],
        "confidence": record.get("confidence", 0.0),
        "marked_at": record["marked_at"]
    }

def record_create_model(session_id: str, student_id: str, status: str, confidence: float = 0.0) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "session_id": session_id,
        "student_id": student_id,
        "status": status,          
        "confidence": confidence,
        "marked_at": datetime.utcnow()
    }