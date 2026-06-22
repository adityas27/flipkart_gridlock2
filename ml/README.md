# 🚦 Event Intelligence API

> AI-powered traffic event prediction and resource allocation system for intelligent traffic management

---

## 🎯 What It Does

This API predicts traffic event severity and recommends resource allocation using:
- **Machine Learning** (CatBoost) for severity prediction
- **Spatial Analysis** for automatic zone/junction detection
- **Real-time Traffic Data** (TomTom API)
- **LLM Reasoning** (Google Gemini) for intelligent resource allocation

---

## ⚡ Quick Start

### Prerequisites
```bash
pip install fastapi uvicorn catboost scikit-learn shapely pandas numpy google-generativeai requests python-dotenv pydantic
```

### Environment Setup
Create `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
API=your_tomtom_api_key_here
```

### Start Server
```bash
cd ml
uvicorn main:app --reload --port 8000
```

### Test Endpoint
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

## 📡 API Endpoints

### `POST /predict`
Predict event risk and recommend resources

**Minimal Request:**
```json
{
  "event_type": "Accident",
  "event_cause": "Collision",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "requires_road_closure": true,
  "event_datetime": "2024-03-15T14:30:00"
}
```

**Full Request (Optional Fields):**
```json
{
  "event_type": "Accident",
  "event_cause": "Multi-vehicle collision",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "zone": "Central Zone 1",              // Auto-calculated if omitted
  "junction": "MG Road Junction",        // Auto-calculated if omitted
  "corridor": "MG Road Corridor",        // Defaults to "No Corridor"
  "police_station": "Koramangala",
  "veh_type": "Car",
  "authenticated": "True",
  "requires_road_closure": true,
  "event_datetime": "2024-03-15T18:30:00",
  "available_resources": {
    "officers": 20,
    "marshals": 10,
    "barricades": 50,
    "tow_vehicles": 5,
    "ambulances": 3
  }
}
```

**Response Structure:**
```json
{
  "event": { /* Event details */ },
  "location": { /* Zone, junction, distance */ },
  "traffic": { /* Real-time traffic metrics */ },
  "severity_score": 85.32,
  "hotspot_score": 67.4,
  "junction_score": 8.5,
  "closure_score": 100,
  "risk_score": 89.47,
  "risk_category": "HIGH",
  "resources": {
    "allocation_priority": "HIGH",
    "recommended_resources": { /* Recommended counts */ },
    "resource_gap": { /* Shortfall if any */ },
    "reasoning": [ /* LLM explanation */ ]
  }
}
```

### `GET /location-info`
Get zone and junction from coordinates

**Query:**
```
GET /location-info?latitude=12.9716&longitude=77.5946
```

**Response:**
```json
{
  "nearest_junc": "MG Road Junction",
  "nearest_junc_dist": 0.342,
  "zone": "Central Zone 1"
}
```

---

## 🏗️ Architecture

```
Request → Location Enrichment → Feature Engineering → ML Prediction
              ↓                        ↓                    ↓
       Zone/Junction            Feature Vector        Severity Score
              ↓                        ↓                    ↓
         Traffic API  ──────────→  Risk Scoring  ←─── Historical Data
                                        ↓
                                LLM Reasoning
                                        ↓
                              Resource Allocation
                                        ↓
                                  Response JSON
```

---

## 📊 Risk Scoring

### Components
- **Severity Score** (25%): ML-predicted event severity
- **Hotspot Score** (25%): Historical incident density
- **Junction Score** (20%): Junction importance ranking
- **Closure Score** (10%): Road closure impact
- **Traffic Score** (20%): Real-time traffic congestion

### Categories
| Score | Category | Response Level |
|-------|----------|----------------|
| 0-25  | LOW      | Minimal |
| 25-50 | MEDIUM   | Standard |
| 50-75 | HIGH     | Priority |
| 75-100| CRITICAL | Maximum |

---

## 🛠️ Features

### ✅ Implemented
- [x] Automatic zone detection from coordinates
- [x] Automatic junction detection (nearest within 10+ zones)
- [x] Multi-factor risk scoring (5 components)
- [x] Real-time traffic integration (TomTom API)
- [x] LLM-powered resource allocation (Gemini)
- [x] Resource gap analysis
- [x] Allocation reasoning/explanation
- [x] Comprehensive API response structure

