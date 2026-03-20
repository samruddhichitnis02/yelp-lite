from pydantic import BaseModel
from datetime import datetime


class FavouriteCreateRequest(BaseModel):
    restaurant_id: int


class FavouritePublic(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    created_at: datetime

    class Config:
        from_attributes = True