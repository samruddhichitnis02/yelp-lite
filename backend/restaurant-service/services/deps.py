import os
from typing import Optional

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from mongodb import db as mongo_db

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/user/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/user/login", auto_error=False)


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)

    if payload.get("role") != "user":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not a user token"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    try:
        user = mongo_db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user id in token"
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    user["id"] = str(user["_id"])
    return user


def get_optional_user(token: Optional[str] = Depends(oauth2_scheme_optional)):
    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

    if payload.get("role") != "user":
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        user = mongo_db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None

    if not user:
        return None

    user["id"] = str(user["_id"])
    return user


def get_current_owner(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)

    if payload.get("role") != "owner":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not an owner token"
        )

    owner_id = payload.get("sub")
    if not owner_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    try:
        owner = mongo_db.owners.find_one({"_id": ObjectId(owner_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid owner id in token"
        )

    if not owner:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Owner not found"
        )

    owner["id"] = str(owner["_id"])
    return owner

def get_current_user_or_owner(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    role = payload.get("role")
    subject_id = payload.get("sub")

    if not subject_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    if role == "user":
        try:
            entity = mongo_db.users.find_one({"_id": ObjectId(subject_id)})
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user id")
        if not entity:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        entity["id"] = str(entity["_id"])
        return entity

    elif role == "owner":
        try:
            entity = mongo_db.owners.find_one({"_id": ObjectId(subject_id)})
        except Exception:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid owner id")
        if not entity:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Owner not found")
        entity["id"] = str(entity["_id"])
        return entity

    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid role in token")