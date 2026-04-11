import os
from typing import List, Dict, Any

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from tavily import TavilyClient

from mongodb import db as mongo_db

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


def format_restaurants_for_prompt(restaurants: List[Dict[str, Any]]) -> str:
    lines = []
    for r in restaurants:
        lines.append(
            f"- ID: {r.get('id')}, Name: {r.get('name')}, City: {r.get('city')}, Cuisine: {r.get('cuisine')}, "
            f"Price: {r.get('price_range')}, Rating: {r.get('avg_rating')}, "
            f"Amenities: {r.get('amenities')}, Description: {r.get('description')}"
        )
    return "\n".join(lines)


def load_user_preferences(user_id: str) -> Dict[str, Any]:
    user = mongo_db.users.find_one({"_id": __to_object_id(user_id)})
    if not user:
        return {
            "price_range": None,
            "sort_preference": None,
            "preferred_location": None,
            "search_radius": None,
            "cuisines": [],
        }

    prefs = user.get("preferences", {})

    return {
        "price_range": prefs.get("price_range"),
        "sort_preference": prefs.get("sort_preference"),
        "preferred_location": prefs.get("preferred_location"),
        "search_radius": prefs.get("search_radius"),
        "cuisines": prefs.get("cuisines", []),
    }


def search_restaurant_candidates(preferences: Dict[str, Any], user_message: str) -> List[Dict[str, Any]]:
    lower_message = user_message.lower()

    all_restaurants = list(mongo_db.restaurants.find())

    # --- Detect explicit cuisine ---
    explicit_cuisine = None
    all_cuisines = {r.get("cuisine") for r in all_restaurants if r.get("cuisine")}
    for cuisine in all_cuisines:
        if cuisine and cuisine.lower() in lower_message:
            explicit_cuisine = cuisine
            break

    # --- Detect explicit location ---
    explicit_location = None
    all_cities = {r.get("city") for r in all_restaurants if r.get("city")}
    for city in all_cities:
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
    results = []
    for r in all_restaurants:
        if explicit_cuisine and (not r.get("cuisine") or explicit_cuisine.lower() not in r.get("cuisine", "").lower()):
            continue
        if explicit_location and (not r.get("city") or explicit_location.lower() not in r.get("city", "").lower()):
            continue
        if explicit_price and r.get("price_range") != explicit_price:
            continue
        results.append(r)

    results = sorted(results, key=lambda x: x.get("avg_rating", 0), reverse=True)[:10]
    if results:
        return [serialize_restaurant(r) for r in results]

    # ---------- PASS 2: explicit filters only, ignore price ----------
    results = []
    for r in all_restaurants:
        if explicit_cuisine and (not r.get("cuisine") or explicit_cuisine.lower() not in r.get("cuisine", "").lower()):
            continue
        if explicit_location and (not r.get("city") or explicit_location.lower() not in r.get("city", "").lower()):
            continue
        results.append(r)

    results = sorted(results, key=lambda x: x.get("avg_rating", 0), reverse=True)[:10]
    if results:
        return [serialize_restaurant(r) for r in results]

    # ---------- PASS 3: use preferences as fallback ----------
    results = []
    preferred_location = preferences.get("preferred_location")
    cuisines = preferences.get("cuisines") or []
    price_range = preferences.get("price_range")

    for r in all_restaurants:
        if preferred_location and (not r.get("city") or preferred_location.lower() not in r.get("city", "").lower()):
            continue

        if cuisines:
            cuisine_match = False
            restaurant_cuisine = (r.get("cuisine") or "").lower()
            for c in cuisines:
                if c.lower() in restaurant_cuisine:
                    cuisine_match = True
                    break
            if not cuisine_match:
                continue

        if price_range and r.get("price_range") != price_range:
            continue

        results.append(r)

    results = sorted(results, key=lambda x: x.get("avg_rating", 0), reverse=True)[:10]
    if results:
        return [serialize_restaurant(r) for r in results]

    # ---------- PASS 4: fallback to top-rated restaurants ----------
    fallback = sorted(all_restaurants, key=lambda x: x.get("avg_rating", 0), reverse=True)[:10]
    return [serialize_restaurant(r) for r in fallback]


def maybe_get_tavily_context(user_message: str) -> str:
    client = get_tavily_client()
    if not client:
        return ""

    try:
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


def extract_recommended_restaurants(reply_text: str, restaurants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    lower_reply = reply_text.lower()
    matched = []
    for restaurant in restaurants:
        restaurant_name = restaurant.get("name")
        if restaurant_name and restaurant_name.lower() in lower_reply:
            matched.append(restaurant)

    return matched[:5]


def serialize_restaurant(r: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(r["_id"]),
        "name": r.get("name"),
        "city": r.get("city"),
        "cuisine": r.get("cuisine"),
        "price_range": r.get("price_range"),
        "description": r.get("description"),
        "image": r.get("image"),
        "avg_rating": r.get("avg_rating", 0.0),
        "amenities": r.get("amenities"),
    }


def __to_object_id(value: str):
    from bson import ObjectId
    return ObjectId(value)