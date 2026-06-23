'use server';

import { db } from "@/lib/prisma";

function inferZoneFromLocation(location = "") {
  const value = location.toLowerCase();
  if (value.includes("central")) return "Central";
  if (value.includes("west")) return "West";
  if (value.includes("east")) return "East";
  if (value.includes("south")) return "South";
  if (value.includes("north")) return "North";
  return "Central";
}

function mapRiskCategoryToConfidence(category) {
  if (!category) return "N/A";
  const cat = category.toUpperCase();
  if (cat === "CRITICAL" || cat === "HIGH") return "High";
  if (cat === "MEDIUM") return "Medium";
  if (cat === "LOW") return "Low";
  return "N/A";
}

async function fetchOSRMRoute(lat, lon, score) {
  try {
    // 1. Calculate offset based on severity (score)
    // 0.005 degrees is approx 500m. Scale up to 0.01 for high severity.
    const offset = 0.003 + (score / 100) * 0.007; 
    
    const lat1 = lat + offset;
    const lon1 = lon - offset; // North-West
    const lat2 = lat - offset;
    const lon2 = lon + offset; // South-East
    
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    
    if (data.routes && data.routes.length > 0) {
      // OSRM GeoJSON returns coordinates in [longitude, latitude] format
      // Leaflet expects [latitude, longitude], so map it:
      const routeCoords = data.routes[0].geometry.coordinates;
      return routeCoords.map(coord => [coord[1], coord[0]]);
    }
  } catch (err) {
    console.error("OSRM Routing error:", err);
  }
  return null;
}

export async function getDiversionRoutes() {
  try {
    const dbEvents = await db.event.findMany({
      include: { prediction: true },
      orderBy: { startTime: "asc" },
    });

    if (dbEvents && dbEvents.length > 0) {
      // Filter events that have predictions
      const eventsWithPreds = dbEvents.filter(e => e.prediction);
      
      // Sort by riskScore descending to assign rank
      eventsWithPreds.sort((a, b) => {
        const scoreA = a.prediction.riskScore ?? a.prediction.severityScore ?? 0;
        const scoreB = b.prediction.riskScore ?? b.prediction.severityScore ?? 0;
        return scoreB - scoreA;
      });

      const routesData = await Promise.all(eventsWithPreds.map(async (event, index) => {
        const pred = event.prediction;
        const score = Math.round(pred.riskScore ?? pred.severityScore ?? 0);
        const delayReductionVal = Math.round(score * 0.22);
        
        let status = "Monitoring";
        if (event.status === "ONGOING") status = "Recommended";
        else if (event.status === "SCHEDULED") status = "Fallback";

        let points = [];
        if (event.latitude && event.longitude) {
          const osrmPoints = await fetchOSRMRoute(Number(event.latitude), Number(event.longitude), score);
          if (osrmPoints && osrmPoints.length > 0) {
            points = osrmPoints;
          } else {
            // Procedural fallback bypass curve if OSRM is unreachable
            const lat = Number(event.latitude);
            const lon = Number(event.longitude);
            points = [
              [lat + 0.002, lon - 0.002],
              [lat + 0.003, lon + 0.003],
              [lat - 0.002, lon + 0.002],
            ];
          }
        }

        // Add Gemini Diversion Strategies from Prediction
        const strat = pred.diversionStrategy || {};
        const notes = strat.barricade_placements?.length 
          ? strat.barricade_placements.join(" ") 
          : (event.eventCause ? `Rollout to mitigate congestion from ${event.eventCause}.` : "N/A");

        return {
          id: `route-${event.id}`,
          name: event.eventName ? `${event.eventName} Diversion` : "N/A",
          status: status,
          rank: index + 1,
          delayReduction: delayReductionVal > 0 ? `${delayReductionVal} min` : "0 min",
          distance: "N/A",
          zone: inferZoneFromLocation(event.location),
          confidence: mapRiskCategoryToConfidence(pred.riskCategory),
          checkpoints: [],
          notes: notes,
          coordinates: points,
        };
      }));
      return routesData;
    }
  } catch (error) {
    console.error("Error in getDiversionRoutes:", error);
  }

  return [];
}
