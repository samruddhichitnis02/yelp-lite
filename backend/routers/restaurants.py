from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from typing import Optional
from sqlalchemy import or_

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

@router.get("/search", response_model=list[RestaurantPublic])
def search_restaurants(
    name: Optional[str] = None,
    cuisine: Optional[str] = None,
    keyword: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Restaurant)

    # Filter by restaurant name
    if name:
        query = query.filter(Restaurant.name.ilike(f"%{name}%"))

    # Filter by cuisine
    if cuisine:
        query = query.filter(Restaurant.cuisine.ilike(f"%{cuisine}%"))

    # Filter by keyword (search in description)
    if keyword:
        query = query.filter(Restaurant.description.ilike(f"%{keyword}%"))

    # Filter by location (city OR zip)
    if location:
        query = query.filter(
            or_(
                Restaurant.city.ilike(f"%{location}%"),
                Restaurant.zip_code.ilike(f"%{location}%"),
            )
        )

    results = query.all()
    return results

@router.get("/search", response_model=list[RestaurantPublic])
def search_restaurants(
    name: Optional[str] = None,
    cuisine: Optional[str] = None,
    keyword: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Restaurant)

    # Filter by restaurant name
    if name:
        query = query.filter(Restaurant.name.ilike(f"%{name}%"))

    # Filter by cuisine
    if cuisine:
        query = query.filter(Restaurant.cuisine.ilike(f"%{cuisine}%"))

    # Filter by keyword (search in description)
    if keyword:
        query = query.filter(Restaurant.description.ilike(f"%{keyword}%"))

    # Filter by location (city OR zip)
    if location:
        query = query.filter(
            or_(
                Restaurant.city.ilike(f"%{location}%"),
                Restaurant.zip_code.ilike(f"%{location}%"),
            )
        )

    results = query.all()
    return results