import redis
import json
import os
from dotenv import load_dotenv

load_dotenv()

class RedisStreamer:
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        try:
            self.client = redis.from_url(redis_url)
        except Exception as e:
            print(f"Redis initialization failed: {e}")
            self.client = None

    def publish_update(self, session_id: str, data: dict):
        if not self.client:
            return
            
        payload = {
            "session_id": session_id,
            "update": data
        }
        
        try:
            # Publish to a channel named after the session or a global channel
            self.client.publish(f"negotiation_{session_id}", json.dumps(payload))
            self.client.publish("global_negotiation_events", json.dumps(payload))
        except Exception as e:
            print(f"Failed to publish to redis: {e}")

streamer = RedisStreamer()
