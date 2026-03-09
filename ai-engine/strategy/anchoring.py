def calculate_anchor(target_price: float, market_benchmark: float) -> float:
    """
    Warren Buffett - Value & Safety: Anchor aggressively but rationally.
    This function calculates an aggressive opening offer (anchor) that is lower than the target price,
    while still being loosely grounded in the market benchmark.
    
    Formula: 
    Anchor is set 5-10% below the target price, bounded by logic so it's not absurdly low.
    """
    # E.g., target is 45. We might anchor at 42 or 43.
    # We will aim for an anchor that is 8% below the target by default.
    anchor_discount = 0.08
    anchor_price = target_price * (1 - anchor_discount)
    
    # Ensure it's not absurdly low compared to the market benchmark (e.g. not more than 20% below market)
    min_reasonable_anchor = market_benchmark * 0.80
    
    final_anchor = max(anchor_price, min_reasonable_anchor)
    return round(final_anchor, 2)
