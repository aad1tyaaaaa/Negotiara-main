class MarketSignalMonitor:
    """
    Soros Logic: Dynamically update negotiation parameters based on market signals.
    """
    
    def __init__(self):
        # Default market factors
        self.factors = {
            "fuel_spike": 1.0,         # Multiplier for fuel costs
            "carrier_availability": 1.0, # 1.0 = normal, < 1.0 = tight, > 1.0 = excess
            "demand": 1.0               # 1.0 = normal
        }

    def update_signals(self, signals: dict):
        """
        Update the internal state with new market signals.
        """
        self.factors.update(signals)

    def apply_to_price(self, base_price: float) -> float:
        """
        Adjusts a price based on current market factors.
        """
        # Example logic: tightness in availability or high demand increases price
        supply_demand_ratio = self.factors["demand"] / self.factors["carrier_availability"]
        adjustment = supply_demand_ratio * self.factors["fuel_spike"]
        
        return round(base_price * adjustment, 2)
