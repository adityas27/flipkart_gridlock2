# Event Intelligence API - Summary

## Overview
FastAPI-based traffic event prediction and resource allocation system that combines machine learning models with LLM-powered recommendations for intelligent traffic management.

---

## 🎯 Core Features

### 1. **Automated Location Enrichment**
- Auto-calculates zone and nearest junction from GPS coordinates
- Uses spatial algorithms (BallTree with haversine metric)
- Covers 10 zones across Bangalore with 1000+ junctions
- Falls back to "Unknown" if location outside mapped areas

### 2. **Risk Prediction Engine**
- **ML Model**: CatBoost classifier for severity prediction
- **Multi-factor Scoring**:
  - Severity Score (0-100): ML-predicted event severity
  - Hotspot Score: Historical incident density at location
  - Junction Score: Junction importance ranking (1-10)
  - Closure Score: Road closure impact (20 or 100)
  - Traffic Score: Real-time traffic flow analysis
  - **Final Risk Score**: Weighted combination of all factors
  - **Risk Categories**: LOW, MEDIUM, HIGH, CRITICAL

### 3. **Real-time Traffic Integration**
- Live traffic flow data via TomTom API
- Current speed vs free-flow speed comparison
- Confidence metrics for traffic predictions

### 4. **LLM-Powered Resource Allocation**
- Uses Google Gemini (gemma-3-4b-it) for intelligent recommendations
- Context-aware allocation based on:
  - Event type and cause
  - Risk score and category
  - Road closure requirements
  - Available resource inventory
- **Resource Types**: Officers, Marshals, Barricades, Tow Vehicles, Ambulances
- Identifies resource gaps when supply is insufficient
- Provides reasoning for each allocation decision

---

## 📡 API Endpoints

### **POST /predict**
Main prediction endpoint for event risk assessment and resource planning.

#### Request Body
```json
{
  "event_type": "Accident",
  "event_cause": "Vehicle Collision",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "zone": null,                          // Optional - auto-calculated
  "junction": null,                      // Optional - auto-calculated
  "corridor": null,                      // Optional - defaults to "No Corridor"
  "requires_road_closure": true,
  "event_datetime": "2024-03-15T14:30:00",
  "police_station": "Koramangala",       // Optional
  "veh_type": "Car",                     // Optional
  "authenticated": "True",               // Optional
  "available_resources": {               // Optional - defaults to 0s
    "officers": 20,
    "marshals": 10,
    "barricades": 50,
    "tow_vehicles": 5,
    "ambulances": 3
  }
}
```

#### Response
```json
{
  "event": {
    "event_type": "Accident",
    "event_cause": "Vehicle Collision",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "requires_road_closure": true,
    "event_datetime": "2024-03-15T14:30:00",
    "police_station": "Koramangala",
    "vehicle_type": "Car"
  },
  "location": {
    "nearest_junction": "MG Road Junction",
    "nearest_junction_distance_km": 0.342,
    "zone": "Central Zone 1",
    "corridor": "No Corridor"
  },
  "traffic": {
    "traffic_score": 78.5,
    "current_speed": 15.2,
    "free_flow_speed": 45.0,
    "confidence": 0.87
  },
  "severity_score": 85.32,
  "hotspot_score": 67.4,
  "junction_score": 8.5,
  "closure_score": 100,
  "risk_score": 89.47,
  "risk_category": "HIGH",
  "resources": {
    "allocation_priority": "HIGH",
    "recommended_resources": {
      "officers": 12,
      "marshals": 6,
      "barricades": 24,
      "tow_vehicles": 3,
      "ambulances": 2
    },
    "resource_gap": {
      "officers": 0,
      "marshals": 0,
      "barricades": 0,
      "tow_vehicles": 0,
      "ambulances": 0
    },
    "reasoning": [
      "High-risk accident requires significant police presence",
      "Road closure necessitates traffic diversion setup",
      "Multiple vehicles involved require tow vehicles",
      "Medical assistance on standby for casualties"
    ]
  }
}
```

### **GET /location-info**
Utility endpoint to get location details from coordinates.

#### Query Parameters
- `latitude` (float): GPS latitude
- `longitude` (float): GPS longitude

#### Response
```json
{
  "nearest_junc": "MG Road Junction",
  "nearest_junc_dist": 0.342,
  "zone": "Central Zone 1"
}
```

---

## 🏗️ Architecture

