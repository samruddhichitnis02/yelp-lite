from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routers.reviews import router as reviews_router
from routers.review_photos import router as review_photos_router

app = FastAPI(title="Review Service", version="1.0.0", redirect_slashes=False)

# Ensure uploads directory exists on startup
os.makedirs("uploads", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(reviews_router)
app.include_router(review_photos_router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Review Service is running"}