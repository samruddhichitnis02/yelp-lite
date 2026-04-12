from datetime import datetime
from mongodb import db as mongo_db


def log_activity(action: str, user_id: str = None, owner_id: str = None, restaurant_id: str = None):
    doc = {
        "action": action,
        "user_id": user_id,
        "owner_id": owner_id,
        "restaurant_id": restaurant_id,
        "created_at": datetime.utcnow(),
    }
    mongo_db.activity_logs.insert_one(doc)