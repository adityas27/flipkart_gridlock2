from pydantic import BaseModel
from typing import List, Optional


class ResourceRecommendation(BaseModel):
    officers: int
    marshals: int
    barricades: int
    tow_vehicles: int
    ambulances: int


class ResourceGap(BaseModel):
    officers: int
    marshals: int
    barricades: int
    tow_vehicles: int
    ambulances: int


class ResourceAllocation(BaseModel):
    allocation_priority: str
    recommended_resources: ResourceRecommendation
    resource_gap: ResourceGap
    reasoning: List[str]


class LocationInfo(BaseModel):
    nearest_junction: str
    nearest_junction_distance_km: float
    zone: str
    corridor: str


class TrafficInfo(BaseModel):
    traffic_score: float
    current_speed: Optional[float] = None
    free_flow_speed: Optional[float] = None
    confidence: Optional[float] = None


class EventDetails(BaseModel):
    event_type: str
    event_cause: str
    latitude: float
    longitude: float
    requires_road_closure: bool
    event_datetime: str
    police_station: str
    vehicle_type: str


class PredictionResponse(BaseModel):
    # Event Information
    event: EventDetails
    
    # Location Details
    location: LocationInfo
    
    # Traffic Information
    traffic: TrafficInfo
    
    # Risk Scoring
    severity_score: float
    hotspot_score: float
    junction_score: float
    closure_score: float
    risk_score: float
    risk_category: str
    
    # Resource Allocation
    resources: ResourceAllocation
