from pydantic import BaseModel
from typing import List, Optional, Literal


class PreferenceUpdateRequest(BaseModel):
    cuisines: List[str] = []
    dietary: List[str] = []
    ambiance: List[str] = []

    price_range: Optional[str] = None
    sort_preference: Optional[Literal["rating", "distance", "popularity", "price"]] = None
    preferred_location: Optional[str] = None
    search_radius: Optional[int] = None