from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os, shutil, uuid

from database import get_db
from models.review_photos import ReviewPhoto
from models.review import Review
from models.users import User
from schemas.review_photos import ReviewPhotoPublic
from services.deps import get_current_user

router = APIRouter(prefix="/reviews", tags=["review-photos"])


@router.post("/{review_id}/photos", response_model=ReviewPhotoPublic)
def upload_review_photo(
    review_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only add photos to your own reviews")
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    os.makedirs("uploads", exist_ok=True)
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"review_{review_id}_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join("uploads", filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo = ReviewPhoto(
        review_id=review_id,
        photo_path=f"uploads/{filename}",
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.get("/{review_id}/photos", response_model=List[ReviewPhotoPublic])
def get_review_photos(
    review_id: int,
    db: Session = Depends(get_db),
):
    return db.query(ReviewPhoto).filter(ReviewPhoto.review_id == review_id).all()


@router.delete("/{review_id}/photos/{photo_id}")
def delete_review_photo(
    review_id: int,
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own review photos")

    photo = db.query(ReviewPhoto).filter(
        ReviewPhoto.id == photo_id,
        ReviewPhoto.review_id == review_id
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