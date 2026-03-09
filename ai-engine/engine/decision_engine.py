from strategy.batna_strategy import should_walk_away

def evaluate_round_outcome(target_counter_price: float, lsp_offer: float, reservation_price: float, current_round: int, max_rounds: int) -> dict:
    """
    Evaluates the current state of the negotiation based on the AI's target and the LSP's offer.
    """
    if lsp_offer <= target_counter_price:
        return {"status": "deal_closed", "reason": "LSP met or beat our target price."}
        
    if should_walk_away(lsp_offer, reservation_price, current_round, max_rounds):
        return {"status": "walk_away", "reason": "Max rounds reached and LSP offer exceeds our strict reservation price."}
        
    return {"status": "continue", "reason": "Negotiation ongoing."}
