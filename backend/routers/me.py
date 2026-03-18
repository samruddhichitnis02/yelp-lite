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

@router.put("/preferences")
def update_my_preferences(
    payload: PreferenceUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1) Validate that all selected IDs actually exist

    if payload.cuisine_ids:
        cuisine_count = (
            db.query(CuisineType)
            .filter(CuisineType.id.in_(payload.cuisine_ids))
            .count()
        )
        if cuisine_count != len(set(payload.cuisine_ids)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more cuisine_ids are invalid",
            )

    if payload.dietary_ids:
        dietary_count = (
            db.query(DietaryType)
            .filter(DietaryType.id.in_(payload.dietary_ids))
            .count()
        )
        if dietary_count != len(set(payload.dietary_ids)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more dietary_ids are invalid",
            )

    if payload.ambiance_ids:
        ambiance_count = (
            db.query(AmbianceType)
            .filter(AmbianceType.id.in_(payload.ambiance_ids))
            .count()
        )
        if ambiance_count != len(set(payload.ambiance_ids)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more ambiance_ids are invalid",
            )

    # 2) Create or update the single-row user_preferences record
    pref = db.query(Preference).filter(Preference.user_id == current_user.id).first()

    if not pref:
        pref = Preference(user_id=current_user.id)
        db.add(pref)

    pref.price_range = payload.price_range
    pref.sort_preference = payload.sort_preference
    pref.preferred_location = payload.preferred_location
    pref.search_radius = payload.search_radius

    # 3) Replace join-table rows for cuisines
    db.query(UserCuisine).filter(UserCuisine.user_id == current_user.id).delete()
    for cuisine_id in set(payload.cuisine_ids):
        db.add(UserCuisine(user_id=current_user.id, cuisine_id=cuisine_id))

    # 4) Replace join-table rows for dietary
    db.query(UserDietary).filter(UserDietary.user_id == current_user.id).delete()
    for dietary_id in set(payload.dietary_ids):
        db.add(UserDietary(user_id=current_user.id, dietary_id=dietary_id))

    # 5) Replace join-table rows for ambiance
    db.query(UserAmbiance).filter(UserAmbiance.user_id == current_user.id).delete()
    for ambiance_id in set(payload.ambiance_ids):
        db.add(UserAmbiance(user_id=current_user.id, ambiance_id=ambiance_id))

    db.commit()

    return {"message": "Preferences updated successfully"}