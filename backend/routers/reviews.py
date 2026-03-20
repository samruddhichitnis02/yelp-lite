from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.review import Review
from models.restaurants import Restaurant
from models.users import User
from schemas.review import ReviewCreateRequest, ReviewPublic
from services.deps import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])