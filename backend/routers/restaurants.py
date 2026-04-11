from mongodb import db as mongo_db
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from models.review import Review
from schemas.restaurant import (
    RestaurantCreateRequest,
    RestaurantPublic,
    RestaurantDetailPublic,
    RestaurantUpdateRequest,
)
from sqlalchemy.orm import Session
from typing import Optional, List
from sqlalchemy import or_

from database import get_db
from models.restaurants import Restaurant
from models.users import User
from services.deps import get_current_user, get_current_owner

from models.owner import Owner
import os
import shutil
import uuid
import re
from models.favourite import Favourite


router = APIRouter(prefix="/restaurants", tags=["restaurants"])


POSITIVE_WORDS = {
    "good",
    "great",
    "amazing",
    "awesome",
    "excellent",
    "love",
    "loved",
    "friendly",
    "clean",
    "fresh",
    "delicious",
    "perfect",
    "best",
    "nice",
    "wonderful",
    "fantastic",
    "fast",
    "tasty",
    "pleasant",
    "favorite",
    "enjoyed",
    "recommend",
    "recommended",
    "beautiful",
    "attentive",
    "yummy",
    "awesome",
    "superb",
}

NEGATIVE_WORDS = {
    "bad",
    "terrible",
    "awful",
    "worst",
    "slow",
    "dirty",
    "cold",
    "rude",
    "expensive",
    "bland",
    "disappointing",
    "poor",
    "hate",
    "horrible",
    "late",
    "noisy",
    "average",
    "overpriced",
    "mediocre",
    "unpleasant",
    "boring",
    "disgusting",
    "gross",
    "tasteless",
    "stale",
    "unfriendly",
}

NEGATION_WORDS = {
    "not",
    "no",
    "never",
    "none",
    "didnt",
    "don't",
    "dont",
    "isnt",
    "isn't",
    "wasnt",
    "wasn't",
    "werent",
    "weren't",
    "cant",
    "can't",
    "couldnt",
    "couldn't",
    "wouldnt",
    "wouldn't",
    "shouldnt",
    "shouldn't",
    "wont",
    "won't",
    "hardly",
    "barely",
}

POSITIVE_PHRASES = [
    "would come back",
    "highly recommend",
    "really good",
    "very good",
    "so good",
    "great service",
    "great food",
    "loved the food",
    "loved the service",
    "excellent service",
    "excellent food",
]

NEGATIVE_PHRASES = [
    "didnt like",
    "didn't like",
    "do not like",
    "not good",
    "not great",
    "not tasty",
    "not fresh",
    "not clean",
    "not worth",
    "would not recommend",
    "wouldn't recommend",
    "never coming back",
    "won't come back",
    "bad service",
    "bad food",
    "terrible service",
    "terrible food",
    "poor service",
    "poor food",
    "too salty",
    "too expensive",
    "too noisy",
    "very slow",
    "service was slow",
    "food was cold",
]


def normalize_text(text: str) -> str:
    text = text.lower()
    text = text.replace("didn't", "didnt")
    text = text.replace("don't", "dont")
    text = text.replace("isn't", "isnt")
    text = text.replace("wasn't", "wasnt")
    text = text.replace("weren't", "werent")
    text = text.replace("can't", "cant")
    text = text.replace("couldn't", "couldnt")
    text = text.replace("wouldn't", "wouldnt")
    text = text.replace("shouldn't", "shouldnt")
    text = text.replace("won't", "wont")
    return text


def tokenize(text: str):
    return re.findall(r"[a-z]+", normalize_text(text))


def analyze_single_comment(comment: str):
    if not comment or not comment.strip():
        return "neutral", 0, 0

    normalized = normalize_text(comment)
    words = tokenize(comment)

    pos_score = 0
    neg_score = 0

    for phrase in POSITIVE_PHRASES:
        if phrase in normalized:
            pos_score += 2

    for phrase in NEGATIVE_PHRASES:
        if phrase in normalized:
            neg_score += 2

    for i, word in enumerate(words):
        prev1 = words[i - 1] if i - 1 >= 0 else ""
        prev2 = words[i - 2] if i - 2 >= 0 else ""

        is_negated = prev1 in NEGATION_WORDS or prev2 in NEGATION_WORDS

        if word in POSITIVE_WORDS:
            if is_negated:
                neg_score += 1
            else:
                pos_score += 1

        elif word in NEGATIVE_WORDS:
            if is_negated:
                pos_score += 1
            else:
                neg_score += 1

    if neg_score > pos_score:
        return "negative", pos_score, neg_score
    if pos_score > neg_score:
        return "positive", pos_score, neg_score
    return "neutral", pos_score, neg_score


def analyze_sentiment(comments):
    positive = 0
    neutral = 0
    negative = 0

    for comment in comments:
        label, _, _ = analyze_single_comment(comment)

        if label == "positive":
            positive += 1
        elif label == "negative":
            negative += 1
        else:
            neutral += 1

    total = positive + neutral + negative

    if total == 0:
        return {
            "label": "No Data",
            "score": 0,
            "positive": 0,
            "neutral": 0,
            "negative": 0,
        }

    score = round(((positive - negative) / total) * 100, 1)

    if score >= 30:
        label = "Positive"
    elif score <= -30:
        label = "Negative"
    else:
        label = "Mixed"

    return {
        "label": label,
        "score": score,
        "positive": positive,
        "neutral": neutral,
        "negative": negative,
    }


