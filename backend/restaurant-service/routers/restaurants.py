from mongodb import db as mongo_db
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from schemas.restaurant import (
    RestaurantCreateRequest,
    RestaurantPublic,
    RestaurantDetailPublic,
    RestaurantUpdateRequest,
)
from typing import Optional, List
from services.deps import get_current_user, get_current_owner
from datetime import datetime, timezone
import re


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


def normalize_amenities_for_response(amenities):
    if isinstance(amenities, list):
        return ", ".join(str(a).strip() for a in amenities if str(a).strip())
    if amenities is None:
        return ""
    return str(amenities)


def restaurant_public_dict(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "owner_id": doc.get("owner_id"),
        "created_by_user_id": doc.get("created_by_user_id"),
        "name": doc.get("name"),
        "address": doc.get("address"),
        "city": doc.get("city"),
        "state": doc.get("state"),
        "zip_code": doc.get("zip_code"),
        "cuisine": doc.get("cuisine"),
        "price_range": doc.get("price_range"),
        "phone": doc.get("phone"),
        "website": doc.get("website"),
        "hours_of_operation": doc.get("hours_of_operation"),
        "amenities": normalize_amenities_for_response(doc.get("amenities")),
        "description": doc.get("description"),
        "image": doc.get("image"),
        "avg_rating": doc.get("avg_rating", 0.0),
        "view_count": doc.get("view_count", 0),
        "created_at": doc.get("created_at"),
    }


@router.post("/", response_model=RestaurantPublic)
def create_restaurant(
    payload: RestaurantCreateRequest,
    current_owner=Depends(get_current_owner),
):
    restaurant_doc = {
        "owner_id": current_owner["id"],
        "created_by_user_id": None,
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
        "created_at": datetime.now(timezone.utc),
    }

    result = mongo_db.restaurants.insert_one(restaurant_doc)
    created_restaurant = mongo_db.restaurants.find_one({"_id": result.inserted_id})

    return restaurant_public_dict(created_restaurant)


@router.get("/search", response_model=list[RestaurantPublic])
def search_restaurants(
    name: Optional[str] = None,
    cuisine: Optional[List[str]] = Query(default=None),
    keyword: Optional[str] = None,
    location: Optional[str] = None,
):
    query = {}
    and_conditions = []

    if name:
        and_conditions.append({"name": {"$regex": name, "$options": "i"}})

    if cuisine:
        cuisine_conditions = []
        for c in cuisine:
            cuisine_conditions.append({"cuisine": {"$regex": c, "$options": "i"}})
        and_conditions.append({"$or": cuisine_conditions})

    if keyword:
        and_conditions.append(
            {
                "$or": [
                    {"description": {"$regex": keyword, "$options": "i"}},
                    {"amenities": {"$regex": keyword, "$options": "i"}},
                    {"name": {"$regex": keyword, "$options": "i"}},
                ]
            }
        )

    if location:
        and_conditions.append(
            {
                "$or": [
                    {"city": {"$regex": location, "$options": "i"}},
                    {"zip_code": {"$regex": location, "$options": "i"}},
                ]
            }
        )

    if and_conditions:
        query["$and"] = and_conditions

    results = list(mongo_db.restaurants.find(query))
    restaurants = [restaurant_public_dict(r) for r in results]
    return restaurants


