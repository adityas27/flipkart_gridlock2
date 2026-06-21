from pydantic import BaseModel


class ResourceRecommendation(BaseModel):
    officers: int
    barricades: int
    tow_vehicles: int


class PredictionResponse(BaseModel):

    severity_score: float
    hotspot_score: float
    junction_score: float
    closure_score: float
    risk_score: float
    traffic_score: float
    risk_category: str
    resources: ResourceRecommendation
