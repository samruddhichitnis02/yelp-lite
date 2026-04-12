"""
Run this once from your backend folder to fix avg_rating for all restaurants.
It recalculates each restaurant's rating based on actual reviews in MongoDB.
Usage: python fix_avg_ratings.py
"""

from mongodb import db

restaurants = list(db.restaurants.find({}))
fixed = 0

for r in restaurants:
    restaurant_id = str(r['_id'])
    reviews = list(db.reviews.find({'restaurant_id': restaurant_id}))

    if reviews:
        avg = round(sum(rv.get('rating', 0) for rv in reviews) / len(reviews), 1)
    else:
        avg = 0.0

    db.restaurants.update_one(
        {'_id': r['_id']},
        {'$set': {'avg_rating': avg}}
    )
    print(f"{r.get('name')}: {len(reviews)} reviews -> avg_rating set to {avg}")
    fixed += 1

print(f"\nDone. Updated {fixed} restaurants.")