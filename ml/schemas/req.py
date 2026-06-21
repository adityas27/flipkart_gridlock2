from pydantic import BaseModel


class EventPredictionRequest(BaseModel):
    event_type: str
    event_cause: str
    latitude: float
    longitude: float
    zone: str
    junction: str
    corridor: str | None = None
    police_station: str | None = "Unknown"
    authenticated: str | None = "True"
    veh_type: str | None = "Unknown"
    requires_road_closure: bool
    event_datetime: str