from contextlib import asynccontextmanager
import os
import joblib
from catboost import CatBoostClassifier
from fastapi import FastAPI
from schemas.req import EventPredictionRequest
from schemas.res import PredictionResponse
from services import map
from services.features import create_feature_row
from services.resources import recommend_resources_llm
from services.scoring import compute_risk_score, get_risk_category
from services.location import get_location_info
from google import genai

resources = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    resources["model"] = CatBoostClassifier()
    resources["model"].load_model("severity_model.cbm")
    resources["features"] = joblib.load("features.pkl")
    resources["hotspot_scores"] = joblib.load("hotspot_scores.pkl")
    resources["junction_rank"] = joblib.load("junction_rank.pkl")
    yield
    resources.clear()

# Initialize GenAI client with new API
genai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Event Intelligence API", lifespan=lifespan)

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictionResponse)
def predict(payload: EventPredictionRequest):
    lat, lon = float(payload.latitude), float(payload.longitude)
    
    # Get location information (zone, junction) from coordinates if not provided
    location_data = get_location_info(latitude=lat, longitude=lon)
    
    # Use provided values or calculated ones
    zone = payload.zone if payload.zone else location_data.get("zone", "Unknown Zone")
    junction = payload.junction if payload.junction else location_data.get("nearest_junc", "Unknown Junction")
    corridor = payload.corridor if payload.corridor else "No Corridor"
    
    # Create a modified payload object with calculated values for feature extraction
    payload_dict = payload.model_dump()
    payload_dict["zone"] = zone
    payload_dict["junction"] = junction
    payload_dict["corridor"] = corridor
    
    # Recreate payload object for feature extraction
    from schemas.req import EventPredictionRequest
    enriched_payload = EventPredictionRequest(**payload_dict)
    
    # Feature extraction and prediction
    X = create_feature_row(enriched_payload, resources["hotspot_scores"])
    X = X.reindex(columns=resources["features"])

    severity_prob = float(resources["model"].predict_proba(X)[0][1])
    traffic = map.get_traffic_flow(latitude=lat, longitude=lon)

    # Calculate all scores
    severity_score = round(severity_prob * 100, 2)
    traffic_score = traffic.get("traffic_score", 50.0)
    hotspot_score = resources["hotspot_scores"].get(junction, .02) * 1000
    junction_score = resources["junction_rank"].get(junction, 1.0) * 10
    closure_score = 100 if payload.requires_road_closure else 20
    
    risk_score = compute_risk_score(
        severity_score, hotspot_score, junction_score, closure_score, traffic_score
    )
    risk_category = get_risk_category(risk_score)

    # Build event details for LLM
    event_details = {
        "event_type": payload.event_type,
        "event_cause": payload.event_cause,
        "zone": zone,
        "junction": junction,
        "corridor": corridor,
        "requires_road_closure": payload.requires_road_closure,
        "event_datetime": payload.event_datetime,
    }

    # Build prediction details for LLM
    prediction_details = {
        "severity_score": severity_score,
        "hotspot_score": hotspot_score,
        "junction_score": junction_score,
        "closure_score": closure_score,
        "traffic_score": traffic_score,
        "risk_score": risk_score,
        "risk_category": risk_category,
    }

    # Get available resources
    resource_dict = payload.available_resources.model_dump()

    # Get resource recommendations from LLM
    rec_resources = recommend_resources_llm(
        genai_client=genai_client,
        event_details=event_details,
        prediction_details=prediction_details,
        resource_dict=resource_dict,
    )

    # Build comprehensive response
    return {
        "event": {
            "event_type": payload.event_type,
            "event_cause": payload.event_cause,
            "latitude": lat,
            "longitude": lon,
            "requires_road_closure": payload.requires_road_closure,
            "event_datetime": payload.event_datetime,
            "police_station": payload.police_station,
            "vehicle_type": payload.veh_type,
        },
        "location": {
            "nearest_junction": junction,
            "nearest_junction_distance_km": location_data.get("nearest_junc_dist", 0.0),
            "zone": zone,
            "corridor": corridor,
        },
        "traffic": {
            "traffic_score": traffic_score,
            "current_speed": traffic.get("current_speed"),
            "free_flow_speed": traffic.get("free_flow_speed"),
            "confidence": traffic.get("confidence"),
        },
        "severity_score": severity_score,
        "hotspot_score": round(hotspot_score, 2),
        "junction_score": round(junction_score, 2),
        "closure_score": closure_score,
        "risk_score": round(risk_score, 2),
        "risk_category": risk_category,
        "resources": rec_resources,
    }

@app.get("/location-info")
def location_info(latitude: float, longitude: float):
    """Get zone and nearest junction information from coordinates."""
    return get_location_info(latitude, longitude)