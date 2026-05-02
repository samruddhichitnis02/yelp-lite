from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from bson import ObjectId
from datetime import datetime
import os
import shutil
import uuid

from mongodb import db as mongo_db
from services.deps import get_current_user


router = APIRouter(prefix="/reviews", tags=["review-photos"])


@router.post("/{review_id}/photos")
def upload_review_photo(
    review_id: str,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    review = None
    try:
        review = mongo_db.reviews.find_one({"_id": ObjectId(review_id)})
    except Exception:
        review = None

    if not review:
        review = mongo_db.reviews.find_one({"id": review_id})

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if str(review.get("user_id")) != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to add photo to this review")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    os.makedirs("uploads", exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"review_{review_id}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join("uploads", filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo_doc = {
        "review_id": review_id,
        "photo_path": f"/uploads/{filename}",  # Fixed: leading slash makes it a proper URL path
        "user_id": current_user["id"],
        "created_at": datetime.utcnow(),
    }

    result = mongo_db.review_photos.insert_one(photo_doc)

    return {
        "id": str(result.inserted_id),
        "review_id": review_id,
        "photo_path": photo_doc["photo_path"],
        "created_at": photo_doc["created_at"],
    }


@router.get("/{review_id}/photos")
def get_review_photos(review_id: str):
    photos = list(
        mongo_db.review_photos.find({"review_id": review_id}).sort("created_at", -1)
    )

    result = []
    for p in photos:
        photo_path = p.get("photo_path", "")
        # Fix any old records that were stored without leading slash
        if photo_path and not photo_path.startswith("/"):
            photo_path = f"/{photo_path}"
        result.append(
            {
                "id": str(p["_id"]),
                "review_id": p.get("review_id"),
                "photo_path": photo_path,
                "created_at": p.get("created_at"),
            }
        )

    return result


@router.delete("/{review_id}/photos/{photo_id}")
def delete_review_photo(
    review_id: str,
    photo_id: str,
    current_user=Depends(get_current_user),
):
    try:
        photo_obj_id = ObjectId(photo_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid photo id")

    photo = mongo_db.review_photos.find_one(
        {"_id": photo_obj_id, "review_id": review_id}
    )

    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    if photo.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this photo")

    try:
        photo_path = photo.get("photo_path", "")
        # Strip leading slash for os.path check
        local_path = photo_path.lstrip("/")
        if local_path and os.path.exists(local_path):
            os.remove(local_path)
    except Exception:
        pass

    mongo_db.review_photos.delete_one({"_id": photo_obj_id})

    return {"message": "Photo deleted"}