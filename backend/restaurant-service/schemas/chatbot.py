from pydantic import BaseModel
from typing import List, Optional


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatbotRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []


class ChatbotRestaurant(BaseModel):
    id: int
    name: str
    city: Optional[str] = None
    cuisine: Optional[str] = None
    price_range: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    avg_rating: Optional[float] = None


class ChatbotResponse(BaseModel):
    reply: str
    recommendations: List[ChatbotRestaurant]