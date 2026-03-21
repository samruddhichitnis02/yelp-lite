from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.users import User
from schemas.chatbot import ChatbotRequest, ChatbotResponse
from services.deps import get_current_user
from services.chatbot_service import (
    get_llm,
    load_user_preferences,
    search_restaurant_candidates,
    format_restaurants_for_prompt,
    maybe_get_tavily_context,
    build_messages,
    extract_recommended_restaurants,
)

router = APIRouter(prefix="/ai-assistant", tags=["ai-assistant"])


@router.post("/chat", response_model=ChatbotResponse)
def ai_assistant_chat(
    payload: ChatbotRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    preferences = load_user_preferences(db, current_user.id)
    # candidate_restaurants = search_restaurant_candidates(db, preferences)
    candidate_restaurants = search_restaurant_candidates(db, preferences, payload.message)
    restaurant_context = format_restaurants_for_prompt(candidate_restaurants)
    tavily_context = maybe_get_tavily_context(payload.message)

    llm = get_llm()
    messages = build_messages(
        user_message=payload.message,
        conversation_history=[msg.model_dump() for msg in payload.conversation_history],
        preferences=preferences,
        restaurant_context=restaurant_context,
        tavily_context=tavily_context,
    )

    response = llm.invoke(messages)
    reply_text = response.content if hasattr(response, "content") else str(response)

    recommended = extract_recommended_restaurants(reply_text, candidate_restaurants)

    return {
        "reply": reply_text,
        "recommendations": [
            {
                "id": r.id,
                "name": r.name,
                "city": r.city,
                "cuisine": r.cuisine,
                "price_range": r.price_range,
                "description": r.description,
                "image": r.image,
                "avg_rating": r.avg_rating,
            }
            for r in recommended
        ],
    }