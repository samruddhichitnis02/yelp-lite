from bson import ObjectId
from mongodb import db as mongo_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.users import User
from models.owner import Owner
from models.preference import Preference
from models.cuisine_type import CuisineType
from models.user_cuisine import UserCuisine
from models.dietary_type import DietaryType
from models.user_dietary import UserDietary
from models.ambiance_type import AmbianceType
from models.user_ambiance import UserAmbiance
from schemas.preferences import PreferenceUpdateRequest
from services.deps import get_current_user, get_current_owner

from models.restaurants import Restaurant
from models.review import Review
from schemas.history import UserHistoryResponse

router = APIRouter(prefix="/me", tags=["me"])

@router.get("/test-me")
def test_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user.get("name")
    }

@router.get("/user")
def me_user(current_user = Depends(get_current_user)):
    return {
        "role": "user",
        "id": current_user["id"],
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "profile_pic": current_user.get("profile_pic"),
        "phone": current_user.get("phone"),
        "about": current_user.get("about"),
        "city": current_user.get("city"),
        "state": current_user.get("state"),
        "country": current_user.get("country"),
        "languages": current_user.get("languages", []),
        "gender": current_user.get("gender"),
        "location": current_user.get("location"),
    }

@router.get("/owner")
def me_owner(current_owner: Owner = Depends(get_current_owner)):
    return {
        "role": "owner",
        "id": current_owner.id,
        "name": current_owner.name,
        "email": current_owner.email,
    }

@router.get("/preferences")
def get_my_preferences(current_user = Depends(get_current_user)):
    prefs = current_user.get("preferences", {})
    return {
        "user_id": current_user["id"],
        "price_range": prefs.get("price_range"),
        "sort_preference": prefs.get("sort_preference"),
        "preferred_location": prefs.get("preferred_location"),
        "search_radius": prefs.get("search_radius"),
        "cuisines": prefs.get("cuisines", []),
        "dietary": prefs.get("dietary", []),
        "ambiance": prefs.get("ambiance", []),
    }

@router.put("/preferences")
def update_my_preferences(
    payload: PreferenceUpdateRequest,
    current_user = Depends(get_current_user),
):
    mongo_db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {
            "$set": {
                "preferences": {
                    "cuisines": payload.cuisines,
                    "dietary": payload.dietary,
                    "ambiance": payload.ambiance,
                    "price_range": payload.price_range,
                    "sort_preference": payload.sort_preference,
                    "preferred_location": payload.preferred_location,
                    "search_radius": payload.search_radius,
                }
            }
        },
    )

    return {"message": "Preferences updated successfully"}

@router.get("/history", response_model=UserHistoryResponse)
def get_my_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurants_added = (
        db.query(Restaurant)
        .filter(Restaurant.created_by_user_id == current_user.id)
        .order_by(Restaurant.created_at.desc())
        .all()
    )

    reviews_written = (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return {
        "restaurants_added": restaurants_added,
        "reviews_written": reviews_written,
    }
