# This script is a simple test to verify that the MongoDB connection is working and that we can retrieve restaurant data from the "restaurants" collection.
# It prints the total count of restaurants and details of the first 10 restaurants to the console

import sys
import os

# Add the parent directory of this script to the Python path so we can import the `db` object from `mongodb.py`.


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mongodb import db as mongo_db


restaurants = list(mongo_db.restaurants.find({}, {"name": 1, "city": 1, "image": 1, "amenities": 1}))


# Print the count of restaurants and details of the first 10 restaurants to verify the connection and data retrieval.

print("Restaurant count:", len(restaurants))


# Print the first 10 restaurants to verify we can access the data. Each restaurant document will show its name, city, image URL, and amenities.

for a in restaurants[:10]:
    print(a)