@router.put("/{restaurant_id}", response_model=RestaurantPublic)
def update_restaurant(
    restaurant_id: str,
    payload: RestaurantUpdateRequest,
    current_user=Depends(get_current_user),
):
    try:
        restaurant_obj_id = ObjectId(restaurant_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid restaurant id")

    restaurant = mongo_db.restaurants.find_one(
        {"_id": restaurant_obj_id, "created_by_user_id": current_user["id"]}
    )

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    update_data = {}

    if payload.name is not None:
        update_data["name"] = payload.name
    if payload.address is not None:
        update_data["address"] = payload.address
    if payload.city is not None:
        update_data["city"] = payload.city
    if payload.state is not None:
        update_data["state"] = payload.state
    if payload.zip_code is not None:
        update_data["zip_code"] = payload.zip_code
    if payload.cuisine is not None:
        update_data["cuisine"] = payload.cuisine
    if payload.price_range is not None:
        update_data["price_range"] = payload.price_range
    if payload.phone is not None:
        update_data["phone"] = payload.phone
    if payload.website is not None:
        update_data["website"] = payload.website
    if payload.hours_of_operation is not None:
        update_data["hours_of_operation"] = payload.hours_of_operation
    if payload.description is not None:
        update_data["description"] = payload.description
    if payload.image is not None:
        update_data["image"] = payload.image
    if payload.amenities is not None:
        update_data["amenities"] = payload.amenities

    if update_data:
        mongo_db.restaurants.update_one({"_id": restaurant_obj_id}, {"$set": update_data})

    updated_restaurant = mongo_db.restaurants.find_one({"_id": restaurant_obj_id})
    return restaurant_public_dict(updated_restaurant)


@router.get("/{restaurant_id}", response_model=RestaurantDetailPublic)
def get_restaurant_details(restaurant_id: str):
    try:
        restaurant_obj_id = ObjectId(restaurant_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid restaurant id")

    restaurant = mongo_db.restaurants.find_one({"_id": restaurant_obj_id})

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    mongo_db.restaurants.update_one(
        {"_id": restaurant_obj_id},
        {"$inc": {"view_count": 1}},
    )

    updated_restaurant = mongo_db.restaurants.find_one({"_id": restaurant_obj_id})
    reviews = list(mongo_db.reviews.find({"restaurant_id": restaurant_id}).sort("created_at", -1))

    formatted_reviews = []
    for review in reviews:
        formatted_reviews.append(
            {
                "id": str(review["_id"]),
                "user_id": review.get("user_id"),
                "restaurant_id": review.get("restaurant_id"),
                "rating": review.get("rating"),
                "comment": review.get("comment"),
                "created_at": review.get("created_at"),
                "updated_at": review.get("updated_at"),
            }
        )

    return {
        "id": str(updated_restaurant["_id"]),
        "owner_id": updated_restaurant.get("owner_id"),
        "created_by_user_id": updated_restaurant.get("created_by_user_id"),
        "name": updated_restaurant.get("name"),
        "address": updated_restaurant.get("address"),
        "city": updated_restaurant.get("city"),
        "state": updated_restaurant.get("state"),
        "zip_code": updated_restaurant.get("zip_code"),
        "cuisine": updated_restaurant.get("cuisine"),
        "price_range": updated_restaurant.get("price_range"),
        "phone": updated_restaurant.get("phone"),
        "website": updated_restaurant.get("website"),
        "hours_of_operation": updated_restaurant.get("hours_of_operation"),
        "amenities": normalize_amenities_for_response(updated_restaurant.get("amenities")),
        "description": updated_restaurant.get("description"),
        "image": updated_restaurant.get("image"),
        "avg_rating": updated_restaurant.get("avg_rating", 0.0),
        "created_at": updated_restaurant.get("created_at"),
        "review_count": len(formatted_reviews),
        "reviews": formatted_reviews,
    }

@router.post("/{restaurant_id}/claim")
def claim_restaurant(
    restaurant_id: str,
    current_owner=Depends(get_current_owner),
):
    try:
        restaurant_obj_id = ObjectId(restaurant_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid restaurant id")

    restaurant = mongo_db.restaurants.find_one({"_id": restaurant_obj_id})

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Check if already claimed
    if restaurant.get("owner_id"):
        raise HTTPException(status_code=400, detail="Restaurant already claimed")

    # Assign owner
    mongo_db.restaurants.update_one(
        {"_id": restaurant_obj_id},
        {"$set": {"owner_id": current_owner["id"]}},
    )

    return {"message": "Restaurant claimed successfully"}