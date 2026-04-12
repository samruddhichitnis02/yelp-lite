import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mongodb import db as mongo_db

restaurants = list(mongo_db.restaurants.find({}, {"name": 1, "city": 1, "image": 1, "amenities": 1}))

print("Restaurant count:", len(restaurants))

for r in restaurants[:10]:
    print(r)