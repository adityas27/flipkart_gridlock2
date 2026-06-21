from datetime import datetime
import numpy as np
import pandas as pd


def create_feature_row(payload, hotspot_scores: dict) -> pd.DataFrame:
    dt = pd.to_datetime(payload.event_datetime)
    hour = dt.hour
    dayofweek = dt.dayofweek

    # Pre-calculate cyclical time encodings
    hour_angle = 2 * np.pi * hour / 24
    dow_angle = 2 * np.pi * dayofweek / 7

    row = {
        # Payload base attributes
        "event_type": payload.event_type,
        "event_cause": payload.event_cause,
        "requires_road_closure": payload.requires_road_closure,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "zone": payload.zone,
        "junction": payload.junction,
        "police_station": payload.police_station,
        "authenticated": payload.authenticated,
        "veh_type": payload.veh_type,
        # Derived datetime features
        "hour": hour,
        "dayofweek": dayofweek,
        "month": dt.month,
        # Boolean indicators (0 or 1)
        "is_weekend": int(dayofweek >= 5),
        "is_peak_hour": int((7 <= hour <= 11) or (17 <= hour <= 21)),
        "is_night": int(hour <= 5),
        # Cyclical encodings
        "hour_sin": np.sin(hour_angle),
        "hour_cos": np.cos(hour_angle),
        "dow_sin": np.sin(dow_angle),
        "dow_cos": np.cos(dow_angle),
        # Frequency mappings & placeholders
        "cause_freq": 100,
        "zone_freq": 100,
        "junction_freq": hotspot_scores.get(payload.junction, 1),
        "station_freq": 100,
        "description_len": 0,
        "description_words": 0,
    }

    return pd.DataFrame([row])