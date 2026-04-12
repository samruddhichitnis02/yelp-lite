"""
Run this script once from your backend folder to fix all restaurant image URLs in MongoDB.
Usage: python fix_restaurant_images.py
"""

from mongodb import db

# Working image URLs mapped by cuisine (same ones used in RestaurantCard.jsx)
CUISINE_IMAGES = {
    'Italian':       'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
    'Japanese':      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
    'American':      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    'Mexican':       'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
    'Chinese':       'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
    'Indian':        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
    'Thai':          'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
    'Korean':        'https://images.unsplash.com/photo-1583502236840-cd52cd6d3f34?w=600&q=80',
    'Mediterranean': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    'French':        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    'Vietnamese':    'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=600&q=80',
    'BBQ':           'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80',
    'Vegan':         'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    'Brazilian':     'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80',
    'Spanish':       'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&q=80',
    'Cuban':         'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
}

FALLBACK = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80'

restaurants = list(db.restaurants.find({}))
fixed = 0

for r in restaurants:
    image = r.get('image', '')
    # Only fix dead source.unsplash.com URLs — leave uploaded files untouched
    if image and 'source.unsplash.com' in image:
        cuisine = r.get('cuisine', '')
        new_image = CUISINE_IMAGES.get(cuisine, FALLBACK)
        db.restaurants.update_one(
            {'_id': r['_id']},
            {'$set': {'image': new_image}}
        )
        print(f"Fixed: {r.get('name')} ({cuisine}) -> {new_image}")
        fixed += 1

print(f"\nDone. Fixed {fixed} restaurants.")