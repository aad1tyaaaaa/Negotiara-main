class IntrinsicValueModel:
    """
    Buffett Logic: Calculate the fair cost of logistics transport.
    Fair Price = Fuel + Driver + Toll + Maintenance + Profit Margin
    """
    
    def __init__(self, fuel_per_km: float = 0.35, driver_per_km: float = 0.1, toll_avg: float = 50.0, maintenance_per_km: float = 0.05):
        self.fuel_per_km = fuel_per_km
        self.driver_per_km = driver_per_km
        self.toll_avg = toll_avg
        self.maintenance_per_km = maintenance_per_km

    def estimate(self, distance: float, profit_margin_pct: float = 0.15) -> float:
        """
        Calculates the intrinsic value (fair price) for a shipment.
        """
        fuel_cost = distance * self.fuel_per_km
        driver_cost = distance * self.driver_per_km
        maintenance_cost = distance * self.maintenance_per_km
        
        # Base cost without margin
        base_cost = fuel_cost + driver_cost + maintenance_cost + self.toll_avg
        
        # Fair price with margin
        intrinsic_price = base_cost * (1 + profit_margin_pct)
        
        return round(intrinsic_price, 2)

    def get_breakdown(self, distance: float, profit_margin_pct: float = 0.15) -> dict:
        """
        Returns a detailed breakdown of costs.
        """
        fuel_cost = distance * self.fuel_per_km
        driver_cost = distance * self.driver_per_km
        maintenance_cost = distance * self.maintenance_per_km
        base_cost = fuel_cost + driver_cost + maintenance_cost + self.toll_avg
        margin = base_cost * profit_margin_pct
        
        return {
            "fuel": round(fuel_cost, 2),
            "driver": round(driver_cost, 2),
            "toll": round(self.toll_avg, 2),
            "maintenance": round(maintenance_cost, 2),
            "margin": round(margin, 2),
            "total": round(base_cost + margin, 2)
        }
