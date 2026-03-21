# backend/routers/users.py
import os
import shutil
from uuid import uuid4
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.users import User
from schemas.users import UserPublic
from services.deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

UPLOAD_DIR = Path("uploads")
# ensure uploads dir exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _save_upload_file(upload_file: UploadFile, dest_dir: Path) -> str:
    """
    Save an UploadFile to dest_dir and return the relative path (uploads/xxx.ext).
    Uses a uuid filename to avoid collisions and strips dangerous characters.
    """
    # get extension safely
    suffix = Path(upload_file.filename).suffix or ""
    # normalize extension to lower
    suffix = suffix.lower()
    # create random filename
    fname = f"{uuid4().hex}{suffix}"
    dest_path = dest_dir / fname

    # write file to disk (stream)
    with dest_path.open("wb") as out_file:
        shutil.copyfileobj(upload_file.file, out_file)

    # return path relative to project root (will be served at /uploads/...)
    return f"uploads/{fname}"


@router.put("/me", response_model=UserPublic)
def update_profile(
    name: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    profile_pic: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update current user's profile. Accepts multipart/form-data with optional
    'name', 'location' fields and optional file 'profile_pic'.
    """

    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Update simple fields
    if name is not None:
        user.name = name.strip() or user.name
    if location is not None:
        user.location = location.strip() or user.location

    # Handle file upload (if provided)
    if profile_pic is not None:
        # optional: validate content-type / file size here
        # save file and set user.profile_pic to relative path
        try:
            rel_path = _save_upload_file(profile_pic, UPLOAD_DIR)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed saving file: {e}")

        # Optionally remove previous file (best-effort)
        old = user.profile_pic
        user.profile_pic = rel_path
        if old:
            try:
                old_path = Path(old)
                # only delete files inside uploads directory to be safe
                if old_path.exists() and "uploads" in str(old_path):
                    old_path.unlink(missing_ok=True)
            except Exception:
                pass

    db.add(user)
    db.commit()
    db.refresh(user)
    return user