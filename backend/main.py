from routers.restaurant_photos import router as restaurant_photos_router
from routers.restaurants import router as restaurants_router
from routers.favourites import router as favourites_router
from routers.reviews import router as reviews_router
from routers.users import router as users_router
from routers.auth import router as auth_router
from routers.me import router as me_router

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from routers.chatbot import router as chatbot_router
from routers.review_photos import router as review_photos_router




# Initialize the FastAPI application
#  The title and version are optional metadata that can be used for documentation purposes.
# The app will automatically generate API docs at http://localhost:8000/docs based on the included routers and their endpoints..
app = FastAPI(title="Yelp Lite API", version="1.0.0")
app.include_router(auth_router)
app.include_router(me_router)
app.include_router(restaurants_router)
app.include_router(users_router)
app.include_router(reviews_router)
app.include_router(favourites_router)
app.include_router(chatbot_router)
app.include_router(restaurant_photos_router)
app.include_router(review_photos_router)

# Mount the "uploads" folder so uploaded images (profile pictures, restaurant images)
# can be accessed publicly via URLs like http://localhost:8000/uploads/filename.jpg
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Allow the React frontend to communicate with this backend 
# by enabling CORS (Cross-Origin Resource Sharing) for all origins, methods, and headers.

  
app.add_middleware(
    CORSMiddleware,
    # Allow requests from the React development server
    allow_origins=["*"],
    # Allow all HTTP methods like GET, POST, PUT, DELETE
    allow_methods=["*"],
    # Allow all headers including the Authorization header for JWT
    allow_headers=["*"],
)


# Root endpoint to check if the server is running.
#  You can test this by visiting http://localhost:8000/ in your browser or using curl.
# It should return a simple JSON message confirming that the API is up and running.
@app.get("/")
def read_root():
    return {"message": "Welcome to Yelp Lite API"}