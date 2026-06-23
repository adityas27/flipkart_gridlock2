'use server';

import { db } from "@/lib/prisma";

const GLOBAL_LIMITS = {
  officers: 150,
  barricades: 100,
  towVehicles: 20,
};

function inferZoneFromLocation(location = "") {
  const value = location.toLowerCase();
  if (value.includes("central")) return "Central";
  if (value.includes("west")) return "West";
  if (value.includes("east")) return "East";
  if (value.includes("south")) return "South";
  if (value.includes("north")) return "North";
  return "Central";
}

export async function coordinateResourcesAction() {
  try {
    const dbEvents = await db.event.findMany({
      include: { prediction: true },
      where: {
        status: {
          in: ["ONGOING", "SCHEDULED"]
        }
      }
    });

    if (!dbEvents || dbEvents.length === 0) {
      return {
        success: false,
        error: "No active or scheduled events found in the database to coordinate.",
      };
    }

    const eventDetailsList = dbEvents.map((event) => {
      const pred = event.prediction;
      return {
        id: event.id,
        name: event.eventName,
        location: event.location,
        zone: inferZoneFromLocation(event.location),
        status: event.status,
        crowdSize: event.crowdSize,
        requestedResources: pred ? {
          officers: pred.officers,
          barricades: pred.barricades,
          towVehicles: pred.towVehicles,
          riskCategory: pred.riskCategory,
          riskScore: pred.riskScore || pred.severityScore,
        } : null,
      };
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured. Falling back to local coordination logic.");
      return runLocalCoordination(eventDetailsList);
    }

    const prompt = `
    You are the Traffic Dispatch Coordinator. We have a set of overlapping traffic disruptions requiring field resource deployment.
    
    GLOBAL POOL CAPACITIES:
    - Max Officers Available: ${GLOBAL_LIMITS.officers}
    - Max Barricades Available: ${GLOBAL_LIMITS.barricades}
    - Max Tow Vehicles Available: ${GLOBAL_LIMITS.towVehicles}
    
    EVENTS REQUIRING COORDINATION:
    ${JSON.stringify(eventDetailsList, null, 2)}
    
    TASK:
    1. Allocate officers, barricades, and tow vehicles to each zone (Central, West, East, South, North).
    2. Sum of allocated resources across all zones MUST NOT exceed the global capacities.
    3. Prioritize zones/events with higher risk scores or critical categories.
    4. Provide the coordinated zone table and a brief explanation of how you resolved the allocation.
    
    Return EXACTLY a JSON object with this shape (no markdown, no backticks):
    {
      "coordinatedTable": [
        {
          "zone": "Central",
          "officers": 30,
          "marshals": 9,
          "barricades": 20,
          "towVehicles": 2,
          "status": "Coordinated"
        }
      ],
      "reasoning": "Write a concise paragraph explaining the prioritization decisions and allocation compromises."
    }
    `;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      }),
    });

    if (res.ok) {
      const resultData = await res.json();
      const text = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          success: true,
          coordinatedTable: parsed.coordinatedTable,
          reasoning: parsed.reasoning,
        };
      }
    } else {
      console.warn("Gemini coordination API call failed status:", res.status);
    }
  } catch (error) {
    console.error("Failed to run Gemini resource coordination:", error);
  }

  // Fallback to local coordination
  try {
    const dbEvents = await db.event.findMany({
      include: { prediction: true },
    });
    return runLocalCoordination(dbEvents.map(e => ({
      name: e.eventName,
      location: e.location,
      zone: inferZoneFromLocation(e.location),
      status: e.status,
      requestedResources: e.prediction ? {
        officers: e.prediction.officers,
        barricades: e.prediction.barricades,
        towVehicles: e.prediction.towVehicles,
        riskScore: e.prediction.riskScore || e.prediction.severityScore || 50,
      } : null
    })));
  } catch (e) {
    return {
      success: false,
      error: "Failed to coordinate resources.",
    };
  }
}

function runLocalCoordination(events) {
  const zoneGroups = {};
  let totalOfficers = 0;
  let totalBarricades = 0;
  let totalTows = 0;

  events.forEach((event) => {
    if (event.requestedResources) {
      const zoneName = event.zone;
      if (!zoneGroups[zoneName]) {
        zoneGroups[zoneName] = {
          zone: zoneName,
          officers: 0,
          barricades: 0,
          towVehicles: 0,
        };
      }
      zoneGroups[zoneName].officers += event.requestedResources.officers;
      zoneGroups[zoneName].barricades += event.requestedResources.barricades;
      zoneGroups[zoneName].towVehicles += event.requestedResources.towVehicles;

      totalOfficers += event.requestedResources.officers;
      totalBarricades += event.requestedResources.barricades;
      totalTows += event.requestedResources.towVehicles;
    }
  });

  // Scale down if exceeding global capacity
  const officerScale = totalOfficers > GLOBAL_LIMITS.officers ? GLOBAL_LIMITS.officers / totalOfficers : 1.0;
  const barricadeScale = totalBarricades > GLOBAL_LIMITS.barricades ? GLOBAL_LIMITS.barricades / totalBarricades : 1.0;
  const towScale = totalTows > GLOBAL_LIMITS.towVehicles ? GLOBAL_LIMITS.towVehicles / totalTows : 1.0;

  const coordinatedTable = Object.values(zoneGroups).map((z) => {
    const officers = Math.round(z.officers * officerScale);
    return {
      zone: z.zone,
      shift: "Coordinated Shift",
      officers: officers,
      marshals: Math.max(2, Math.round(officers * 0.3)),
      barricades: Math.round(z.barricades * barricadeScale),
      towVehicles: Math.round(z.towVehicles * towScale),
      status: "Coordinated",
    };
  });

  return {
    success: true,
    coordinatedTable,
    reasoning: "Local scaling applied to ensure total deployment does not exceed global officer, barricade, and tow vehicle capacities.",
  };
}
