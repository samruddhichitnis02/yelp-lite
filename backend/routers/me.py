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

router = APIRouter(prefix="/me", tags=["me"])

@router.get("/user")
def me_user(current_user: User = Depends(get_current_user)):
    return {
        "role": "user",
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
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
def get_my_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pref = db.query(Preference).filter(Preference.user_id == current_user.id).first()

    cuisine_rows = (
        db.query(CuisineType.id, CuisineType.name)
        .join(UserCuisine, UserCuisine.cuisine_id == CuisineType.id)
        .filter(UserCuisine.user_id == current_user.id)
        .all()
    )

    dietary_rows = (
        db.query(DietaryType.id, DietaryType.name)
        .join(UserDietary, UserDietary.dietary_id == DietaryType.id)
        .filter(UserDietary.user_id == current_user.id)
        .all()
    )

    ambiance_rows = (
        db.query(AmbianceType.id, AmbianceType.name)
        .join(UserAmbiance, UserAmbiance.ambiance_id == AmbianceType.id)
        .filter(UserAmbiance.user_id == current_user.id)
        .all()
    )

    return {
        "user_id": current_user.id,
        "price_range": pref.price_range if pref else None,
        "sort_preference": pref.sort_preference if pref else None,
        "preferred_location": pref.preferred_location if pref else None,
        "search_radius": pref.search_radius if pref else None,
        "cuisines": [{"id": row.id, "name": row.name} for row in cuisine_rows],
        "dietary": [{"id": row.id, "name": row.name} for row in dietary_rows],
        "ambiance": [{"id": row.id, "name": row.name} for row in ambiance_rows],
    }