### 🔄 Planned
- [ ] Corridor auto-detection
- [ ] Fire truck and EMS integration
- [ ] Historical pattern analysis
- [ ] Multi-event coordination
- [ ] Real-time resource tracking
- [ ] Predictive event forecasting

---

## 📁 Project Structure

```
ml/
├── main.py                    # FastAPI app & endpoints
├── schemas/
│   ├── req.py                # Request models
│   └── res.py                # Response models
├── services/
│   ├── features.py           # Feature engineering
│   ├── location.py           # Zone/junction detection
│   ├── map.py                # Traffic API integration
│   ├── resources.py          # LLM resource allocation
│   └── scoring.py            # Risk computation
├── data/
│   └── junctions.csv         # Junction database
├── features.pkl              # Feature columns
├── hotspot_scores.pkl        # Historical scores
├── junction_rank.pkl         # Junction rankings
├── severity_model.cbm        # ML model
├── .env                      # API keys
├── README.md                 # This file
├── API_SUMMARY.md            # Detailed documentation
└── INTEGRATION_CHECKLIST.md  # Integration status
```

---

## 🔑 Required Files

### Model Files
- `severity_model.cbm` - Trained CatBoost model
- `features.pkl` - Feature column mapping
- `hotspot_scores.pkl` - Historical hotspot data
- `junction_rank.pkl` - Junction importance weights

### Data Files
- `data/junctions.csv` - Junction coordinates (lat, long, name)

### Environment
- `.env` - API keys for Gemini and TomTom

**Missing any of these will cause startup failure.**

---

## 🧪 Testing

### 1. Health Check
```bash
curl http://localhost:8000/docs
```
Opens interactive API documentation (Swagger UI)

### 2. Location Service
```bash
curl "http://localhost:8000/location-info?latitude=12.9716&longitude=77.5946"
```

### 3. Basic Prediction
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
        "event_datetime": "2024-03-15T14:30:00"
    }
)

print(response.json())
```

### 4. With Resource Allocation
```python
response = requests.post(
    "http://localhost:8000/predict",
    json={
        "event_type": "Accident",
        "event_cause": "Multi-vehicle collision",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "requires_road_closure": True,
        "event_datetime": "2024-03-15T18:30:00",
        "available_resources": {
            "officers": 20,
            "marshals": 10,
            "barricades": 50,
            "tow_vehicles": 5,
            "ambulances": 3
        }
    }
)

print(response.json()["resources"]["reasoning"])
```

---

## 🐛 Troubleshooting

### Server Won't Start
- Check if all `.pkl` and `.cbm` files exist
- Verify `data/junctions.csv` is present
- Ensure Python dependencies are installed

### Location Returns Empty Zone
- Coordinates may be outside mapped Bangalore regions
- Junction will still be calculated (nearest from all)

### Traffic Score is 0
- TomTom API key may be invalid
- Network connectivity issue
- Falls back gracefully to 0 (no congestion assumed)

### LLM Returns 0 Resources
- Gemini API key may be invalid/missing
- Response parsing failed
- Check `reasoning` field for error message

---

## 📚 Documentation

- **API_SUMMARY.md** - Complete API documentation with examples
- **INTEGRATION_CHECKLIST.md** - Integration status and data flow
- **Swagger UI** - Interactive docs at `http://localhost:8000/docs`
- **ReDoc** - Alternative docs at `http://localhost:8000/redoc`

---

## 🤝 Integration

This API is designed to work with:
- **Frontend**: Next.js dashboard (in `/app` directory)
- **Database**: Event logging and resource tracking
- **External Services**: Traffic APIs, mapping services
- **Mobile Apps**: Real-time incident reporting

---

## 📝 Notes

- All timestamps must be ISO 8601 format: `YYYY-MM-DDTHH:MM:SS`
- Coordinates should be within Bangalore region (12.8-13.2 lat, 77.4-77.8 lon)
- Resource counts must be non-negative integers
- LLM responses include reasoning for transparency
- Traffic data refreshes every API call (near real-time)

---

## 📄 License

Part of Flipkart GridLock 2.0 project

---

## 🚀 Status

**Version**: 2.0  
**Status**: Production Ready ✅  
**Last Updated**: 2024

All integrations complete and tested. Ready for deployment.
