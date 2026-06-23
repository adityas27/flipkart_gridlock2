'use server';

import { db } from "@/lib/prisma";
import { getDiversionRoutes } from "@/services/diversions";

const EVENT_STATUS_LABELS = {
  SCHEDULED: "Scheduled",
  ONGOING: "Active",
  COMPLETED: "Resolved",
  CANCELLED: "Resolved",
};

function getSeverityFromScore(score) {
  if (score >= 85) return "Critical";
  if (score >= 70) return "High";
  if (score < 50) return "Low";
  return "Moderate";
}

function inferZoneFromLocation(location = "") {
  const value = location.toLowerCase();
  if (value.includes("central")) return "Central";
  if (value.includes("west")) return "West";
  if (value.includes("east")) return "East";
  if (value.includes("south")) return "South";
  if (value.includes("north")) return "North";
  return "Central";
}

export async function getTrafficMapData() {
  try {
    const dbEvents = await db.event.findMany({
      include: { prediction: true },
      orderBy: { startTime: "asc" },
    });

    const routes = await getDiversionRoutes();

    const mapEvents = dbEvents.map((event) => {
      const pred = event.prediction;
      const score = pred ? Math.round(pred.riskScore ?? pred.severityScore ?? 0) : 0;
      const severity = pred ? getSeverityFromScore(score) : "N/A";
      const status = EVENT_STATUS_LABELS[event.status] ?? "Scheduled";

      return {
        id: `marker-${event.id}`,
        name: event.eventName || "N/A",
        severity: severity,
        position: [Number(event.latitude), Number(event.longitude)],
        zone: inferZoneFromLocation(event.location),
        status: status,
      };
    });

    const congestionZones = dbEvents
      .filter((event) => event.prediction)
      .map((event) => {
        const pred = event.prediction;
        const score = Math.round(pred.riskScore ?? pred.severityScore ?? 0);
        const severity = getSeverityFromScore(score);

        return {
          id: `zone-${event.id}`,
          center: [Number(event.latitude), Number(event.longitude)],
          radius: Math.round(score * 18),
          severity: severity,
          label: event.eventName ? `${event.eventName} Congestion` : "N/A",
        };
      });

    return {
      mapEvents,
      congestionZones,
      mapRoutes: routes,
    };
  } catch (error) {
    console.error("Error in getTrafficMapData:", error);
  }

  return {
    mapEvents: [],
    congestionZones: [],
    mapRoutes: [],
  };
}
