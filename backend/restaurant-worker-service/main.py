import json, os, time
from kafka import KafkaConsumer
from pymongo import MongoClient


# Load configuration from environment variables with defaults

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")


# Initialize MongoDB client and database

client = MongoClient(MONGO_URL)
db = client["yelp_lab2"]   


# Database for restaurant worker service

def main():
    print("Restaurant worker starting, waiting 15s for Kafka...", flush=True)  # ← fix 2
    time.sleep(15)

    while True:
        try:
            consumer = KafkaConsumer(
                "restaurant.created", "restaurant.updated", "restaurant.claimed",
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                group_id="restaurant-worker-group",
                auto_offset_reset="earliest",
            )
            print("Restaurant worker connected to Kafka, listening...", flush=True)
            break
        except Exception as e:
            print(f"Kafka not ready, retrying in 5s: {e}", flush=True)
            time.sleep(5)

    for message in consumer:
        topic = message.topic
        data = message.value
        print(f"Received [{topic}]: {data}", flush=True)

if __name__ == "__main__":
    main()