from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
from models.users import User
from models.owner import Owner
from services.auth_service import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/user/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    if payload.get("role") != "user":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not a user token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def get_current_owner(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> Owner:
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    if payload.get("role") != "owner":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not an owner token")

    owner_id = payload.get("sub")
    owner = db.query(Owner).filter(Owner.id == int(owner_id)).first()
    if not owner:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Owner not found")
    return owner

# Optional variant — returns None instead of raising 401 when no/invalid token
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/user/login", auto_error=False)

def get_optional_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme_optional),
) -> Optional[User]:
    """Like get_current_user but returns None for unauthenticated requests."""
    if not token:
        return None
    try:
        payload = decode_access_token(token)
    except ValueError:
        return None

    if payload.get("role") != "user":
        return None

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user