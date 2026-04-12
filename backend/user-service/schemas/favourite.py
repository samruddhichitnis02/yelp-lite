from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FavouriteCreateRequest(BaseModel):
    restaurant_id: str


class FavouritePublic(BaseModel):
    id: str
    user_id: Optional[str]
    restaurant_id: Optional[str]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True