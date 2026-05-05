from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ShipmentSchema(BaseModel):
    origin: str = Field(..., min_length=1, description="Origin city or location")
    destination: str = Field(..., min_length=1, description="Destination city or location")
    distance: float = Field(..., gt=0, description="Distance in kilometres")
    cargo_type: str = Field(..., min_length=1, description="Type of cargo")
    weight: float = Field(..., gt=0, description="Weight in tonnes")
    deadline: Optional[str] = None


class ShipperMetricsSchema(BaseModel):
    initial_offer: float = Field(..., gt=0)
    budget: float = Field(..., gt=0, description="Maximum walk-away price for shipper")
    target_price: Optional[float] = None


class CarrierMetricsSchema(BaseModel):
    initial_offer: Optional[float] = None
    operational_cost: Optional[float] = None
    desired_margin: Optional[float] = None


class NegotiationRequest(BaseModel):
    shipment: ShipmentSchema
    shipper_metrics: ShipperMetricsSchema
    carrier_metrics: Optional[CarrierMetricsSchema] = None
    market_signals: Optional[Dict[str, Any]] = {}
    strategy_profile: Optional[str] = "Collaborative"
    max_rounds: Optional[int] = Field(default=5, ge=1, le=20)


class HistoryEntry(BaseModel):
    role: str = Field(..., pattern="^(SHIPPER|CARRIER)$")
    content: Optional[str] = None
    price: Optional[float] = None


class StepRequest(BaseModel):
    context: NegotiationRequest
    history: List[HistoryEntry] = []
    role: str = Field(default="SHIPPER", pattern="^(SHIPPER|CARRIER)$")
