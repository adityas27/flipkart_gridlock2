'use server';

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function submitReportAction(formData) {
  try {
    const { userId } = await auth();

    const incidentType = formData.incidentType || "Other";
    const location = formData.location || "Unknown Location";
    const description = formData.description || "";
    const estimatedPeople = Number(formData.estimatedPeople || 0);
    const affectedLanes = Number(formData.blockedLanes || 1);
    const roadClosed = Boolean(formData.roadClosed);

    const title = `${incidentType} at ${location}`;

    const report = await db.incidentReport.create({
      data: {
        title,
        status: "Pending Verification",
        severity: "Moderate",
        location,
        affectedLanes,
        progress: 1,
        description,
        estimatedPeople,
        roadClosed,
        clerkId: userId || null,
      },
    });

    return {
      success: true,
      report: {
        id: report.id,
        title: report.title,
        status: report.status,
        severity: report.severity,
        location: report.location,
        submittedAt: report.submittedAt.toISOString(),
        affectedLanes: report.affectedLanes,
        progress: report.progress,
        description: report.description,
        estimatedPeople: report.estimatedPeople,
        roadClosed: report.roadClosed,
      },
    };
  } catch (error) {
    console.error("Error submitting incident report to database:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getReportsAction() {
  try {
    const { userId } = await auth();

    // Query reports submitted by this user, or all reports if not logged in
    const queryOptions = userId ? { where: { clerkId: userId } } : {};
    const reports = await db.incidentReport.findMany({
      ...queryOptions,
      orderBy: { submittedAt: "desc" },
    });

    return reports.map((report) => ({
      id: report.id,
      title: report.title,
      status: report.status,
      severity: report.severity,
      location: report.location,
      submittedAt: report.submittedAt.toISOString(),
      affectedLanes: report.affectedLanes,
      progress: report.progress,
      description: report.description,
      estimatedPeople: report.estimatedPeople,
      roadClosed: report.roadClosed,
    }));
  } catch (error) {
    console.error("Error fetching reports from database:", error);
    return [];
  }
}

export async function getPendingReportsAction() {
  try {
    const reports = await db.incidentReport.findMany({
      where: { status: "Pending Verification" },
      orderBy: { submittedAt: "asc" },
    });
    return reports.map((report) => ({
      id: report.id,
      title: report.title,
      status: report.status,
      severity: report.severity,
      location: report.location,
      submittedAt: report.submittedAt.toISOString(),
      affectedLanes: report.affectedLanes,
      progress: report.progress,
      description: report.description,
      estimatedPeople: report.estimatedPeople,
      roadClosed: report.roadClosed,
    }));
  } catch (error) {
    console.error("Error fetching pending reports:", error);
    return [];
  }
}

function getCoordinatesForLocation(locationName) {
  const loc = (locationName || "").toLowerCase();
  if (loc.includes("mg road")) {
    return { latitude: 12.971599, longitude: 77.594566 };
  }
  if (loc.includes("riverfront")) {
    return { latitude: 12.9807, longitude: 77.6161 };
  }
  if (loc.includes("stadium")) {
    return { latitude: 12.9664, longitude: 77.5601 };
  }
  if (loc.includes("south link")) {
    return { latitude: 12.9315, longitude: 77.6148 };
  }
  if (loc.includes("north gate")) {
    return { latitude: 13.0206, longitude: 77.5966 };
  }
  
  // Try mapping broad zones:
  if (loc.includes("central")) return { latitude: 12.9721, longitude: 77.5933 };
  if (loc.includes("east")) return { latitude: 12.9807, longitude: 77.6161 };
  if (loc.includes("west")) return { latitude: 12.9664, longitude: 77.5601 };
  if (loc.includes("south")) return { latitude: 12.9315, longitude: 77.6148 };
  if (loc.includes("north")) return { latitude: 13.0206, longitude: 77.5966 };

  // Default to Bangalore center
  return { latitude: 12.971599, longitude: 77.594566 };
}

function getZoneForLocation(locationName) {
  const loc = (locationName || "").toLowerCase();
  if (loc.includes("east") || loc.includes("riverfront")) return "East";
  if (loc.includes("west") || loc.includes("stadium")) return "West";
  if (loc.includes("south") || loc.includes("south link")) return "South";
  if (loc.includes("north") || loc.includes("north gate")) return "North";
  return "Central";
}

export async function verifyIncidentAction(incidentId) {
  try {
    const incident = await db.incidentReport.findUnique({
      where: { id: incidentId }
    });

    if (!incident) throw new Error("Incident not found");

    const coords = getCoordinatesForLocation(incident.location);
    const zoneName = getZoneForLocation(incident.location);

    // 1. Promote to Event
    const event = await db.event.create({
      data: {
        eventName: incident.title,
        eventType: "OTHER",
        eventCause: incident.description || incident.title,
        status: "ONGOING",
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // Default 2 hours duration
        location: incident.location,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }
    });

    // 2. Run ML Prediction
    const { generatePrediction } = await import("@/services/predictions");
    const predictionData = await generatePrediction({
      eventType: incident.title.split(" ")[0] || "Other",
      eventCause: incident.description || incident.title,
      latitude: coords.latitude,
      longitude: coords.longitude,
      zone: zoneName,
      roadClosure: incident.roadClosed ? "Yes" : "None",
      duration: 2,
      crowdSize: incident.estimatedPeople,
    });

    if (predictionData) {
      const recResources = predictionData.resources || {};
      const recommended = recResources.recommended_resources || {};
      const diversionStrategy = recResources.diversion_strategy || {
        barricade_placements: ["Standard deployment at critical junctions."],
        emergency_corridors: ["Keep immediate left lane clear."],
        transit_rerouting: ["Reroute buses to parallel street."]
      };

      await db.prediction.create({
        data: {
          eventId: event.id,
          severityScore: predictionData.congestionScore,
          hotspotScore: 1000,
          junctionScore: 5.0,
          closureScore: incident.roadClosed ? 100 : 20,
          riskScore: predictionData.congestionScore,
          trafficScore: predictionData.congestionScore * 0.8,
          riskCategory: predictionData.severity,
          officers: recommended.officers || Math.max(5, Math.round(predictionData.congestionScore * 0.8)),
          barricades: recommended.barricades || Math.max(2, Math.round(predictionData.congestionScore * 0.5)),
          towVehicles: recommended.tow_vehicles || Math.max(0, Math.round(predictionData.congestionScore * 0.05)),
          diversionStrategy: diversionStrategy
        }
      });
    }

    // 3. Mark incident as verified
    await db.incidentReport.update({
      where: { id: incidentId },
      data: { status: "Verified", progress: 4 }
    });

    return { success: true };
  } catch (error) {
    console.error("Error verifying incident:", error);
    return { success: false, error: error.message };
  }
}
