from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import os, shutil, uuid

from database import get_db
from models.restaurant_photos import RestaurantPhoto
from models.restaurants import Restaurant
from models.owner import Owner
from models.users import User
from schemas.restaurant_photos import RestaurantPhotoPublic
from services.deps import get_current_owner
from services.auth_service import decode_access_token

router = APIRouter(prefix="/restaurants", tags=["restaurant-photos"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/user/login", auto_error=False)


def get_current_user_or_owner(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    role = payload.get("role")
    subject_id = int(payload.get("sub"))

    if role == "user":
        user = db.query(User).filter(User.id == subject_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user, None
    elif role == "owner":
        owner = db.query(Owner).filter(Owner.id == subject_id).first()
        if not owner:
            raise HTTPException(status_code=401, detail="Owner not found")
        return None, owner
    else:
        raise HTTPException(status_code=401, detail="Unknown role")


@router.post("/{restaurant_id}/photos", response_model=RestaurantPhotoPublic)
def upload_restaurant_photo(
    restaurant_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    auth=Depends(get_current_user_or_owner),
):
    current_user, current_owner = auth

    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if current_owner and restaurant.owner_id and restaurant.owner_id != current_owner.id:
        raise HTTPException(status_code=403, detail="You don't own this restaurant")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    os.makedirs("uploads", exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"restaurant_{restaurant_id}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join("uploads", filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    uploaded_by = "owner" if current_owner else "user"
    photo = RestaurantPhoto(
        restaurant_id=restaurant_id,
        photo_path=f"uploads/{filename}",
        uploaded_by=uploaded_by,
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