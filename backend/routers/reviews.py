from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.review import Review
from models.restaurants import Restaurant
from models.users import User
from schemas.review import ReviewCreateRequest, ReviewUpdateRequest, ReviewPublic
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

    avg_rating = (
        db.query(func.avg(Review.rating))
        .filter(Review.restaurant_id == payload.restaurant_id)
        .scalar()
    )

    restaurant.avg_rating = float(avg_rating) if avg_rating is not None else 0.0
    db.commit()

    return review

@router.put("/{review_id}", response_model=ReviewPublic)
def update_review(
    review_id: int,
    payload: ReviewUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own review")

    review.rating = payload.rating
    review.comment = payload.comment

    db.commit()
    db.refresh(review)

    avg_rating = (
        db.query(func.avg(Review.rating))
        .filter(Review.restaurant_id == review.restaurant_id)
        .scalar()
    )

    restaurant = db.query(Restaurant).filter(Restaurant.id == review.restaurant_id).first()
    if restaurant:
        restaurant.avg_rating = float(avg_rating) if avg_rating is not None else 0.0
        db.commit()

    return review