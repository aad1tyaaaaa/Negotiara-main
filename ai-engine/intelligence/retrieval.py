import random
import logging

logger = logging.getLogger(__name__)


class SimpleRAGService:
    """
    RAG Service: Retrieves similar past deals to inform pricing boundaries.

    NOTE: This is an expanded mock dataset. Replace with a real FAISS/vector
    search implementation for production to query against actual historical deals.
    """

    def __init__(self, historical_deals: list = None):
        self.deals = historical_deals or [
            # India domestic routes
            {"route": "Mumbai-Delhi", "price": 960, "distance": 1400},
            {"route": "Mumbai-Delhi", "price": 940, "distance": 1400},
            {"route": "Mumbai-Delhi", "price": 955, "distance": 1400},
            {"route": "Chennai-Bangalore", "price": 320, "distance": 350},
            {"route": "Chennai-Bangalore", "price": 310, "distance": 350},
            {"route": "Kolkata-Hyderabad", "price": 870, "distance": 1200},
            {"route": "Kolkata-Hyderabad", "price": 850, "distance": 1200},
            {"route": "Delhi-Jaipur", "price": 200, "distance": 280},
            {"route": "Delhi-Jaipur", "price": 195, "distance": 280},
            # EU routes
            {"route": "Hamburg-Rotterdam", "price": 480, "distance": 390},
            {"route": "Hamburg-Rotterdam", "price": 465, "distance": 390},
            {"route": "Paris-Frankfurt", "price": 620, "distance": 550},
            {"route": "Paris-Frankfurt", "price": 640, "distance": 550},
            {"route": "Milan-Munich", "price": 430, "distance": 380},
            {"route": "Milan-Munich", "price": 415, "distance": 380},
            {"route": "Barcelona-Lyon", "price": 390, "distance": 480},
            # US routes
            {"route": "LA-Chicago", "price": 2800, "distance": 3200},
            {"route": "LA-Chicago", "price": 2750, "distance": 3200},
            {"route": "New York-Boston", "price": 540, "distance": 340},
            {"route": "New York-Boston", "price": 520, "distance": 340},
            {"route": "Dallas-Houston", "price": 280, "distance": 390},
            {"route": "Seattle-Portland", "price": 310, "distance": 280},
            # SE Asia routes
            {"route": "Singapore-KL", "price": 350, "distance": 350},
            {"route": "Singapore-KL", "price": 340, "distance": 350},
            {"route": "Bangkok-Hanoi", "price": 820, "distance": 1200},
        ]

    def retrieve_market_benchmark(self, route: str, distance: float) -> dict:
        """
        Retrieves expected market price based on similar routes or distance.
        Uses reverse-route matching and distance-band similarity as fallbacks.
        """
        # Exact route match
        similar = [d["price"] for d in self.deals if d["route"] == route]

        if not similar:
            # Try reverse route (e.g., "Delhi-Mumbai" matching "Mumbai-Delhi")
            parts = route.split("-")
            if len(parts) == 2:
                reverse = f"{parts[1].strip()}-{parts[0].strip()}"
                similar = [d["price"] for d in self.deals if d["route"] == reverse]

        if not similar:
            # Fallback: match deals with distance within ±20%
            band_lo, band_hi = distance * 0.80, distance * 1.20
            similar = [
                d["price"] for d in self.deals
                if band_lo <= d["distance"] <= band_hi
            ]

        if not similar:
            # Final fallback: industry average rate per km
            avg_price = distance * 0.68
            logger.warning(
                "No historical matches for route '%s' (%.0f km). "
                "Using rate-per-km fallback: $%.2f",
                route, distance, avg_price
            )
        else:
            avg_price = sum(similar) / len(similar)
            logger.debug(
                "RAG benchmark for '%s': $%.2f (from %d comparable deals)",
                route, avg_price, len(similar)
            )

        return {
            "expected_market_price": round(avg_price, 2),
            "price_variance": round(random.uniform(0.02, 0.05) * avg_price, 2),
            "similarity_score": round(0.70 + (0.25 * min(len(similar), 4) / 4), 2),
            "matches_found": len(similar),
        }
