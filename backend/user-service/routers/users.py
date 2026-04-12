# backend/routers/users.py
import shutil
from uuid import uuid4
from pathlib import Path
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, status

from mongodb import db as mongo_db
from schemas.users import UserPublic
from services.deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _save_upload_file(upload_file: UploadFile, dest_dir: Path) -> str:
    """
    Save an UploadFile to dest_dir and return the relative path (uploads/xxx.ext).
    """
    suffix = Path(upload_file.filename).suffix or ""
    suffix = suffix.lower()
    fname = f"{uuid4().hex}{suffix}"
    dest_path = dest_dir / fname

    with dest_path.open("wb") as out_file:
        shutil.copyfileobj(upload_file.file, out_file)

    return f"uploads/{fname}"


@router.put("/me", response_model=UserPublic)
def update_profile(
    name: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    about: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    languages: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    profile_pic: Optional[UploadFile] = File(None),
    current_user=Depends(get_current_user),
):
    user = mongo_db.users.find_one({"_id": ObjectId(current_user["id"])})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    update_data = {}

    if name is not None:
        cleaned_name = name.strip()
        if cleaned_name:
            update_data["name"] = cleaned_name

    if location is not None:
        update_data["location"] = location.strip()

    if phone is not None:
        update_data["phone"] = phone.strip()

    if about is not None:
        update_data["about"] = about.strip()

    if city is not None:
        update_data["city"] = city.strip()

    if state is not None:
        update_data["state"] = state.strip()

    if country is not None:
        update_data["country"] = country.strip()

    if languages is not None:
        # storing as string for now, to match your current API shape
        update_data["languages"] = languages.strip()

    if gender is not None:
        update_data["gender"] = gender.strip()

    if profile_pic is not None:
        try:
            rel_path = _save_upload_file(profile_pic, UPLOAD_DIR)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed saving file: {e}")

        old = user.get("profile_pic")
        update_data["profile_pic"] = rel_path

        if old:
            try:
                old_path = Path(old)
                if old_path.exists() and "uploads" in str(old_path):
                    old_path.unlink(missing_ok=True)
            except Exception:
                pass

    if update_data:
        mongo_db.users.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": update_data},
        )

    updated_user = mongo_db.users.find_one({"_id": ObjectId(current_user["id"])})
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found after update",
        )

    return {
        "id": str(updated_user["_id"]),
        "name": updated_user.get("name"),
        "email": updated_user.get("email"),
        "profile_pic": updated_user.get("profile_pic"),
        "location": updated_user.get("location"),
        "phone": updated_user.get("phone"),
        "about": updated_user.get("about"),
        "city": updated_user.get("city"),
        "state": updated_user.get("state"),
        "country": updated_user.get("country"),
        "languages": updated_user.get("languages"),
        "gender": updated_user.get("gender"),
    }