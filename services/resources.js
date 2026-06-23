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

function formatTime(date) {
  if (!date) return "00:00";
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export async function getResourcePlan() {
  try {
    const dbEvents = await db.event.findMany({
      include: { prediction: true },
      orderBy: { startTime: "asc" }
    });

    if (dbEvents && dbEvents.length > 0) {
      let officersRequired = 0;
      let barricades = 0;
      let towVehicles = 0;

      const zoneGroups = {};

      dbEvents.forEach((event) => {
        const prediction = event.prediction;
        if (prediction) {
          const officers = prediction.officers ?? 0;
          const barricadeCount = prediction.barricades ?? 0;
          const towCount = prediction.towVehicles ?? 0;
          const marshals = Math.max(2, Math.round(officers * 0.3));

          officersRequired += officers;
          barricades += barricadeCount;
          towVehicles += towCount;

          const zoneName = inferZoneFromLocation(event.location);
          
          const shiftStart = formatTime(event.startTime);
          const shiftEnd = formatTime(event.endTime);
          const shift = `${shiftStart} - ${shiftEnd}`;

          let status = "Monitoring";
          if (event.status === "ONGOING") status = "Assigned";
          else if (event.status === "SCHEDULED") status = "Queued";
          else if (event.status === "COMPLETED" || event.status === "CANCELLED") status = "Reserved";

          if (!zoneGroups[zoneName]) {
            zoneGroups[zoneName] = {
              id: `zone-${zoneName.toLowerCase()}`,
              zone: zoneName,
              shift: shift,
              officers: 0,
              marshals: 0,
              barricades: 0,
              towVehicles: 0,
              status: status,
            };
          }

          zoneGroups[zoneName].officers += officers;
          zoneGroups[zoneName].marshals += marshals;
          zoneGroups[zoneName].barricades += barricadeCount;
          zoneGroups[zoneName].towVehicles += towCount;

          if (event.status === "ONGOING") {
            zoneGroups[zoneName].status = "Assigned";
          }
        }
      });

      const trafficMarshals = Math.max(2, Math.round(officersRequired * 0.3));
      
      const maxOfficers = 150; 
      const utilizationPercent = Math.min(100, Math.round((officersRequired / maxOfficers) * 100));
      const utilization = `${utilizationPercent}%`;
      
      let readiness = "High";
      if (utilizationPercent > 85) readiness = "Critical";
      else if (utilizationPercent > 70) readiness = "Moderate";
      else if (utilizationPercent === 0) readiness = "N/A";

      const table = Object.values(zoneGroups);

      const suggestions = [];
      if (officersRequired > 100) {
        suggestions.push("Manpower utilization is high. Consider shifting reserve officers from South/North zones to Central zone pre-event staging.");
      } else {
        suggestions.push("Manpower utilization is stable. Monitor shift rotations and coordinate patrol schedules.");
      }
      if (towVehicles > 5) {
        suggestions.push("Pre-stage tow vehicles near active West/Central exits to reduce post-event clearance time.");
      }
      if (barricades > 50) {
        suggestions.push("Optimize barricade placement by reusing clusters once compliance audits are completed.");
      }

      return {
        summary: {
          officersRequired,
          trafficMarshals,
          barricades,
          towVehicles,
          utilization,
          readiness,
        },
        table,
        suggestions: suggestions.length > 0 ? suggestions : ["No immediate optimization recommendations. All zones operating within standard thresholds."],
      };
    }
  } catch (error) {
    console.error("Error in getResourcePlan:", error);
  }

  // Fallback Rule: Return empty-state structures with 0 and N/A if backend data is unavailable
  return {
    summary: {
      officersRequired: 0,
      trafficMarshals: 0,
      barricades: 0,
      towVehicles: 0,
      utilization: "0%",
      readiness: "N/A",
    },
    table: [],
    suggestions: [],
  };
}
