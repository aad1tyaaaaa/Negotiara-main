class UtilityEvaluator:
    """
    Kwame Logic: Evaluate whether a deal benefits both parties.
    Utility Functions:
    shipper_utility = budget - price
    carrier_utility = price - carrier_cost
    """

    def evaluate(self, price: float, shipper_budget: float, carrier_min_price: float) -> dict:
        """
        Returns utility scores and deal acceptability.
        """
        shipper_utility = shipper_budget - price
        carrier_utility = price - carrier_min_price
        
        # ZOPA: Zone of Possible Agreement
        is_acceptable = shipper_utility >= 0 and carrier_utility >= 0
        
        return {
            "shipper_utility": round(shipper_utility, 2),
            "carrier_utility": round(carrier_utility, 2),
            "is_acceptable": is_acceptable,
            "score": round((shipper_utility + carrier_utility) / (shipper_budget - carrier_min_price + 0.01), 2)
        }
