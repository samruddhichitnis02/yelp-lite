from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.owner import Owner


from database import get_db
from models.review import Review
from models.restaurants import Restaurant
from models.users import User
from schemas.review import ReviewCreateRequest, ReviewUpdateRequest, ReviewPublic
from services.deps import get_current_user, get_current_owner

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

@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own review")

    restaurant_id = review.restaurant_id

    db.delete(review)
    db.commit()

    avg_rating = (
        db.query(func.avg(Review.rating))
        .filter(Review.restaurant_id == restaurant_id)
        .scalar()
    )

    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant:
        restaurant.avg_rating = float(avg_rating) if avg_rating is not None else 0.0
        db.commit()

    return {"message": "Review deleted successfully"}

@router.get("/owner", response_model=list[ReviewPublic])
def get_owner_reviews(
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = db.query(Restaurant).filter(Restaurant.owner_id == current_owner.id).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="No restaurant found for this owner")

    reviews = (
        db.query(Review)
        .filter(Review.restaurant_id == restaurant.id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return reviews