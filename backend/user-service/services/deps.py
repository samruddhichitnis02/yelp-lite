from typing import Optional
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from mongodb import db as mongo_db
from services.auth_service import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/user/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/user/login", auto_error=False)


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

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


# def get_current_owner(token: str = Depends(oauth2_scheme)):
#     try:
#         payload = decode_access_token(token)
#     except Exception:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid or expired token"
#         )

#     if payload.get("role") != "owner":
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Not an owner token"
#         )

#     owner_id = payload.get("sub")
#     if not owner_id:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid token payload"
#         )

#     try:
#         owner = mongo_db.owners.find_one({"_id": ObjectId(owner_id)})
#     except Exception:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid owner id in token"
#         )

#     if not owner:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Owner not found"
#         )

#     owner["id"] = str(owner["_id"])
#     return owner


def get_optional_user(token: Optional[str] = Depends(oauth2_scheme_optional)):
    if not token:
        return None

    try:
        payload = decode_access_token(token)
    except Exception:
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