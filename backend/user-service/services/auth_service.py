import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Dict

from dotenv import load_dotenv
from jose import jwt, JWTError
from passlib.context import CryptContext


from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from mongodb import db as mongo_db

load_dotenv()

# Password hashing (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings (store SECRET_KEY in .env)
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_minutes: Optional[int] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes if expires_minutes is not None else ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # Keep generic so we don't leak details
        raise ValueError("Invalid or expired token")
    



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/user/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    role = payload.get("role")

    if not user_id or role != "user":
        raise HTTPException(status_code=401, detail="Invalid user token")

    try:
        user = mongo_db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid user id")

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    user["id"] = str(user["_id"])
    return user