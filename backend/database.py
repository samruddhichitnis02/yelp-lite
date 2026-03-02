from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Read the database URL from the .env file
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the database engine that connects to MySQL
engine = create_engine(DATABASE_URL)

# Create a session factory that will be used to interact with the database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a base class that all database models will inherit from
Base = declarative_base()

# Dependency function that opens a database session for each request and closes it when done
def get_db():
    db = SessionLocal()
    try:
        # Provide the database session to the route that needs it
        yield db
    finally:
        # Always close the session after the request is complete
        db.close()

# # Create all database tables automatically when the app starts
# Base.metadata.create_all(bind=engine)