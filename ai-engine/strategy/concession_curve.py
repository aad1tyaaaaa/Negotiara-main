def calculate_next_target(current_round: int, max_rounds: int, initial_anchor: float, reservation_price: float, target_price: float) -> float:
    """
    Ed Brodow - Structured Negotiation: Never give concessions without receiving something.
    Reduces price gradually.
    
    This function calculates mathematically what the internal 'target_counter_price' should be for a specific round.
    Round 1: Anchor price
    Round {max_rounds}: Target price (or slightly above if forced towards reservation)
    """
    if current_round == 1:
        return initial_anchor
    
    # Calculate how much we can concede per round
    # The total available concession is from initial_anchor up to target_price (ideally)
    total_concession_room = target_price - initial_anchor
    
    # Rounds left to concede
    # e.g. round 2 of 4 (3 steps: 1->2, 2->3, 3->4)
    steps = max_rounds - 1
    
    concession_per_step = total_concession_room / steps
    
    next_target = initial_anchor + (concession_per_step * (current_round - 1))
    
    return round(next_target, 2)
