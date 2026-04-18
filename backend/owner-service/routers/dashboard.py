from fastapi import APIRouter, Depends, HTTPException
from mongodb import db as mongo_db
from services.deps import get_current_owner
from schemas.owner_dashboard import OwnerDashboardResponse

router = APIRouter(prefix="/owner", tags=["owner-dashboard"])


def normalize_amenities(value):
    if isinstance(value, list):
        return ", ".join(str(x).strip() for x in value if str(x).strip())
    return value or ""


@router.get("/dashboard", response_model=OwnerDashboardResponse)
def get_owner_dashboard(current_owner=Depends(get_current_owner)):
    restaurants = list(mongo_db.restaurants.find({"owner_id": current_owner["id"]}))

    if not restaurants:
        return {
            "restaurants": [],
            "review_count": 0,
            "favourites_count": 0,
            "avg_rating": 0.0,
            "recent_reviews": [],
        }

    restaurant_ids = [str(r["_id"]) for r in restaurants]

    reviews = list(
        mongo_db.reviews.find({"restaurant_id": {"$in": restaurant_ids}}).sort("created_at", -1)
    )

    favourites_count = mongo_db.favourites.count_documents(
        {"restaurant_id": {"$in": restaurant_ids}}
    )
    review_count = len(reviews)

    if review_count > 0:
        avg_rating = sum(review.get("rating", 0) for review in reviews) / review_count
    else:
        avg_rating = 0.0

    formatted_restaurants = []
    for restaurant in restaurants:
        restaurant_id = str(restaurant["_id"])
        restaurant_reviews = [r for r in reviews if r.get("restaurant_id") == restaurant_id]
        restaurant_avg = (
            sum(r.get("rating", 0) for r in restaurant_reviews) / len(restaurant_reviews)
            if restaurant_reviews
            else 0.0
        )

        formatted_restaurants.append(
            {
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
                "amenities": normalize_amenities(restaurant.get("amenities")),
                "description": restaurant.get("description"),
                "image": restaurant.get("image"),
                "avg_rating": float(restaurant_avg),
                "view_count": restaurant.get("view_count", 0),
                "created_at": restaurant.get("created_at"),
            }
        )

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
        "restaurants": formatted_restaurants,
        "review_count": review_count,
        "favourites_count": favourites_count,
        "avg_rating": float(avg_rating),
        "recent_reviews": formatted_reviews,
    }