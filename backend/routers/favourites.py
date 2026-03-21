from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.favourite import Favourite
from models.restaurants import Restaurant
from models.users import User
from schemas.favourite import FavouriteCreateRequest, FavouritePublic
from services.deps import get_current_user

router = APIRouter(prefix="/favourites", tags=["favourites"])

@router.post("/", response_model=FavouritePublic)
def create_favourite(
    payload: FavouriteCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    existing_favourite = (
        db.query(Favourite)
        .filter(
            Favourite.user_id == current_user.id,
            Favourite.restaurant_id == payload.restaurant_id,
        )
        .first()
    )

    if existing_favourite:
        raise HTTPException(status_code=400, detail="Restaurant already in favourites")

    favourite = Favourite(
        user_id=current_user.id,
        restaurant_id=payload.restaurant_id,
    )

    db.add(favourite)
    db.commit()
    db.refresh(favourite)

    return favourite

@router.get("/", response_model=list[FavouritePublic])
def list_favourites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favourites = (
        db.query(Favourite)
        .filter(Favourite.user_id == current_user.id)
        .order_by(Favourite.created_at.desc())
        .all()
    )

    return favourites

@router.delete("/{restaurant_id}")
def delete_favourite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favourite = (
        db.query(Favourite)
        .filter(
            Favourite.user_id == current_user.id,
            Favourite.restaurant_id == restaurant_id,
        )
        .first()
    )

    if not favourite:
        raise HTTPException(status_code=404, detail="Favourite not found")

    db.delete(favourite)
    db.commit()

    return {"message": "Removed from favourites"}