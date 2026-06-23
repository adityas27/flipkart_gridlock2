# Setup Guide - Event Intelligence API

## 📦 Installation

### 1. Install Dependencies
```bash
cd ml
pip install -r requirements.txt
```

### 2. Environment Configuration
Create a `.env` file in the `ml/` directory:

```env
# Google Gemini API Key (New API)
GEMINI_API_KEY=your_gemini_api_key_here

# TomTom Traffic API Key
API=your_tomtom_api_key_here
```

### 3. Verify Required Files
Ensure these files exist in the `ml/` directory:

```
✅ severity_model.cbm       # CatBoost model
✅ features.pkl              # Feature names
✅ hotspot_scores.pkl        # Junction scores
✅ junction_rank.pkl         # Junction rankings
✅ data/junctions.csv        # Junction database
```

---

## 🔑 API Keys

### Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file

**Note:** Using the NEW `google-genai` SDK (not the deprecated `google-generativeai`)

### TomTom Traffic API Key
1. Visit [TomTom Developer Portal](https://developer.tomtom.com/)
2. Sign up or log in
3. Create a new app
4. Copy the API key to your `.env` file

---

## 🚀 Starting the Server

### Development Mode
```bash
cd ml
uvicorn main:app --reload --port 8000
```

### Production Mode
```bash
cd ml
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## ✅ Verification

### 1. Check API is Running
```bash
curl http://localhost:8000/docs
```
Should open Swagger UI in browser

### 2. Test Location Service
```bash
curl "http://localhost:8000/location-info?latitude=12.9716&longitude=77.5946"
```

Expected output:
```json
{
  "nearest_junc": "Junction Name",
  "nearest_junc_dist": 0.342,
  "zone": "Central Zone 1"
}
```

### 3. Test Prediction Endpoint
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

Should return comprehensive JSON response with risk scores and resource allocation.

---

## 🔄 Migration from Old GenAI API

### What Changed
The old `google-generativeai` package has been replaced with the new `google-genai` SDK.

### Old Code (Deprecated)
```python
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemma-3-4b-it")
response = model.generate_content(prompt)
```

### New Code (Current)
```python
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
response = client.models.generate_content(
    model="gemma-2-9b-it",
    contents=prompt
)
```

### Model Change
- **Old**: `gemma-3-4b-it` (not available in new API)
- **New**: `gemma-2-9b-it` (better performance, officially supported)

---

## 🐛 Troubleshooting

### Server Won't Start

**Issue: "ValueError: Input contains NaN"**
- **Cause**: Missing lat/long values in junctions.csv
- **Fix**: Already handled with `dropna()` in location.py
- **Verify**: Check `services/location.py` line 26

**Issue: "Module not found: google.genai"**
- **Cause**: Wrong GenAI package installed
- **Fix**: `pip uninstall google-generativeai && pip install google-genai`

**Issue: "Model files not found"**
- **Cause**: Missing .pkl or .cbm files
- **Fix**: Ensure all model files are in ml/ directory

### API Errors

**Issue: "Invalid API key" for Gemini**
- **Fix**: Verify GEMINI_API_KEY in .env is correct
- **Test**: Try the key in [Google AI Studio](https://aistudio.google.com/)

**Issue: "Traffic score is 0"**
- **Cause**: TomTom API key issue or network error
- **Fix**: Verify API key in .env, check network connectivity
- **Note**: System falls back gracefully to 0 (no congestion)

**Issue: "LLM returns 0 resources"**
- **Cause**: Gemini API error or response parse failure
- **Check**: Look for error message in `resources.reasoning` field
- **Fix**: Check API key, model availability, network

### Data Issues

**Issue: "Zone is empty string"**
- **Cause**: Coordinates outside mapped Bangalore zones
- **Note**: This is expected behavior, junction is still calculated

**Issue: "Junction not found"**
- **Cause**: junctions.csv missing or corrupted
- **Fix**: Verify `data/junctions.csv` exists and has data

---

## 📊 Package Versions

```
fastapi==0.115.5
uvicorn==0.32.1
catboost==1.2.7
scikit-learn==1.5.2
pandas==2.2.3
numpy==2.1.3
shapely==2.0.6
google-genai==0.2.2         # NEW API
requests==2.32.3
python-dotenv==1.0.1
pydantic==2.10.3
joblib==1.4.2
```

---

## 🔒 Security Notes

1. **Never commit `.env` file** to git
2. **Rotate API keys** regularly
3. **Use environment variables** for all secrets
4. **Restrict API keys** to specific domains/IPs in production
5. **Monitor API usage** to detect anomalies

---

## 📈 Performance Tips

1. **Pre-load models** at startup (already done via lifespan)
2. **Use connection pooling** for external APIs
3. **Cache junction lookups** for repeated coordinates
4. **Run multiple workers** in production: `--workers 4`
5. **Monitor response times** and optimize slow endpoints

---

## 🧪 Testing

### Manual Testing
Use the Swagger UI at `http://localhost:8000/docs` for interactive testing.

### Automated Testing
```bash
# Install pytest
pip install pytest pytest-asyncio httpx

# Run tests (when available)
pytest tests/
```

---

## 📝 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Verify model files
4. ✅ Start server
5. ✅ Test endpoints
6. 🔄 Integrate with frontend
7. 🔄 Deploy to production

---

## 📚 Additional Resources

- **API Documentation**: See `API_SUMMARY.md`
- **Integration Guide**: See `INTEGRATION_CHECKLIST.md`
- **Quick Reference**: See `QUICK_REFERENCE.md`
- **System Overview**: See `SYSTEM_SUMMARY.md`
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Google GenAI SDK**: https://github.com/google/generative-ai-python
- **TomTom Traffic API**: https://developer.tomtom.com/traffic-api

---

_Last Updated: 2024 | Status: Production Ready ✅_
