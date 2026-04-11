from bson import ObjectId
from datetime import datetime
from mongodb import db as mongo_db

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
    current_user = Depends(get_current_user),
):
    try:
        restaurant_obj_id = ObjectId(payload.restaurant_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid restaurant id")

    restaurant = mongo_db.restaurants.find_one({"_id": restaurant_obj_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    existing_favourite = mongo_db.favourites.find_one({
        "user_id": current_user["id"],
        "restaurant_id": payload.restaurant_id
    })

    if existing_favourite:
        raise HTTPException(status_code=400, detail="Restaurant already in favourites")

    favourite_doc = {
        "user_id": current_user["id"],
        "restaurant_id": payload.restaurant_id,
        "created_at": datetime.utcnow()
    }

    result = mongo_db.favourites.insert_one(favourite_doc)
    created_favourite = mongo_db.favourites.find_one({"_id": result.inserted_id})

    return {
        "id": str(created_favourite["_id"]),
        "user_id": created_favourite.get("user_id"),
        "restaurant_id": created_favourite.get("restaurant_id"),
        "created_at": created_favourite.get("created_at"),
    }

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