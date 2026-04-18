from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routers.restaurants import router as restaurants_router
from routers.chatbot import router as chatbot_router
from routers.restaurant_photos import router as restaurant_photos_router

app = FastAPI(title="Restaurant Service", version="1.0.0")

# Ensure uploads directory exists on startup
os.makedirs("uploads", exist_ok=True)

# Restaurant routes
app.include_router(restaurants_router)

# Chatbot routes
app.include_router(chatbot_router)

# Restaurant photo upload/view/delete routes
app.include_router(restaurant_photos_router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Restaurant Service is running"}