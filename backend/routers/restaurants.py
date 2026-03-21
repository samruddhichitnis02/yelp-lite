from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from models.review import Review
from schemas.restaurant import RestaurantCreateRequest, RestaurantPublic, RestaurantDetailPublic, RestaurantUpdateRequest
from sqlalchemy.orm import Session

from typing import Optional
from sqlalchemy import or_

from database import get_db
from models.restaurants import Restaurant
from models.users import User
from services.deps import get_current_user, get_current_owner

from models.owner import Owner



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
        hours_of_operation=payload.hours_of_operation,
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

@router.get("/{restaurant_id}", response_model=RestaurantDetailPublic)
def get_restaurant_details(
    restaurant_id: int,
    db: Session = Depends(get_db),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    reviews = (
        db.query(Review)
        .filter(Review.restaurant_id == restaurant_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return {
        "id": restaurant.id,
        "owner_id": restaurant.owner_id,
        "name": restaurant.name,
        "address": restaurant.address,
        "city": restaurant.city,
        "state": restaurant.state,
        "zip_code": restaurant.zip_code,
        "cuisine": restaurant.cuisine,
        "price_range": restaurant.price_range,
        "phone": restaurant.phone,
        "website": restaurant.website,
        "hours_of_operation": restaurant.hours_of_operation,
        "description": restaurant.description,
        "image": restaurant.image,
        "avg_rating": restaurant.avg_rating,
        "review_count": len(reviews),
        "reviews": reviews,
    }


@router.get("/owner/profile", response_model=RestaurantPublic)
def get_owner_restaurant_profile(
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = db.query(Restaurant).filter(Restaurant.owner_id == current_owner.id).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="No restaurant profile found for this owner")

    return restaurant

@router.put("/owner/profile", response_model=RestaurantPublic)
def update_owner_restaurant_profile(
    payload: RestaurantUpdateRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = db.query(Restaurant).filter(Restaurant.owner_id == current_owner.id).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="No restaurant profile found for this owner")

    if payload.name is not None:
        restaurant.name = payload.name
    if payload.address is not None:
        restaurant.address = payload.address
    if payload.city is not None:
        restaurant.city = payload.city
    if payload.state is not None:
        restaurant.state = payload.state
    if payload.zip_code is not None:
        restaurant.zip_code = payload.zip_code
    if payload.cuisine is not None:
        restaurant.cuisine = payload.cuisine
    if payload.price_range is not None:
        restaurant.price_range = payload.price_range
    if payload.phone is not None:
        restaurant.phone = payload.phone
    if payload.website is not None:
        restaurant.website = payload.website
    if payload.hours_of_operation is not None:
        restaurant.hours_of_operation = payload.hours_of_operation
    if payload.description is not None:
        restaurant.description = payload.description
    if payload.image is not None:
        restaurant.image = payload.image

    db.commit()
    db.refresh(restaurant)

    return restaurant