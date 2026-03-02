from fastapi import APIRouter, Depends
from models.users import User
from models.owner import Owner
from services.deps import get_current_user, get_current_owner

router = APIRouter(prefix="/me", tags=["me"])

@router.get("/user")
def me_user(current_user: User = Depends(get_current_user)):
    return {
        "role": "user",
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
    }

@router.get("/owner")
def me_owner(current_owner: Owner = Depends(get_current_owner)):
    return {
        "role": "owner",
        "id": current_owner.id,
        "name": current_owner.name,
        "email": current_owner.email,
    }