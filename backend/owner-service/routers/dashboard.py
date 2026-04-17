from fastapi import APIRouter, Depends, HTTPException
from mongodb import db as mongo_db
from services.deps import get_current_owner
from schemas.owner_dashboard import OwnerDashboardResponse

router = APIRouter(prefix="/owner", tags=["owner-dashboard"])


@router.get("/dashboard", response_model=OwnerDashboardResponse)
def get_owner_dashboard(current_owner=Depends(get_current_owner)):
    restaurant = mongo_db.restaurants.find_one({"owner_id": current_owner["id"]})

    if not restaurant:
        raise HTTPException(status_code=404, detail="No restaurant found for this owner")

    restaurant_id = str(restaurant["_id"])

    reviews = list(
        mongo_db.reviews.find({"restaurant_id": restaurant_id}).sort("created_at", -1)
    )

    favourites_count = mongo_db.favourites.count_documents({"restaurant_id": restaurant_id})
    review_count = len(reviews)

    if review_count > 0:
        avg_rating = sum(review.get("rating", 0) for review in reviews) / review_count
    else:
        avg_rating = 0.0

    formatted_restaurant = {
        "id": restaurant_id,
        "owner_id": restaurant.get("owner_id"),
        "created_by_user_id": restaurant.get("created_by_user_id"),
        "name": restaurant.get("name"),
        "address": restaurant.get("address"),
        "city": restaurant.get("city"),
        "state": restaurant.get("state"),
        "zip_code": restaurant.get("zip_code"),
        "cuisine": restaurant.get("cuisine"),
        "price_range": restaurant.get("price_range"),
        "phone": restaurant.get("phone"),
        "website": restaurant.get("website"),
        "hours_of_operation": restaurant.get("hours_of_operation"),
        "amenities": restaurant.get("amenities"),
        "description": restaurant.get("description"),
        "image": restaurant.get("image"),
        "avg_rating": float(avg_rating),
        "view_count": restaurant.get("view_count", 0),
        "created_at": restaurant.get("created_at"),
    }

    formatted_reviews = [
        {
            "id": str(review["_id"]),
            "user_id": review.get("user_id"),
            "restaurant_id": review.get("restaurant_id"),
            "rating": review.get("rating"),
            "comment": review.get("comment"),
            "created_at": review.get("created_at"),
        }
        for review in reviews[:5]
    ]

    return {
        "restaurant": formatted_restaurant,
        "review_count": review_count,
        "favourites_count": favourites_count,
        "avg_rating": float(avg_rating),
        "recent_reviews": formatted_reviews,
    }