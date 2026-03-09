def get_leverage_statement(current_offer: float, competitor_prices: list[float]) -> str:
    """
    George Soros - Adaptive Strategy / Competitive Leverage.
    Finds a better competitor price if available to use as leverage against the LSP's current offer.
    """
    better_offers = [price for price in competitor_prices if price < current_offer]
    
    if better_offers:
        best_competitor = min(better_offers)
        return f"Another provider is offering {best_competitor}/km for the same route. Is there flexibility to improve your rate to match or beat this?"
    
    return ""
