from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os, shutil, uuid

from database import get_db
from models.restaurant_photos import RestaurantPhoto
from models.restaurants import Restaurant
from models.owner import Owner
from models.users import User
from schemas.restaurant_photos import RestaurantPhotoPublic
from services.deps import get_current_owner, get_current_user

router = APIRouter(prefix="/restaurants", tags=["restaurant-photos"])


@router.post("/{restaurant_id}/photos", response_model=RestaurantPhotoPublic)
def upload_restaurant_photo(
    restaurant_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_owner.id
    ).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found or not yours")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    os.makedirs("uploads", exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"restaurant_{restaurant_id}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join("uploads", filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo = RestaurantPhoto(
        restaurant_id=restaurant_id,
        photo_path=f"uploads/{filename}",
        uploaded_by="owner",
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.get("/{restaurant_id}/photos", response_model=List[RestaurantPhotoPublic])
def get_restaurant_photos(
    restaurant_id: int,
    db: Session = Depends(get_db),
):
    photos = (
        db.query(RestaurantPhoto)
        .filter(RestaurantPhoto.restaurant_id == restaurant_id)
        .order_by(RestaurantPhoto.created_at.desc())
        .all()
    )
    return photos


@router.delete("/{restaurant_id}/photos/{photo_id}")
def delete_restaurant_photo(
    restaurant_id: int,
    photo_id: int,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_owner.id
    ).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found or not yours")

    photo = db.query(RestaurantPhoto).filter(
        RestaurantPhoto.id == photo_id,
        RestaurantPhoto.restaurant_id == restaurant_id
    ).first()

    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    try:
        if os.path.exists(photo.photo_path):
            os.remove(photo.photo_path)
    except Exception:
        pass

    db.delete(photo)
    db.commit()
    return {"message": "Photo deleted"}