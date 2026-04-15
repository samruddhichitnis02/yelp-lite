from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class HistoryRestaurantItem(BaseModel):
    id: int
    owner_id: Optional[int] = None

    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

    cuisine: Optional[str] = None
    price_range: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    hours_of_operation: Optional[str] = None
    amenities: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    avg_rating: float = 0.0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class HistoryReviewItem(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserHistoryResponse(BaseModel):
    restaurants_added: List[HistoryRestaurantItem]
    reviews_written: List[HistoryReviewItem]