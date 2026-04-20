import json
import os
from kafka import KafkaProducer

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

_producer = None

def get_producer():
    global _producer
    if _producer is None:
        try:
            _producer = KafkaProducer(
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            )
        except Exception as e:
            print(f"Kafka producer connection failed: {e}")
            return None
    return _producer


def publish_event(topic: str, data: dict):
    producer = get_producer()
    if producer:
        try:
            producer.send(topic, value=data)
            producer.flush()
            print(f"Published to {topic}: {data}")
        except Exception as e:
            print(f"Failed to publish to {topic}: {e}")
    else:
        print(f"Kafka unavailable, skipping publish to {topic}")