from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ReviewSummary(BaseModel):
    id: str
    user_id: Optional[str] = None
    restaurant_id: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RestaurantCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    address: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default=None, max_length=120)
    state: Optional[str] = Field(default=None, max_length=60)
    zip_code: Optional[str] = Field(default=None, max_length=20)

    cuisine: Optional[str] = Field(default=None, max_length=120)
    price_range: Optional[str] = Field(default=None, max_length=10)
    phone: Optional[str] = Field(default=None, max_length=30)
    website: Optional[str] = Field(default=None, max_length=255)
    hours_of_operation: Optional[str] = Field(default=None, max_length=255)
    amenities: Optional[str] = None

    description: Optional[str] = None
    image: Optional[str] = Field(default=None, max_length=255)


class RestaurantPublic(BaseModel):
    id: str
    owner_id: Optional[str] = None
    created_by_user_id: Optional[str] = None

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
    view_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RestaurantDetailPublic(RestaurantPublic):
    review_count: int
    reviews: List[ReviewSummary] = []


class RestaurantUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    address: Optional[str] = Field(default=None, max_length=255)
    city: Optional[str] = Field(default=None, max_length=120)
    state: Optional[str] = Field(default=None, max_length=60)
    zip_code: Optional[str] = Field(default=None, max_length=20)

    cuisine: Optional[str] = Field(default=None, max_length=120)
    price_range: Optional[str] = Field(default=None, max_length=10)
    phone: Optional[str] = Field(default=None, max_length=30)
    website: Optional[str] = Field(default=None, max_length=255)
    hours_of_operation: Optional[str] = Field(default=None, max_length=255)
    amenities: Optional[str] = None

    description: Optional[str] = None
    image: Optional[str] = Field(default=None, max_length=255)