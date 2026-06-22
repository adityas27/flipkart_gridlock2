from pydantic import BaseModel
from typing import Optional


class AvailableResources(BaseModel):
    officers: int = 0
    marshals: int = 0
    barricades: int = 0
    tow_vehicles: int = 0
    ambulances: int = 0


class EventPredictionRequest(BaseModel):
    event_type: str
    event_cause: str
    latitude: float
    longitude: float
    zone: Optional[str] = None
    junction: Optional[str] = None
    corridor: Optional[str] = None
    police_station: Optional[str] = "Unknown"
    authenticated: Optional[str] = "True"
    veh_type: Optional[str] = "Unknown"
    requires_road_closure: bool
    event_datetime: str
    available_resources: AvailableResources = AvailableResources()