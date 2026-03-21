from pydantic import BaseModel
from typing import List, Optional, Literal


class PreferenceUpdateRequest(BaseModel):
    cuisine_ids: List[int] = []
    dietary_ids: List[int] = []
    ambiance_ids: List[int] = []

    price_range: Optional[str] = None
    sort_preference: Optional[Literal["rating", "distance", "popularity", "price"]] = None
    preferred_location: Optional[str] = None
    search_radius: Optional[int] = None