@router.post("/", response_model=RestaurantPublic)
def create_restaurant(
    payload: RestaurantCreateRequest,
    current_user = Depends(get_current_user),
):
    restaurant_doc = {
        "owner_id": None,
        "created_by_user_id": current_user["id"],
        "name": payload.name,
        "address": payload.address,
        "city": payload.city,
        "state": payload.state,
        "zip_code": payload.zip_code,
        "cuisine": payload.cuisine,
        "price_range": payload.price_range,
        "phone": payload.phone,
        "website": payload.website,
        "hours_of_operation": payload.hours_of_operation,
        "amenities": payload.amenities,
        "description": payload.description,
        "image": payload.image,
        "avg_rating": 0.0,
        "view_count": 0,
    }

    result = mongo_db.restaurants.insert_one(restaurant_doc)

    created_restaurant = mongo_db.restaurants.find_one({"_id": result.inserted_id})

    return {
        "id": str(created_restaurant["_id"]),
        "owner_id": created_restaurant.get("owner_id"),
        "created_by_user_id": created_restaurant.get("created_by_user_id"),
        "name": created_restaurant.get("name"),
        "address": created_restaurant.get("address"),
        "city": created_restaurant.get("city"),
        "state": created_restaurant.get("state"),
        "zip_code": created_restaurant.get("zip_code"),
        "cuisine": created_restaurant.get("cuisine"),
        "price_range": created_restaurant.get("price_range"),
        "phone": created_restaurant.get("phone"),
        "website": created_restaurant.get("website"),
        "hours_of_operation": created_restaurant.get("hours_of_operation"),
        "amenities": created_restaurant.get("amenities"),
        "description": created_restaurant.get("description"),
        "image": created_restaurant.get("image"),
        "avg_rating": created_restaurant.get("avg_rating"),
        "view_count": created_restaurant.get("view_count"),
    }


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
        view_count=0,
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("/search", response_model=list[RestaurantPublic])
def search_restaurants(
    name: Optional[str] = None,
    cuisine: Optional[List[str]] = Query(default=None),
    keyword: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Restaurant)

    if name:
        query = query.filter(Restaurant.name.ilike(f"%{name}%"))

    if cuisine:
        query = query.filter(
            or_(*[Restaurant.cuisine.ilike(f"%{c}%") for c in cuisine])
        )

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
    query = db.query(Restaurant).filter(Restaurant.owner_id == current_owner.id)
    if restaurant_id:
        query = query.filter(Restaurant.id == restaurant_id)
    restaurant = query.first()

    if not restaurant:
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
        return {
            "restaurants": [],
            "review_count": 0,
            "favourites_count": 0,
            "avg_rating": 0.0,
            "total_views": 0,
            "rating_distribution": [
                {"stars": 5, "count": 0},
                {"stars": 4, "count": 0},
                {"stars": 3, "count": 0},
                {"stars": 2, "count": 0},
                {"stars": 1, "count": 0},
            ],
            "sentiment_summary": {
                "label": "No Data",
                "score": 0,
                "positive": 0,
                "neutral": 0,
                "negative": 0,
            },
            "recent_reviews": [],
        }

    total_review_count = 0
    total_favourites_count = 0
    total_views = 0
    all_reviews = []
    all_comments = []
    rating_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    restaurant_list = []

    for restaurant in restaurants:
        restaurant_reviews = (
            db.query(Review)
            .filter(Review.restaurant_id == restaurant.id)
            .order_by(Review.created_at.desc())
            .all()
        )

        review_count = len(restaurant_reviews)
        favourites_count = db.query(Favourite).filter(Favourite.restaurant_id == restaurant.id).count()

        total_review_count += review_count
        total_favourites_count += favourites_count
        total_views += restaurant.view_count or 0
        all_reviews.extend(restaurant_reviews)

        for review in restaurant_reviews:
            if review.rating in rating_counts:
                rating_counts[review.rating] += 1
            if review.comment:
                all_comments.append(review.comment)

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
            "view_count": restaurant.view_count or 0,
            "review_count": review_count,
            "favourites_count": favourites_count,
        })

    avg_rating = round(
        sum((restaurant.avg_rating or 0) for restaurant in restaurants) / len(restaurants),
        1
    ) if restaurants else 0.0

    rating_distribution = [
        {"stars": 5, "count": rating_counts[5]},
        {"stars": 4, "count": rating_counts[4]},
        {"stars": 3, "count": rating_counts[3]},
        {"stars": 2, "count": rating_counts[2]},
        {"stars": 1, "count": rating_counts[1]},
    ]

    sentiment_summary = analyze_sentiment(all_comments)

    return {
        "restaurants": restaurant_list,
        "review_count": total_review_count,
        "favourites_count": total_favourites_count,
        "avg_rating": avg_rating,
        "total_views": total_views,
        "rating_distribution": rating_distribution,
        "sentiment_summary": sentiment_summary,
        "recent_reviews": sorted(all_reviews, key=lambda x: x.created_at, reverse=True)[:5],
    }


@router.get("/{restaurant_id}", response_model=RestaurantDetailPublic)
def get_restaurant_details(
    restaurant_id: int,
    db: Session = Depends(get_db),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    restaurant.view_count = (restaurant.view_count or 0) + 1
    db.commit()
    db.refresh(restaurant)

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
        "created_at": restaurant.created_at,
        "review_count": len(reviews),
        "reviews": reviews,
    }