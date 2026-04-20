import json, os, time
from kafka import KafkaConsumer
from pymongo import MongoClient
from bson import ObjectId

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

client = MongoClient(MONGO_URL)
db = client["yelp_lab2"]

def recalculate_avg_rating(restaurant_id: str):
    try:
        reviews = list(db.reviews.find({"restaurant_id": restaurant_id}))
        avg = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0.0
        db.restaurants.update_one(
            {"_id": ObjectId(restaurant_id)},
            {"$set": {"avg_rating": round(avg, 2)}}
        )
        print(f"Updated avg_rating for {restaurant_id} → {avg:.2f}", flush=True)
    except Exception as e:
        print(f"Error recalculating rating: {e}", flush=True)

def main():
    print("Review worker starting, waiting 15s for Kafka...", flush=True)
    time.sleep(15)  # Give Kafka time to fully initialize

    while True:
        try:
            consumer = KafkaConsumer(
                "review.created", "review.updated", "review.deleted",
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                group_id="review-worker-group",
                auto_offset_reset="earliest",
                session_timeout_ms=30000,
                heartbeat_interval_ms=10000,
            )
            print("Review worker connected to Kafka, listening...", flush=True)
            break
        except Exception as e:
            print(f"Kafka not ready, retrying in 5s: {e}", flush=True)
            time.sleep(5)

    for message in consumer:
        topic = message.topic
        data = message.value
        print(f"Received [{topic}]: {data}", flush=True)
        restaurant_id = data.get("restaurant_id")
        if restaurant_id:
            recalculate_avg_rating(restaurant_id)

if __name__ == "__main__":
    main()