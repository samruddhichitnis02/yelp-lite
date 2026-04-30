from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth import router as auth_router
from routers.dashboard import router as dashboard_router

# Initialize FastAPI app


app = FastAPI(title="Owner Service", version="1.0.0")

# Include routers for authentication and dashboard

app.include_router(auth_router)
app.include_router(dashboard_router)

# Configure CORS middleware to allow requests from any origin

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint to verify that the service is running

@app.get("/")
def read_root():
    return {"message": "Owner Service is running"}

# Run the application using Uvicorn if this file is executed directly
