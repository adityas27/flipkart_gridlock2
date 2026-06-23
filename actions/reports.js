'use server';

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function submitReportAction(formData) {
  try {
    const { userId } = await auth();

    const name = formData.eventName || "Untitled Incident";
    const type = formData.eventType || "Other";
    const cause = formData.eventCause || "";
    const crowdSize = Number(formData.crowdSize || 0);
    const location = formData.location || "Unknown Location";
    const startTime = formData.startTime || new Date().toISOString();
    const endTime = formData.endTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const photoUrl = formData.photoUrl || null;
    const latitude = formData.latitude ? Number(formData.latitude) : null;
    const longitude = formData.longitude ? Number(formData.longitude) : null;

    const descriptionPayload = JSON.stringify({
      cause,
      type,
      startTime,
      endTime,
      latitude,
      longitude,
    });

    const report = await db.incidentReport.create({
      data: {
        title: name,
        status: "Pending Verification",
        severity: "Moderate",
        location,
        affectedLanes: 1,
        progress: 1,
        description: descriptionPayload,
        estimatedPeople: crowdSize,
        roadClosed: false,
        clerkId: userId || null,
        photoUrl,
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
        photoUrl: report.photoUrl,
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
      photoUrl: report.photoUrl,
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
      photoUrl: report.photoUrl,
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

    let coords = getCoordinatesForLocation(incident.location);
    const zoneName = getZoneForLocation(incident.location);

    let eventType = "OTHER";
    let eventCause = incident.description || incident.title;
    let startTime = new Date();
    let endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);

    try {
      if (incident.description && incident.description.startsWith("{")) {
        const parsed = JSON.parse(incident.description);
        if (parsed.type) {
          const typeUpper = parsed.type.toUpperCase();
          if (["FESTIVAL", "CONCERT", "SPORTS", "POLITICAL", "RELIGIOUS", "CORPORATE", "EDUCATIONAL", "OTHER"].includes(typeUpper)) {
            eventType = typeUpper;
          }
        }
        if (parsed.cause) {
          eventCause = parsed.cause;
        }
        if (parsed.startTime) {
          startTime = new Date(parsed.startTime);
        }
        if (parsed.endTime) {
          endTime = new Date(parsed.endTime);
        }
        if (parsed.latitude && parsed.longitude) {
          coords = {
            latitude: Number(parsed.latitude),
            longitude: Number(parsed.longitude)
          };
        }
      }
    } catch (e) {
      console.warn("Could not parse incident description JSON:", e);
    }

    // 1. Promote to Event
    const event = await db.event.create({
      data: {
        eventName: incident.title,
        eventType,
        eventCause,
        status: "ONGOING",
        startTime,
        endTime,
        location: incident.location,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }
    });

    // 2. Run ML Prediction
    const { generatePrediction } = await import("@/services/predictions");
    const predictionData = await generatePrediction({
      eventType: eventType,
      eventCause: eventCause,
      latitude: coords.latitude,
      longitude: coords.longitude,
      zone: zoneName,
      roadClosure: incident.roadClosed ? "Yes" : "None",
      duration: Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))),
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

export async function deleteIncidentAction(incidentId) {
  try {
    await db.incidentReport.delete({
      where: { id: incidentId }
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting incident:", error);
    return { success: false, error: error.message };
  }
}
