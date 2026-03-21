import os
from typing import List, Dict, Any

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from tavily import TavilyClient

from models.restaurants import Restaurant
from models.preference import Preference
from models.cuisine_type import CuisineType
from models.user_cuisine import UserCuisine

load_dotenv()


def get_llm():
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.4,
        api_key=os.getenv("OPENAI_API_KEY"),
    )


def get_tavily_client():
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return None
    return TavilyClient(api_key=api_key)


def format_restaurants_for_prompt(restaurants: List[Restaurant]) -> str:
    lines = []
    for r in restaurants:
        lines.append(
            f"- ID: {r.id}, Name: {r.name}, City: {r.city}, Cuisine: {r.cuisine}, "
            f"Price: {r.price_range}, Rating: {r.avg_rating}, "
            f"Amenities: {r.amenities}, Description: {r.description}"
        )
    return "\n".join(lines)


def load_user_preferences(db, user_id: int) -> Dict[str, Any]:
    pref = db.query(Preference).filter(Preference.user_id == user_id).first()

    cuisines = (
        db.query(CuisineType.name)
        .join(UserCuisine, UserCuisine.cuisine_id == CuisineType.id)
        .filter(UserCuisine.user_id == user_id)
        .all()
    )
    cuisines = [row[0] for row in cuisines]

    return {
        "price_range": pref.price_range if pref else None,
        "sort_preference": pref.sort_preference if pref else None,
        "preferred_location": pref.preferred_location if pref else None,
        "search_radius": pref.search_radius if pref else None,
        "cuisines": cuisines,
    }


def search_restaurant_candidates(db, preferences: Dict[str, Any]) -> List[Restaurant]:
    query = db.query(Restaurant)

    if preferences.get("preferred_location"):
        location = preferences["preferred_location"]
        query = query.filter(Restaurant.city.ilike(f"%{location}%"))

    if preferences.get("price_range"):
        query = query.filter(Restaurant.price_range == preferences["price_range"])

    cuisines = preferences.get("cuisines") or []
    if cuisines:
        from sqlalchemy import or_
        query = query.filter(or_(*[Restaurant.cuisine.ilike(f"%{c}%") for c in cuisines]))

    return query.order_by(Restaurant.avg_rating.desc()).limit(10).all()


def maybe_get_tavily_context(user_message: str) -> str:
    client = get_tavily_client()
    if not client:
        return ""

    try:
        result = client.search(
            query=user_message,
            search_depth="basic",
            max_results=3,
        )
        results = result.get("results", [])
        if not results:
            return ""

        formatted = []
        for item in results:
            title = item.get("title", "")
            content = item.get("content", "")
            formatted.append(f"Title: {title}\nContent: {content}")

        return "\n\n".join(formatted)
    except Exception:
        return ""


def build_messages(
    user_message: str,
    conversation_history: List[Dict[str, str]],
    preferences: Dict[str, Any],
    restaurant_context: str,
    tavily_context: str,
):
    system_prompt = f"""
You are an AI restaurant assistant for a Yelp-like application.

Your job:
- understand the user's restaurant request
- use the user's saved preferences
- use the restaurant database candidates provided
- answer naturally in a helpful conversational way
- recommend restaurants only from the provided restaurant candidates
- if relevant, use the tavily context for current context such as trends or extra details
- keep answers concise and practical
- if no exact match exists, explain that and suggest the closest good options

User preferences:
{preferences}

Restaurant candidates:
{restaurant_context}

External context:
{tavily_context}
""".strip()

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history)
    messages.append({"role": "user", "content": user_message})
    return messages


def extract_recommended_restaurants(reply_text: str, restaurants: List[Restaurant]) -> List[Restaurant]:
    lower_reply = reply_text.lower()
    matched = []
    for restaurant in restaurants:
        if restaurant.name and restaurant.name.lower() in lower_reply:
            matched.append(restaurant)

    if matched:
        return matched[:5]

    return restaurants[:5]