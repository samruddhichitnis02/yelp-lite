from pydantic import BaseModel
from typing import List
from schemas.restaurant import RestaurantPublic
from schemas.review import ReviewPublic


class UserHistoryResponse(BaseModel):
    restaurants_added: List[RestaurantPublic]
    reviews_written: List[ReviewPublic]