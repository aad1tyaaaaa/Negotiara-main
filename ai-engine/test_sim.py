import requests
import json

url = "http://localhost:8000/api/negotiate"
payload = {
    "shipment": {
        "origin": "Mumbai",
        "destination": "Delhi",
        "distance": 1400,
        "cargo_type": "Electronics",
        "weight": 10,
        "deadline": "2026-05-23T00:00:00Z"
    },
    "shipper_metrics": {
        "initial_offer": 800,
        "budget": 1200
    },
    "carrier_metrics": {
        "initial_offer": 1500
    },
    "max_rounds": 3
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
