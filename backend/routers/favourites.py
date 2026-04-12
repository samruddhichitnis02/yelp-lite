from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId

from mongodb import db as mongo_db
from services.auth_service import get_current_user


router = APIRouter(prefix="/favourites", tags=["favourites"])


@router.post("/{restaurant_id}")
def add_favourite(restaurant_id: str, current_user=Depends(get_current_user)):
    restaurant = None
    try:
        restaurant = mongo_db.restaurants.find_one({"_id": ObjectId(restaurant_id)})
    except Exception:
        restaurant = None

    if not restaurant:
        restaurant = mongo_db.restaurants.find_one({"id": restaurant_id})

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    existing = mongo_db.favourites.find_one(
        {
            "user_id": current_user["id"],
            "restaurant_id": restaurant_id,
        }
    )

    if existing:
        return {"message": "Already in favourites"}

    mongo_db.favourites.insert_one(
        {
            "user_id": current_user["id"],
            "restaurant_id": restaurant_id,
        }
    )

    return {"message": "Added to favourites"}


@router.get("/", response_model=List[dict])
def get_favourites(current_user=Depends(get_current_user)):
    favourites = list(mongo_db.favourites.find({"user_id": current_user["id"]}))

    restaurant_ids = [fav["restaurant_id"] for fav in favourites]

    valid_object_ids = [ObjectId(rid) for rid in restaurant_ids if ObjectId.is_valid(rid)]
    restaurants = []

    if valid_object_ids:
        restaurants.extend(list(mongo_db.restaurants.find({"_id": {"$in": valid_object_ids}})))

    string_id_restaurants = list(mongo_db.restaurants.find({"id": {"$in": restaurant_ids}}))
    restaurants.extend(string_id_restaurants)

    seen_ids = set()
    result = []

    for r in restaurants:
        rid = str(r["_id"])
        if rid in seen_ids:
            continue
        seen_ids.add(rid)

        r["id"] = rid
        del r["_id"]
        result.append(r)

    return result


@router.delete("/{restaurant_id}")
def remove_favourite(restaurant_id: str, current_user=Depends(get_current_user)):
    result = mongo_db.favourites.delete_one(
        {
            "user_id": current_user["id"],
            "restaurant_id": restaurant_id,
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favourite not found")

    return {"message": "Removed from favourites"}