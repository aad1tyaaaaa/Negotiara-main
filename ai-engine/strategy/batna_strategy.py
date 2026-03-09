def should_walk_away(current_offer: float, reservation_price: float, current_round: int, max_rounds: int) -> bool:
    """
    Evaluate if the negotiation should be terminated.
    If we are at the max rounds and the offer is above the reservation price, we walk away.
    If earlier rounds, we don't necessarily walk away immediately, but we signal that it's getting hot.
    """
    if current_round >= max_rounds and current_offer > reservation_price:
        return True
    return False

def get_reservation_status(current_offer: float, reservation_price: float) -> str:
    """
    Provides context string about the reservation status.
    """
    if current_offer > reservation_price:
        return "CRITICAL: Valid offer is ABOVE our absolute walk-away limit. Must aggressively push down or terminate."
    elif current_offer == reservation_price:
        return "WARNING: We are exactly at our walk-away limit. No further upward concessions allowed."
    else:
        return "SAFE: We are currently below our walk-away limit."
