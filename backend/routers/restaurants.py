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
import os
import shutil
import uuid
from models.favourite import Favourite


router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.post("/", response_model=RestaurantPublic)
def create_restaurant(
    payload: RestaurantCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
        amenities=payload.amenities,
        description=payload.description,
        image=payload.image,
        avg_rating=0.0,
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.post("/owner/create", response_model=RestaurantPublic)
def owner_create_restaurant(
    payload: RestaurantCreateRequest,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = Restaurant(
        owner_id=current_owner.id,
        created_by_user_id=None,
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
        amenities=payload.amenities,
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

    if name:
        query = query.filter(Restaurant.name.ilike(f"%{name}%"))

    if cuisine:
        query = query.filter(Restaurant.cuisine.ilike(f"%{cuisine}%"))

    if keyword:
        query = query.filter(
            or_(
                Restaurant.description.ilike(f"%{keyword}%"),
                Restaurant.amenities.ilike(f"%{keyword}%"),
                Restaurant.name.ilike(f"%{keyword}%"),
            )
        )

    if location:
        query = query.filter(
            or_(
                Restaurant.city.ilike(f"%{location}%"),
                Restaurant.zip_code.ilike(f"%{location}%"),
            )
        )

    results = query.all()
    return results


@router.get("/owner/profile", response_model=RestaurantPublic)
def get_owner_restaurant_profile(
    restaurant_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    query = db.query(Restaurant).filter(Restaurant.owner_id == current_owner.id)
    if restaurant_id:
        query = query.filter(Restaurant.id == restaurant_id)
    restaurant = query.first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="No restaurant profile found for this owner")

    return restaurant


@router.put("/owner/profile", response_model=RestaurantPublic)
def update_owner_restaurant_profile(
    payload: RestaurantUpdateRequest,
    restaurant_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    query = db.query(Restaurant).filter(Restaurant.owner_id == current_owner.id)
    if restaurant_id:
        query = query.filter(Restaurant.id == restaurant_id)
    restaurant = query.first()

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
    if payload.amenities is not None:
        restaurant.amenities = payload.amenities

    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.post("/owner/profile/photo", response_model=RestaurantPublic)
def upload_owner_restaurant_photo(
    restaurant_id: Optional[int] = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    # Build query: must be owned by this owner
    query = db.query(Restaurant).filter(Restaurant.owner_id == current_owner.id)
    if restaurant_id:
        query = query.filter(Restaurant.id == restaurant_id)
    restaurant = query.first()

    if not restaurant:
        # Give a clear error so the frontend can surface it
        raise HTTPException(
            status_code=404,
            detail=(
                f"Restaurant {restaurant_id} not found or not owned by you. "
                "Make sure you have claimed or created this restaurant first."
            )
            if restaurant_id
            else "No restaurant profile found for this owner. Please claim or create a restaurant first.",
        )

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    os.makedirs("uploads", exist_ok=True)

    extension = os.path.splitext(file.filename)[1] if file.filename else ""
    unique_filename = f"restaurant_{restaurant.id}_{uuid.uuid4().hex}{extension}"
    file_path = os.path.join("uploads", unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    restaurant.image = f"uploads/{unique_filename}"
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.post("/{restaurant_id}/claim", response_model=RestaurantPublic)
def claim_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if restaurant.owner_id is not None:
        raise HTTPException(status_code=400, detail="Restaurant is already claimed")

    restaurant.owner_id = current_owner.id
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("/owner/dashboard")
def get_owner_dashboard(
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurants = db.query(Restaurant).filter(Restaurant.owner_id == current_owner.id).all()

    if not restaurants:
        raise HTTPException(status_code=404, detail="No restaurant found for this owner")

    total_review_count = 0
    total_favourites_count = 0
    all_recent_reviews = []
    restaurant_list = []

    for restaurant in restaurants:
        review_count = db.query(Review).filter(Review.restaurant_id == restaurant.id).count()
        favourites_count = db.query(Favourite).filter(Favourite.restaurant_id == restaurant.id).count()
        recent_reviews = (
            db.query(Review)
            .filter(Review.restaurant_id == restaurant.id)
            .order_by(Review.created_at.desc())
            .limit(5)
            .all()
        )
        total_review_count += review_count
        total_favourites_count += favourites_count
        all_recent_reviews.extend(recent_reviews)

        restaurant_list.append({
            "id": restaurant.id,
            "owner_id": restaurant.owner_id,
            "created_by_user_id": restaurant.created_by_user_id,
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
            "amenities": restaurant.amenities,
            "description": restaurant.description,
            "image": restaurant.image,
            "avg_rating": restaurant.avg_rating,
            "review_count": review_count,
            "favourites_count": favourites_count,
        })

    avg_rating = sum(r.avg_rating for r in restaurants) / len(restaurants)

    return {
        "restaurants": restaurant_list,
        "review_count": total_review_count,
        "favourites_count": total_favourites_count,
        "avg_rating": round(avg_rating, 1),
        "recent_reviews": sorted(all_recent_reviews, key=lambda x: x.created_at, reverse=True)[:5],
    }


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
        "amenities": restaurant.amenities,
        "description": restaurant.description,
        "image": restaurant.image,
        "avg_rating": restaurant.avg_rating,
        "review_count": len(reviews),
        "reviews": reviews,
    }