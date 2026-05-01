from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import routers for restaurants, chatbot, and restaurant photos

from routers.restaurants import router as restaurants_router
from routers.chatbot import router as chatbot_router
from routers.restaurant_photos import router as restaurant_photos_router

# Initialize FastAPI app

app = FastAPI(title="Restaurant Service", version="1.0.0")

# Ensure uploads directory exists on startup
os.makedirs("uploads", exist_ok=True)


# Include routers for restaurants, chatbot, and restaurant photos

app.include_router(restaurants_router)



# Chatbot routes for restaurant recommendations and interactions
app.include_router(chatbot_router)

# Restaurant photo upload/view/delete routes for restaurant owners
app.include_router(restaurant_photos_router)

# Serve uploaded photos from the /uploads path using StaticFiles
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS middleware to allow requests from any origin and all methods/headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint to verify that the service is running and provide a simple message
@app.get("/")
def read_root():
    return {"message": "Restaurant Service is running"}