from pydantic import BaseModel
from typing import List
from schemas.review import ReviewPublic
from schemas.restaurant import RestaurantPublic


class RatingDistributionItem(BaseModel):
    stars: int
    count: int


class SentimentSummary(BaseModel):
    label: str
    positive: int
    neutral: int
    negative: int


class OwnerDashboardResponse(BaseModel):
    restaurants: List[RestaurantPublic]
    review_count: int
    favourites_count: int
    avg_rating: float
    recent_reviews: List[ReviewPublic]
    rating_distribution: List[RatingDistributionItem]
    sentiment_summary: SentimentSummary