import pandas as pd
import numpy as np

from shapely.geometry import Point, Polygon
from sklearn.neighbors import BallTree

EARTH_RADIUS_KM = 6371.0

# =====================================================
# JUNCTIONS
# =====================================================

junction_df = pd.read_csv("data/junctions.csv")

# Remove rows with NaN in lat or long columns
junction_df = junction_df.dropna(subset=["lat", "long"])

JUNCTION_NAMES = (
    junction_df["junction_corrected"]
    .fillna(junction_df["junction"])
    .astype(str)
    .tolist()
)

junction_coords = junction_df[
    ["lat", "long"]
].values

JUNCTION_TREE = BallTree(
    np.radians(junction_coords),
    metric="haversine"
)

# =====================================================
# ZONES
# =====================================================

ZONES = {
  "North Zone 2": [
    [13.138, 77.754],
    [13.062, 77.689],
    [13.048, 77.657],
    [13.112, 77.463],
    [13.123, 77.45],
    [13.15, 77.45],
    [13.15, 77.75],
    [13.138, 77.754]
  ],
  "North Zone 1": [
    [13.112, 77.463],
    [13.048, 77.657],
    [13.018, 77.631],
    [13.003, 77.545],
    [13.112, 77.463]
  ],
  "West Zone 1": [
    [12.945, 77.45],
    [13.123, 77.45],
    [13.112, 77.463],
    [13.003, 77.545],
    [12.978, 77.545],
    [12.945, 77.533],
    [12.945, 77.45]
  ],
  "West Zone 2": [
    [12.945, 77.533],
    [12.93, 77.54],
    [12.837, 77.54],
    [12.8, 77.525],
    [12.8, 77.45],
    [12.945, 77.45],
    [12.945, 77.533]
  ],
  "Central Zone 1": [
    [13.003, 77.545],
    [13.018, 77.631],
    [12.953, 77.622],
    [12.978, 77.545],
    [13.003, 77.545]
  ],
  "Central Zone 2": [
    [12.978, 77.545],
    [12.953, 77.622],
    [12.93, 77.628],
    [12.93, 77.54],
    [12.945, 77.533],
    [12.978, 77.545]
  ],
  "East Zone 1": [
    [13.018, 77.631],
    [13.048, 77.657],
    [13.062, 77.689],
    [12.889, 77.711],
    [12.916, 77.638],
    [12.93, 77.628],
    [12.953, 77.622],
    [13.018, 77.631]
  ],
  "East Zone 2": [
    [12.889, 77.711],
    [13.062, 77.689],
    [13.138, 77.754],
    [13.134, 77.76],
    [12.84, 77.76],
    [12.889, 77.711]
  ],
  "South Zone 1": [
    [12.93, 77.628],
    [12.916, 77.638],
    [12.837, 77.54],
    [12.93, 77.54],
    [12.93, 77.628]
  ],
  "South Zone 2": [
    [12.837, 77.54],
    [12.916, 77.638],
    [12.889, 77.711],
    [12.84, 77.76],
    [12.8, 77.76],
    [12.8, 77.525],
    [12.837, 77.54]
  ]
}

ZONE_POLYGONS = {
    zone_name: Polygon(
        [(lon, lat) for lat, lon in coords]
    )
    for zone_name, coords in ZONES.items()
}

# =====================================================
# LOCATION ENRICHMENT
# =====================================================

def get_location_info(
    latitude: float,
    longitude: float
):

    point_rad = np.radians(
        [[latitude, longitude]]
    )

    dist, idx = JUNCTION_TREE.query(
        point_rad,
        k=1
    )

    nearest_junction = (
        JUNCTION_NAMES[
            idx[0][0]
        ]
    )
    
    nearest_distance = round(
        dist[0][0] * EARTH_RADIUS_KM,
        3
    )

    point = Point(
        longitude,
        latitude
    )

    zone = ""

    for zone_name, polygon in ZONE_POLYGONS.items():

        if polygon.contains(point):
            zone = zone_name
            break

    return {
        "nearest_junc": nearest_junction,
        "nearest_junc_dist": nearest_distance,
        "zone": zone
    }