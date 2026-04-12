from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from typing import List
from bson import ObjectId
from datetime import datetime
import os
import shutil
import uuid

from mongodb import db as mongo_db
from schemas.restaurant_photos import RestaurantPhotoPublic
from services.auth_service import decode_access_token
from services.activity_log_service import log_activity


router = APIRouter(prefix="/restaurants", tags=["restaurant-photos"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/user/login", auto_error=False)


def get_current_user_or_owner(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    role = payload.get("role")
    subject_id = payload.get("sub")

    if not subject_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    try:
        subject_obj_id = ObjectId(subject_id)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid subject id in token")

    if role == "user":
        user = mongo_db.users.find_one({"_id": subject_obj_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user["_id"])
        return user, None

    if role == "owner":
        owner = mongo_db.owners.find_one({"_id": subject_obj_id})
        if not owner:
            raise HTTPException(status_code=401, detail="Owner not found")
        owner["id"] = str(owner["_id"])
        return None, owner

    raise HTTPException(status_code=401, detail="Unknown role")


@router.post("/{restaurant_id}/photos", response_model=RestaurantPhotoPublic)
def upload_restaurant_photo(
    restaurant_id: str,
    file: UploadFile = File(...),
    auth=Depends(get_current_user_or_owner),
):
    current_user, current_owner = auth

    restaurant = None
    try:
        restaurant = mongo_db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    except Exception:
        restaurant = None

    if not restaurant:
        restaurant = mongo_db.restaurants.find_one({"id": restaurant_id})

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if current_owner:
        restaurant_owner_id = restaurant.get("owner_id")
        if restaurant_owner_id and str(restaurant_owner_id) != current_owner["id"]:
            raise HTTPException(status_code=403, detail="You don't own this restaurant")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    os.makedirs("uploads", exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"restaurant_{restaurant_id}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join("uploads", filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo_doc = {
        "restaurant_id": restaurant_id,
        "photo_path": f"uploads/{filename}",
        "uploaded_by": "owner" if current_owner else "user",
        "uploaded_by_id": current_owner["id"] if current_owner else current_user["id"],
        "created_at": datetime.utcnow(),
    }

    result = mongo_db.restaurant_photos.insert_one(photo_doc)
    created_photo = mongo_db.restaurant_photos.find_one({"_id": result.inserted_id})

    log_activity(
        action="restaurant_photo_uploaded",
        user_id=current_user["id"] if current_user else None,
        owner_id=current_owner["id"] if current_owner else None,
        restaurant_id=restaurant_id,
    )

    return {
        "id": str(created_photo["_id"]),
        "restaurant_id": created_photo.get("restaurant_id"),
        "photo_path": created_photo.get("photo_path"),
        "uploaded_by": created_photo.get("uploaded_by"),
        "created_at": created_photo.get("created_at"),
    }


@router.get("/{restaurant_id}/photos", response_model=List[RestaurantPhotoPublic])
def get_restaurant_photos(restaurant_id: str):
    photos = list(
        mongo_db.restaurant_photos.find({"restaurant_id": restaurant_id}).sort("created_at", -1)
    )

    formatted_photos = []
    for photo in photos:
        formatted_photos.append(
            {
                "id": str(photo["_id"]),
                "restaurant_id": photo.get("restaurant_id"),
                "photo_path": photo.get("photo_path"),
                "uploaded_by": photo.get("uploaded_by"),
                "created_at": photo.get("created_at"),
            }
        )

    return formatted_photos


@router.delete("/{restaurant_id}/photos/{photo_id}")
def delete_restaurant_photo(
    restaurant_id: str,
    photo_id: str,
    auth=Depends(get_current_user_or_owner),
):
    current_user, current_owner = auth

    try:
        photo_obj_id = ObjectId(photo_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid photo id")

    restaurant = None
    try:
        restaurant = mongo_db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    except Exception:
        restaurant = None

    if not restaurant:
        restaurant = mongo_db.restaurants.find_one({"id": restaurant_id})

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    photo = mongo_db.restaurant_photos.find_one(
        {
            "_id": photo_obj_id,
            "restaurant_id": restaurant_id,
        }
    )

    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    if current_owner:
        restaurant_owner_id = restaurant.get("owner_id")
        if str(restaurant_owner_id) != current_owner["id"]:
            raise HTTPException(
                status_code=403,
                detail="You can only delete photos for your own restaurant",
            )
    else:
        if photo.get("uploaded_by") != "user" or photo.get("uploaded_by_id") != current_user["id"]:
            raise HTTPException(
                status_code=403,
                detail="You can only delete your own uploaded restaurant photos",
            )

    try:
        photo_path = photo.get("photo_path")
        if photo_path and os.path.exists(photo_path):
            os.remove(photo_path)
    except Exception:
        pass

    mongo_db.restaurant_photos.delete_one({"_id": photo_obj_id})

    log_activity(
        action="restaurant_photo_deleted",
        user_id=current_user["id"] if current_user else None,
        owner_id=current_owner["id"] if current_owner else None,
        restaurant_id=restaurant_id,
    )

    return {"message": "Photo deleted"}