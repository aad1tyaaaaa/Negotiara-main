import faiss
import numpy as np

class VectorDBContext:
    """
    Very basic FAISS mock implementation to showcase storing past negotiation benchmarks.
    In a real app, you'd use OpenAI embeddings/SentenceTransformers before inserting.
    """
    def __init__(self, dimension=4):
        # E.g., dimension could be: [market_price, context_hash, competitor_avg, deal_price]
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(self.dimension)
        self.stored_deals = []
        
    def add_past_deal(self, market_price: float, context_val: float, competitor_avg: float, final_deal_price: float, id_str: str):
        vector = np.array([[market_price, context_val, competitor_avg, final_deal_price]], dtype=np.float32)
        self.index.add(vector)
        self.stored_deals.append(id_str)
        
    def query_similar_deals(self, market_price: float, context_val: float, competitor_avg: float, k=3) -> list:
        # We query with a 0 target price to find similar setups
        query_vector = np.array([[market_price, context_val, competitor_avg, 0.0]], dtype=np.float32)
        
        if self.index.ntotal == 0:
            return []
            
        distances, indices = self.index.search(query_vector, k)
        results = []
        for i in indices[0]:
            if i >= 0 and i < len(self.stored_deals):
                results.append(self.stored_deals[i])
        return results

# Singleton instance
faiss_db = VectorDBContext()
