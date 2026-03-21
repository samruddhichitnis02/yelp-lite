from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.favourite import Favourite
from models.restaurants import Restaurant
from models.users import User
from schemas.favourite import FavouriteCreateRequest, FavouritePublic
from services.deps import get_current_user

router = APIRouter(prefix="/favourites", tags=["favourites"])