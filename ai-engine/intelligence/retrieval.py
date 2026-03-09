import random

class SimpleRAGService:
    """
    RAG Logic: Retrieve similar past deals to inform pricing boundaries.
    (MVP Version: Uses rule-based variance around intrinsic value)
    """

    def __init__(self, historical_deals: list = None):
        # Mock database of deals
        self.deals = historical_deals or [
            {"route": "Mumbai-Delhi", "price": 960, "distance": 1400},
            {"route": "Mumbai-Delhi", "price": 940, "distance": 1400},
            {"route": "Mumbai-Delhi", "price": 955, "distance": 1400}
        ]

    def retrieve_market_benchmark(self, route: str, distance: float) -> dict:
        """
        Simulates RAG retrieval.
        Returns expected market price based on similar routes/distances.
        """
        # Filter for similar routes (Mock logic)
        similar = [d["price"] for d in self.deals if d["route"] == route]
        
        if not similar:
            # Fallback if no direct route match
            avg_price = distance * 0.68 # Average km rate
        else:
            avg_price = sum(similar) / len(similar)

        return {
            "expected_market_price": round(avg_price, 2),
            "price_variance": round(random.uniform(0.02, 0.05) * avg_price, 2),
            "similarity_score": 0.95
        }
