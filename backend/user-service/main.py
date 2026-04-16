from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.me import router as me_router
from routers.favourites import router as favourites_router


app = FastAPI(title="User Service", version="1.0.0")

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(me_router)
app.include_router(favourites_router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "User Service is running"}