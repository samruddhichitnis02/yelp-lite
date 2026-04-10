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


def search_restaurant_candidates(db, preferences: Dict[str, Any], user_message: str) -> List[Restaurant]:
    from sqlalchemy import or_

    lower_message = user_message.lower()

    # --- Detect explicit cuisine ---
    explicit_cuisine = None
    all_cuisines = db.query(Restaurant.cuisine).filter(Restaurant.cuisine.isnot(None)).distinct().all()
    for row in all_cuisines:
        cuisine = row[0]
        if cuisine and cuisine.lower() in lower_message:
            explicit_cuisine = cuisine
            break

    # --- Detect explicit location ---
    explicit_location = None
    all_cities = db.query(Restaurant.city).filter(Restaurant.city.isnot(None)).distinct().all()
    for row in all_cities:
        city = row[0]
        if city and city.lower() in lower_message:
            explicit_location = city
            break

    # --- Detect explicit price ---
    explicit_price = None
    for p in ["$$$$", "$$$", "$$", "$"]:
        if p in lower_message:
            explicit_price = p
            break

    # ---------- PASS 1: strict explicit filters ----------
    query = db.query(Restaurant)

    if explicit_cuisine:
        query = query.filter(Restaurant.cuisine.ilike(f"%{explicit_cuisine}%"))

    if explicit_location:
        query = query.filter(Restaurant.city.ilike(f"%{explicit_location}%"))

    if explicit_price:
        query = query.filter(Restaurant.price_range == explicit_price)

    results = query.order_by(Restaurant.avg_rating.desc()).limit(10).all()
    if results:
        return results

    # ---------- PASS 2: explicit filters only, ignore price ----------
    query = db.query(Restaurant)

    if explicit_cuisine:
        query = query.filter(Restaurant.cuisine.ilike(f"%{explicit_cuisine}%"))

    if explicit_location:
        query = query.filter(Restaurant.city.ilike(f"%{explicit_location}%"))

    results = query.order_by(Restaurant.avg_rating.desc()).limit(10).all()
    if results:
        return results

    # ---------- PASS 3: use preferences as fallback ----------
    query = db.query(Restaurant)

    if preferences.get("preferred_location"):
        query = query.filter(Restaurant.city.ilike(f"%{preferences['preferred_location']}%"))

    cuisines = preferences.get("cuisines") or []
    if cuisines:
        query = query.filter(
            or_(*[Restaurant.cuisine.ilike(f"%{c}%") for c in cuisines])
        )

    if preferences.get("price_range"):
        query = query.filter(Restaurant.price_range == preferences["price_range"])

    results = query.order_by(Restaurant.avg_rating.desc()).limit(10).all()
    if results:
        return results

    # ---------- PASS 4: fallback to top-rated restaurants ----------
    return db.query(Restaurant).order_by(Restaurant.avg_rating.desc()).limit(10).all()


def is_location_in_database(db, user_message: str) -> bool:
    """Check if the user's message mentions a location that exists in our database."""
    lower_message = user_message.lower()
    all_cities = db.query(Restaurant.city).filter(Restaurant.city.isnot(None)).distinct().all()
    for row in all_cities:
        city = row[0]
        if city and city.lower() in lower_message:
            return True
    return False


def maybe_get_tavily_context(user_message: str) -> str:
    client = get_tavily_client()
    if not client:
        return ""

    try:
        # Make the query more restaurant-specific so Tavily returns useful results
        search_query = f"best restaurants {user_message}"
        result = client.search(
            query=search_query,
            search_depth="basic",
            max_results=5,
        )
        results = result.get("results", [])
        if not results:
            return ""

        formatted = []
        for item in results:
            title = item.get("title", "")
            content = item.get("content", "")
            url = item.get("url", "")
            formatted.append(f"Source: {url}\nTitle: {title}\nContent: {content}")

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
    system_prompt = (
        "You are a friendly, conversational AI restaurant assistant for a Yelp-like application.\n\n"
        "You have access to TWO sources of restaurant information:\n"
        "1. DATABASE RESTAURANTS — restaurants listed in our app (provided below as 'Restaurant candidates')\n"
        "2. EXTERNAL WEB RESULTS — real-world restaurant info fetched from the web via Tavily (provided below as 'External context')\n\n"
        "Your behaviour rules:\n"
        "- ALWAYS read and directly respond to what the user actually said first.\n"
        "- If the user is greeting you, making small talk, or asking a general question — respond naturally and conversationally. Do NOT jump straight into restaurant recommendations.\n"
        "- Only recommend restaurants when the user is clearly looking for one (e.g. asking for food, a place to eat, suggestions, etc.)\n"
        "- LOCATION RULE — this is the most important rule:\n"
        "    * If the user asks about a location that has results in the DATABASE RESTAURANTS list → recommend from the database only.\n"
        "    * If the user asks about a location NOT covered in the database (e.g. India, Los Angeles, London, Tokyo, or any place not in the candidates list) → use the EXTERNAL WEB RESULTS (Tavily) to answer. Clearly mention the restaurant names, locations and any relevant details from those web results.\n"
        "    * Never say 'I don't have information' if Tavily context is available — use it.\n"
        "- When using Tavily results, present them naturally as recommendations, mentioning the source is from web search.\n"
        "- User preferences are background context — prioritise what the user says in their current message over their saved preferences.\n"
        "- Keep responses warm, concise, and human. Do not sound robotic or list things unnecessarily.\n"
        "- Support multi-turn conversation — remember what was said earlier and respond accordingly.\n\n"
        "Examples of correct behaviour:\n"
        "- User asks 'best restaurants in San Jose' and DB has San Jose restaurants → recommend from database.\n"
        "- User asks 'best restaurants in Mumbai' and DB has no Mumbai restaurants → use Tavily web results to answer.\n"
        "- User asks 'good Italian place in Los Angeles' and DB has no LA restaurants → use Tavily web results.\n"
        "- User says 'hi' → respond with a friendly greeting. Do NOT list restaurants.\n\n"
        f"User preferences (background context only):\n{preferences}\n\n"
        f"Restaurant candidates (from our database):\n{restaurant_context}\n\n"
        f"External web context (use this for locations not in the database):\n{tavily_context}"
    )

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

    # Only return restaurants the bot actually named in its reply.
    # If it didn't mention any (e.g. greeting, small talk, or Tavily-based answer), return nothing
    # so no database restaurant cards are shown when answering about other cities.
    return matched[:5]