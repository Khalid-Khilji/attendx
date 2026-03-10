from datetime import datetime, date
import uuid

def academic_year_entity(ay) -> dict:
    return {
        "_id": str(ay["_id"]),
        "label": ay["label"],
        "start_date": ay["start_date"],
        "end_date": ay["end_date"],
        "is_current": ay["is_current"],
        "created_at": ay["created_at"]
    }

def academic_year_create_model(label: str, start_date: date, end_date: date, is_current: bool = False) -> dict:
    return {
        "_id": str(uuid.uuid4()),
        "label": label.strip(),
        "start_date": start_date,
        "end_date": end_date,
        "is_current": is_current,
        "created_at": datetime.utcnow()
    }