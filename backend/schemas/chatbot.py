from pydantic import BaseModel
from typing import List, Optional


class ChatbotRequest(BaseModel):
    message: str


class ChatbotRestaurant(BaseModel):
    id: int
    name: str
    city: Optional[str] = None
    cuisine: Optional[str] = None
    price_range: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None


class ChatbotResponse(BaseModel):
    reply: str
    recommendations: List[ChatbotRestaurant]