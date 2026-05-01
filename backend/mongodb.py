# This module sets up the connection to the MongoDB database using the PyMongo library.


from pymongo import MongoClient


# Define the MongoDB connection URL and database name.
# The MongoDB server is expected to be running locally on the default port 27017.



MONGO_URL = "mongodb://localhost:27017"


# Create a MongoDB client and connect to the "yelp_lab2" database.
# The `db` variable will be used throughout the backend to interact with the MongoDB database, allowing us to perform operations like finding, inserting, updating, and deleting documents in collections such as "restaurants", "reviews", "users", etc.

client = MongoClient(MONGO_URL)

db = client["yelp_lab2"]

# The `db` variable is now ready to be imported and used in other parts of the backend code to perform database operations.