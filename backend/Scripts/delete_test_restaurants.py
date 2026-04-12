import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mongodb import db as mongo_db

result = mongo_db.restaurants.delete_many({
    "name": {"$in": ["Bella Italia", "Sakura Garden"]}
})

print("Deleted count:", result.deleted_count)