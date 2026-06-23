'use server';

const ZONE_COORDS = {
  Central: { latitude: 12.9721, longitude: 77.5933 },
  East: { latitude: 12.9807, longitude: 77.6161 },
  West: { latitude: 12.9664, longitude: 77.5601 },
  South: { latitude: 12.9315, longitude: 77.6148 },
  North: { latitude: 13.0206, longitude: 77.5966 },
};

function mapRiskCategory(category) {
  if (!category) return "Moderate";
  const cat = category.toUpperCase();
  if (cat === "LOW") return "Low";
  if (cat === "HIGH") return "High";
  if (cat === "CRITICAL") return "Critical";
  return "Moderate";
}

export async function generatePrediction(formData) {
  try {
    const zoneName = formData.zone || "Central";
    const coords = ZONE_COORDS[zoneName] || ZONE_COORDS.Central;
    const requiresRoadClosure = formData.roadClosure && formData.roadClosure !== "None";

    const payload = {
      event_type: formData.eventType || "Other",
      event_cause: formData.eventCause || "Gathering",
      latitude: Number(coords.latitude),
      longitude: Number(coords.longitude),
      zone: zoneName,
      junction: formData.location || "Central Avenue",
      corridor: "Unknown",
      police_station: "Unknown",
      authenticated: "True",
      veh_type: "Unknown",
      requires_road_closure: requiresRoadClosure,
      event_datetime: new Date().toISOString(),
      available_resources: {
        officers: 150,
        marshals: 50,
        barricades: 100,
        tow_vehicles: 15,
        ambulances: 5,
      }
    };

    const apiUrl = process.env.FASTAPI_URL || "http://localhost:8000/predict";
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      
      const score = Math.round(data.risk_score ?? data.severity_score ?? 0);
      const severity = mapRiskCategory(data.risk_category);

      return {
        congestionScore: score,
        severity,
        delayMinutes: Math.max(8, Math.round(score * 0.42)),
        impactRadius: `${(score / 24).toFixed(1)} km`,
        confidenceScore: `${Math.min(97, Math.round(data.severity_score || score))}%`,
        explanation: Array.isArray(data.resources?.reasoning)
          ? data.resources.reasoning
          : (Array.isArray(data.explanation) ? data.explanation : []),
        resources: data.resources,
      };
    } else {
      console.warn("FastAPI prediction service returned error status:", res.status);
    }
  } catch (error) {
    console.error("FastAPI prediction call failed, using fallback:", error);
  }

  // Fallback prediction calculation
  const crowdWeight = Math.min(35, Math.round(Number(formData.crowdSize || 0) / 700));
  const durationWeight = Math.min(18, Number(formData.duration || 0) * 2);
  const closureWeight = formData.roadClosure && formData.roadClosure !== "None" ? 14 : 4;
  const zoneWeight = formData.zone === "Central" || formData.zone === "West" ? 16 : 10;
  const score = Math.min(98, 24 + crowdWeight + durationWeight + closureWeight + zoneWeight);

  let severity = "Moderate";
  if (score >= 85) severity = "Critical";
  else if (score >= 70) severity = "High";
  else if (score < 50) severity = "Low";

  return {
    congestionScore: score,
    severity,
    delayMinutes: Math.max(8, Math.round(score * 0.42)),
    impactRadius: `${(score / 24).toFixed(1)} km`,
    confidenceScore: `${Math.min(97, score + 5)}%`,
    explanation: ["add data here"],
  };
}
