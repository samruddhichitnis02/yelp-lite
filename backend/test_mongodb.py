# from mongodb import db
# from services.auth_service import hash_password

# user = {
#     "name": "Test User",
#     "email": "test@example.com",
#     "hashed_password": hash_password("123456"),
#     "profile_pic": None
# }

# result = db.users.insert_one(user)
# print("Inserted user id:", result.inserted_id)

from mongodb import db as mongo_db

print("Restaurant Photos:")
print(list(mongo_db.restaurant_photos.find()))

print("\nActivity Logs:")
print(list(mongo_db.activity_logs.find()))