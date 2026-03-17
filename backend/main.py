from routers.restaurants import router as restaurants_router
from routers.users import router as users_router
from routers.auth import router as auth_router
from routers.me import router as me_router

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

from models.users import User
from models.owner import Owner
from models.restaurants import Restaurant
from models.review import Review
from models.favourite import Favourite
from models.preference import Preference
from models.user_cuisine import UserCuisine
from models.dietary_type import DietaryType
from models.user_dietary import UserDietary
from models.ambiance_type import AmbianceType

Base.metadata.create_all(bind=engine)

# Initialize the FastAPI application
app = FastAPI(title="Yelp Lite API", version="1.0.0")
app.include_router(auth_router)
app.include_router(me_router)
app.include_router(restaurants_router)
app.include_router(users_router)

# Mount the "uploads" folder so uploaded images (profile pictures, restaurant images)
# can be accessed publicly via URLs like http://localhost:8000/uploads/filename.jpg
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Allow the React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    # Allow requests from the React development server
    allow_origins=["*"],
    # Allow all HTTP methods like GET, POST, PUT, DELETE
    allow_methods=["*"],
    # Allow all headers including the Authorization header for JWT
    allow_headers=["*"],
)

# Root endpoint to check if the server is running
@app.get("/")
def read_root():
    return {"message": "Welcome to Yelp Lite API"}