import os
import requests
from dotenv import load_dotenv

load_dotenv()

API = os.getenv("API", "default_fallback_value")


def get_traffic_flow(latitude: float, longitude: float, api_key: str = API) -> dict:
    url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point={latitude},{longitude}&key={api_key}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        flow = response.json().get("flowSegmentData", {})

        current_speed = flow.get("currentSpeed", 0)
        free_flow_speed = flow.get("freeFlowSpeed", 0)

        traffic_score = 0
        if free_flow_speed > 0:
            traffic_score = round(
                (1 - (current_speed / free_flow_speed)) * 100, 2
            )

        return {
            "current_speed": current_speed,
            "free_flow_speed": free_flow_speed,
            "current_travel_time": flow.get("currentTravelTime", 0),
            "free_flow_travel_time": flow.get("freeFlowTravelTime", 0),
            "confidence": flow.get("confidence", 0),
            "traffic_score": max(0, traffic_score),
        }

    except Exception as e:
        print(f"Traffic API Error: {e}")
        return {
            "current_speed": None,
            "free_flow_speed": None,
            "current_travel_time": None,
            "free_flow_travel_time": None,
            "confidence": None,
            "traffic_score": 0,
        }