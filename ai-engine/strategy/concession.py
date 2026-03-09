import math

def calculate_concession(current_round, max_rounds, initial_price, reservation_price, strategy="linear"):
    """
    Calculates the next price offer based on a concession strategy.
    
    Strategies:
    - linear: Constant concession per round.
    - boulder: Small concessions early, large concessions late.
    - reverse_boulder: Large concessions early, small concessions late.
    """
    
    progress = (current_round - 1) / (max_rounds - 1) if max_rounds > 1 else 1
    total_concession_available = abs(initial_price - reservation_price)
    
    if strategy == "linear":
        concession_factor = progress
    elif strategy == "boulder":
        concession_factor = math.pow(progress, 2)
    elif strategy == "reverse_boulder":
        concession_factor = math.sqrt(progress)
    else:
        concession_factor = progress
        
    concession_amount = total_concession_available * concession_factor
    
    if initial_price > reservation_price: # Shipper (Negotiating Down)
        return initial_price - concession_amount
    else: # Carrier (Negotiating Up)
        return initial_price + concession_amount

def is_deal_acceptable(offered_price, reservation_price, role="SHIPPER"):
    if role == "SHIPPER":
        return offered_price <= reservation_price
    else:
        return offered_price >= reservation_price
