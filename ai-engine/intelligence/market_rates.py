def evaluate_market_position(current_offer: float, market_benchmark: float) -> str:
    """
    Evaluates where the current offer stands compared to the market benchmark.
    Returns a brief intelligence string.
    """
    if current_offer < market_benchmark:
        diff = market_benchmark - current_offer
        return f"Offer is ₹{diff:0.2f} BELOW market average. Favorable position."
    elif current_offer == market_benchmark:
        return "Offer is exactly at market average."
    else:
        diff = current_offer - market_benchmark
        return f"Offer is ₹{diff:0.2f} ABOVE market average. Needs aggressive reduction."
