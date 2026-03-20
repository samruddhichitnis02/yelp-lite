from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.review import Review
from models.restaurants import Restaurant
from models.users import User
from schemas.review import ReviewCreateRequest, ReviewPublic
from services.deps import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("/", response_model=ReviewPublic)
def create_review(
    payload: ReviewCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    review = Review(
        user_id=current_user.id,
        restaurant_id=payload.restaurant_id,
        rating=payload.rating,
        comment=payload.comment,
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review