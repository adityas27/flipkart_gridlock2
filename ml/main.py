from contextlib import asynccontextmanager
import joblib
from catboost import CatBoostClassifier
from fastapi import FastAPI
from schemas.req import EventPredictionRequest
from schemas.res import PredictionResponse
from services import map
from services.features import create_feature_row
from services.resources import recommend_resources
from services.scoring import compute_risk_score, get_risk_category
# import google.generativeai as genai
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

# genai.configure(
#     api_key=GEMINI_API_KEY
# )

app = FastAPI(title="Event Intelligence API", lifespan=lifespan)


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: EventPredictionRequest):
    X = create_feature_row(payload, resources["hotspot_scores"])
    X = X.reindex(columns=resources["features"])

    lat, lon = float(payload.latitude), float(payload.longitude)

    severity_prob = float(resources["model"].predict_proba(X)[0][1])
    traffic = map.get_traffic_flow(latitude=lat, longitude=lon)

    severity_score = round(severity_prob * 100, 2)
    traffic_score = traffic["traffic_score"]
    hotspot_score = resources["hotspot_scores"].get(payload.junction, .02) * 1000
    junction_score = resources["junction_rank"].get(payload.junction, 1.0) * 10
    closure_score = 100 if payload.requires_road_closure else 20
    risk_score = compute_risk_score(
        severity_score, hotspot_score, junction_score, closure_score, traffic_score
    )
    risk_category = get_risk_category(risk_score)
    rec_resources = recommend_resources(risk_score)

    return {
        "severity_score": severity_score,
        "hotspot_score": hotspot_score,
        "junction_score": junction_score,
        "closure_score": closure_score,
        "traffic_score": traffic_score,
        "risk_score": risk_score,
        "risk_category": risk_category,
        "resources": rec_resources,
    }