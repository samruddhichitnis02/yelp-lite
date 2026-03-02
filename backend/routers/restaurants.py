from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.restaurants import Restaurant
from models.users import User
from services.deps import get_current_user
from schemas.restaurant import RestaurantCreateRequest, RestaurantPublic

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.post("/", response_model=RestaurantPublic)
def create_restaurant(
    payload: RestaurantCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # User can create a restaurant listing; owner_id stays None until claimed by an owner.
    restaurant = Restaurant(
        owner_id=None,
        created_by_user_id=current_user.id,
        name=payload.name,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        zip_code=payload.zip_code,
        cuisine=payload.cuisine,
        price_range=payload.price_range,
        phone=payload.phone,
        website=payload.website,
        description=payload.description,
        image=payload.image,
        avg_rating=0.0,
    )

    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant