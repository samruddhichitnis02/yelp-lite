from pydantic import BaseModel
from typing import List
from schemas.review import ReviewPublic
from schemas.restaurant import RestaurantPublic


class OwnerDashboardResponse(BaseModel):
    restaurant: RestaurantPublic
    review_count: int
    favourites_count: int
    avg_rating: float
    recent_reviews: List[ReviewPublic]