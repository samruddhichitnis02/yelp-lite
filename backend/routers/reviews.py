from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.owner import Owner

from bson import ObjectId
from datetime import datetime
from mongodb import db as mongo_db

from database import get_db
from models.review import Review
from models.restaurants import Restaurant
from models.users import User
from schemas.review import ReviewCreateRequest, ReviewUpdateRequest, ReviewPublic
from services.deps import get_current_user, get_current_owner

router = APIRouter(prefix="/reviews", tags=["reviews"])
 
@router.post("/", response_model=ReviewPublic)
def create_review(
    payload: ReviewCreateRequest,
    current_user = Depends(get_current_user),
):
    try:
        restaurant_obj_id = ObjectId(payload.restaurant_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid restaurant id")

    restaurant = mongo_db.restaurants.find_one({"_id": restaurant_obj_id})
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    review_doc = {
        "user_id": current_user["id"],
        "restaurant_id": payload.restaurant_id,
        "rating": payload.rating,
        "comment": payload.comment,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = mongo_db.reviews.insert_one(review_doc)
    created_review = mongo_db.reviews.find_one({"_id": result.inserted_id})

    restaurant_reviews = list(
        mongo_db.reviews.find({"restaurant_id": payload.restaurant_id})
    )

    if restaurant_reviews:
        avg_rating = sum(r.get("rating", 0) for r in restaurant_reviews) / len(restaurant_reviews)
    else:
        avg_rating = 0.0

    mongo_db.restaurants.update_one(
        {"_id": restaurant_obj_id},
        {"$set": {"avg_rating": float(avg_rating)}},
    )

    return {
        "id": str(created_review["_id"]),
        "user_id": created_review.get("user_id"),
        "restaurant_id": created_review.get("restaurant_id"),
        "rating": created_review.get("rating"),
        "comment": created_review.get("comment"),
        "created_at": created_review.get("created_at"),
    }

@router.put("/{review_id}", response_model=ReviewPublic)
def update_review(
    review_id: str,
    payload: ReviewUpdateRequest,
    current_user = Depends(get_current_user),
):
    try:
        review_obj_id = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid review id")

    review = mongo_db.reviews.find_one({"_id": review_obj_id})

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only edit your own review")

    mongo_db.reviews.update_one(
        {"_id": review_obj_id},
        {
            "$set": {
                "rating": payload.rating,
                "comment": payload.comment,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    updated_review = mongo_db.reviews.find_one({"_id": review_obj_id})

    restaurant_id = updated_review.get("restaurant_id")
    restaurant_reviews = list(mongo_db.reviews.find({"restaurant_id": restaurant_id}))

    if restaurant_reviews:
        avg_rating = sum(r.get("rating", 0) for r in restaurant_reviews) / len(restaurant_reviews)
    else:
        avg_rating = 0.0

    try:
        restaurant_obj_id = ObjectId(restaurant_id)
        mongo_db.restaurants.update_one(
            {"_id": restaurant_obj_id},
            {"$set": {"avg_rating": float(avg_rating)}},
        )
    except Exception:
        pass

    return {
        "id": str(updated_review["_id"]),
        "user_id": updated_review.get("user_id"),
        "restaurant_id": updated_review.get("restaurant_id"),
        "rating": updated_review.get("rating"),
        "comment": updated_review.get("comment"),
        "created_at": updated_review.get("created_at"),
    }

@router.delete("/{review_id}")
def delete_review(
    review_id: str,
    current_user = Depends(get_current_user),
):
    try:
        review_obj_id = ObjectId(review_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid review id")

    review = mongo_db.reviews.find_one({"_id": review_obj_id})

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own review")

    restaurant_id = review.get("restaurant_id")

    mongo_db.reviews.delete_one({"_id": review_obj_id})

    restaurant_reviews = list(mongo_db.reviews.find({"restaurant_id": restaurant_id}))

    if restaurant_reviews:
        avg_rating = sum(r.get("rating", 0) for r in restaurant_reviews) / len(restaurant_reviews)
    else:
        avg_rating = 0.0

    try:
        restaurant_obj_id = ObjectId(restaurant_id)
        mongo_db.restaurants.update_one(
            {"_id": restaurant_obj_id},
            {"$set": {"avg_rating": float(avg_rating)}},
        )
    except Exception:
        pass

    return {"message": "Review deleted successfully"}

@router.get("/owner", response_model=list[ReviewPublic])
def get_owner_reviews(
    current_owner = Depends(get_current_owner),
):
    restaurant = mongo_db.restaurants.find_one({"owner_id": current_owner["id"]})

    if not restaurant:
        raise HTTPException(status_code=404, detail="No restaurant found for this owner")

    restaurant_id = str(restaurant["_id"])

    reviews = list(
        mongo_db.reviews.find({"restaurant_id": restaurant_id}).sort("created_at", -1)
    )

    formatted_reviews = []
    for review in reviews:
        formatted_reviews.append({
            "id": str(review["_id"]),
            "user_id": review.get("user_id"),
            "restaurant_id": review.get("restaurant_id"),
            "rating": review.get("rating"),
            "comment": review.get("comment"),
            "created_at": review.get("created_at"),
        })

    return formatted_reviews