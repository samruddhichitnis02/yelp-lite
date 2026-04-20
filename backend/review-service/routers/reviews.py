from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timezone
from mongodb import db as mongo_db
from schemas.review import ReviewCreateRequest, ReviewUpdateRequest, ReviewPublic
from services.deps import get_current_user, get_current_owner
from kafka_producer import publish_event

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/", response_model=ReviewPublic)
def create_review(
    payload: ReviewCreateRequest,
    current_user=Depends(get_current_user),
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
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = mongo_db.reviews.insert_one(review_doc)
    created_review = mongo_db.reviews.find_one({"_id": result.inserted_id})

    # Publish to Kafka — worker will update avg_rating in background
    publish_event("review.created", {
        "review_id": str(result.inserted_id),
        "restaurant_id": payload.restaurant_id,
        "rating": payload.rating,
        "user_id": current_user["id"],
    })

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
    current_user=Depends(get_current_user),
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
        {"$set": {
            "rating": payload.rating,
            "comment": payload.comment,
            "updated_at": datetime.now(timezone.utc),
        }},
    )

    updated_review = mongo_db.reviews.find_one({"_id": review_obj_id})

    # Publish to Kafka
    publish_event("review.updated", {
        "review_id": review_id,
        "restaurant_id": updated_review.get("restaurant_id"),
        "rating": payload.rating,
        "user_id": current_user["id"],
    })

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
    current_user=Depends(get_current_user),
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

    # Publish to Kafka
    publish_event("review.deleted", {
        "review_id": review_id,
        "restaurant_id": restaurant_id,
        "user_id": current_user["id"],
    })

    return {"message": "Review deleted successfully"}


@router.get("/owner", response_model=list[ReviewPublic])
def get_owner_reviews(
    current_owner=Depends(get_current_owner),
):
    restaurant = mongo_db.restaurants.find_one({"owner_id": current_owner["id"]})
    if not restaurant:
        raise HTTPException(status_code=404, detail="No restaurant found for this owner")

    restaurant_id = str(restaurant["_id"])
    reviews = list(mongo_db.reviews.find({"restaurant_id": restaurant_id}).sort("created_at", -1))

    return [{
        "id": str(r["_id"]),
        "user_id": r.get("user_id"),
        "restaurant_id": r.get("restaurant_id"),
        "rating": r.get("rating"),
        "comment": r.get("comment"),
        "created_at": r.get("created_at"),
    } for r in reviews]