### Project Structure
```
ml/
├── main.py                    # FastAPI application & endpoints
├── schemas/
│   ├── req.py                # Request models (EventPredictionRequest)
│   └── res.py                # Response models (PredictionResponse)
├── services/
│   ├── features.py           # Feature engineering for ML model
│   ├── location.py           # Zone/junction calculation
│   ├── map.py                # Traffic flow API integration
│   ├── resources.py          # LLM-powered resource allocation
│   └── scoring.py            # Risk score computation
├── data/
│   └── junctions.csv         # Junction database
├── features.pkl              # Feature column names
├── hotspot_scores.pkl        # Historical hotspot rankings
├── junction_rank.pkl         # Junction importance scores
└── severity_model.cbm        # CatBoost trained model
```

### Component Flow
```
Request → Location Enrichment → Feature Extraction → ML Prediction
                                                          ↓
                                                   Risk Scoring
                                                          ↓
                                          Traffic Flow Integration
                                                          ↓
                                       LLM Resource Allocation
                                                          ↓
                                         Response Assembly
```

### Dependencies
- **FastAPI**: Web framework
- **CatBoost**: ML model for severity prediction
- **Scikit-learn**: BallTree for spatial queries
- **Shapely**: Polygon containment for zones
- **Google GenAI**: New Gemini API for LLM reasoning
- **Pandas/NumPy**: Data processing
- **Pydantic**: Request/response validation

---

## 🔧 Configuration

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key_here
TOMTOM_API_KEY=your_tomtom_api_key_here
```

### Model Files (Required)
- `severity_model.cbm` - CatBoost trained model
- `features.pkl` - Feature column mapping
- `hotspot_scores.pkl` - Historical incident scores
- `junction_rank.pkl` - Junction importance weights
- `data/junctions.csv` - Junction coordinates database

---

## 🚀 Usage

### Starting the Server
```bash
cd ml
uvicorn main:app --reload --port 8000
```

### Example Request (Python)
```python
import requests

response = requests.post(
    "http://localhost:8000/predict",
    json={
        "event_type": "Accident",
        "event_cause": "Collision",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "requires_road_closure": True,
        "event_datetime": "2024-03-15T14:30:00",
        "available_resources": {
            "officers": 20,
            "marshals": 10,
            "barricades": 50,
            "tow_vehicles": 5,
            "ambulances": 3
        }
    }
)

print(response.json())
```

### Example Request (cURL)
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "Accident",
    "event_cause": "Collision",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "requires_road_closure": true,
    "event_datetime": "2024-03-15T14:30:00"
  }'
```

---

## ✨ Key Improvements

### What's New
1. **Optional Location Fields**: Zone and junction auto-calculated from coordinates
2. **Corridor Handling**: Defaults to "No Corridor" when not provided
3. **Enhanced Response**: Structured output with event, location, traffic, and resource details
4. **LLM Integration**: Intelligent resource allocation with reasoning
5. **Real-time Traffic**: Live traffic flow integration
6. **Comprehensive Validation**: Pydantic models ensure data integrity

### Benefits
- ✅ Reduced manual data entry (auto-location)
- ✅ Context-aware resource allocation (LLM reasoning)
- ✅ Multi-dimensional risk assessment (5 scoring factors)
- ✅ Real-time traffic awareness
- ✅ Structured, detailed API responses
- ✅ Scalable architecture with clear separation of concerns

---

## 📊 Scoring Logic

### Risk Score Formula
```python
risk_score = (
    0.25 * severity_score +      # ML-predicted severity
    0.20 * hotspot_score +        # Historical incident density
    0.15 * junction_score +       # Junction importance
    0.25 * closure_score +        # Road closure impact
    0.15 * traffic_score          # Current traffic congestion
)
```

### Risk Categories
| Score Range | Category  | Description |
|-------------|-----------|-------------|
| 0-25        | LOW       | Minor impact, minimal resources |
| 25-50       | MEDIUM    | Moderate impact, standard response |
| 50-75       | HIGH      | Significant impact, priority response |
| 75-100      | CRITICAL  | Severe impact, maximum resources |

---

## 🛠️ Future Enhancements (TODO)
1. ✅ ~~LLM-based resource allocation~~ (Completed)
2. ✅ ~~Automatic location enrichment~~ (Completed)
3. 🔄 Corridor auto-calculation (requires additional data)
4. 🔄 Fire trucks and emergency medical services integration
5. 🔄 Historical data analysis for pattern detection
6. 🔄 Real-time resource availability tracking
7. 🔄 Multi-event coordination and optimization

---

## 📝 Notes
- Location enrichment requires valid coordinates within Bangalore region
- Traffic data requires valid TomTom API key
- LLM recommendations require valid Gemini API key
- Model files must be present in the ml/ directory
- All timestamps should be in ISO 8601 format
