'use server';

import { db } from "@/lib/prisma";

const EVENT_TYPE_LABELS = {
  FESTIVAL: "Festival",
  CONCERT: "Festival",
  SPORTS: "Sports Event",
  POLITICAL: "Political Rally",
  RELIGIOUS: "Festival",
  CORPORATE: "Festival",
  EDUCATIONAL: "Festival",
  OTHER: "Emergency Gathering",
};

const EVENT_STATUS_LABELS = {
  SCHEDULED: "Scheduled",
  ONGOING: "Active",
  COMPLETED: "Resolved",
  CANCELLED: "Resolved",
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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

function buildSyntheticTimeline(event, prediction) {
  if (!prediction) return [];
  return [
    {
      label: "Event created",
      time: event.createdAt ? event.createdAt.toISOString() : (event.startTime ? event.startTime.toISOString() : new Date().toISOString()),
      detail: `Event record created for ${event.location || 'N/A'}.`,
    },
    {
      label: "Prediction attached",
      time: prediction.createdAt ? prediction.createdAt.toISOString() : (event.startTime ? event.startTime.toISOString() : new Date().toISOString()),
      detail: `Risk category marked ${prediction.riskCategory || 'Moderate'} with officer recommendation generated.`,
    },
    {
      label: "Operational window",
      time: event.endTime ? event.endTime.toISOString() : new Date().toISOString(),
      detail: `Event scheduled between ${event.startTime ? event.startTime.toISOString() : 'N/A'} and ${event.endTime ? event.endTime.toISOString() : 'N/A'}.`,
    },
  ];
}

function mapDbEventToUiEvent(event) {
  if (!event) return null;
  const prediction = event.prediction ?? null;

  // If no prediction is attached, return 0 or N/A or empty arrays instead of synthetic calculations
  if (!prediction) {
    return {
      id: event.id || "N/A",
      name: event.eventName || "N/A",
      type:
        EVENT_TYPE_LABELS[event.eventType] ??
        "Emergency Gathering",
      cause:
        event.eventCause ??
        "General disruption",
      crowdSize: event.crowdSize ?? 0,
      location: event.location || "N/A",
      zone: inferZoneFromLocation(event.location),
      latitude: event.latitude ? Number(event.latitude) : 0,
      longitude: event.longitude ? Number(event.longitude) : 0,
      startTime: event.startTime ? event.startTime.toISOString() : new Date().toISOString(),
      endTime: event.endTime ? event.endTime.toISOString() : new Date().toISOString(),
      status:
        EVENT_STATUS_LABELS[event.status] ??
        "Scheduled",
      severity: "N/A",
      congestionScore: 0,
      delayMinutes: 0,
      impactRadius: "N/A",
      confidence: 0,
      officersRequired: 0,
      barricadesRequired: 0,
      marshalsRequired: 0,
      towVehicles: 0,
      roadClosure: "N/A",
      timeline: [],
    };
  }

  const score = Math.round(prediction.riskScore ?? prediction.severityScore ?? 0);
  const severity = getSeverityFromScore(score);
  const officersRequired = prediction.officers ?? 0;
  const barricadesRequired = prediction.barricades ?? 0;
  const towVehicles = prediction.towVehicles ?? 0;

  return {
    id: event.id || "N/A",
    name: event.eventName || "N/A",
    type:
      EVENT_TYPE_LABELS[event.eventType] ??
      "Emergency Gathering",
    cause:
      event.eventCause ??
      "General disruption",
    crowdSize: event.crowdSize ?? 0,
    location: event.location || "N/A",
    zone: inferZoneFromLocation(event.location),
    latitude: event.latitude ? Number(event.latitude) : 0,
    longitude: event.longitude ? Number(event.longitude) : 0,
    startTime: event.startTime ? event.startTime.toISOString() : new Date().toISOString(),
    endTime: event.endTime ? event.endTime.toISOString() : new Date().toISOString(),
    status:
      EVENT_STATUS_LABELS[event.status] ??
      "Scheduled",
    severity: severity || "N/A",
    congestionScore: score,
    delayMinutes: Math.max(
      8,
      Math.round(score * 0.42)
    ),
    impactRadius: `${(score / 24).toFixed(1)} km`,
    confidence: clamp(
      Math.round(
        prediction.severityScore ?? score
      ),
      70,
      97
    ),
    officersRequired,
    barricadesRequired,
    marshalsRequired: Math.max(
      2,
      Math.round(officersRequired * 0.3)
    ),
    towVehicles,
    roadClosure:
      prediction.closureScore >= 100
        ? "Primary corridor closure"
        : "Managed traffic flow",
    timeline: buildSyntheticTimeline(
      event,
      prediction
    ),
  };
}

export async function getEvents() {
  try {
    const dbEvents = await db.event.findMany({
      include: { prediction: true },
      orderBy: { startTime: "asc" },
    });
    
    if (dbEvents && dbEvents.length > 0) {
      return dbEvents.map(mapDbEventToUiEvent);
    }
  } catch (error) {
    console.error("Error fetching events from database:", error);
  }
  return [];
}

export async function getRecentEvents() {
  try {
    const dbEvents = await db.event.findMany({
      include: { prediction: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    if (dbEvents && dbEvents.length > 0) {
      return dbEvents.map(mapDbEventToUiEvent);
    }
  } catch (error) {
    console.error("Error fetching recent events from database:", error);
  }
  return [];
}

export async function getEventById(eventId) {
  try {
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { prediction: true },
    });
    if (event) {
      return mapDbEventToUiEvent(event);
    }
  } catch (error) {
    console.error(`Error fetching event by id ${eventId}:`, error);
  }
  return null;
}

export async function queryEvents({ search = "", type = "All", status = "All", page = 1, pageSize = 5 } = {}) {
  try {
    const dbEvents = await db.event.findMany({
      include: { prediction: true },
      orderBy: { startTime: "desc" }
    });

    const mapped = dbEvents.map(mapDbEventToUiEvent);

    const searchValue = search.trim().toLowerCase();
    const filtered = mapped.filter((event) => {
      const matchesSearch =
        !searchValue ||
        event.name.toLowerCase().includes(searchValue) ||
        event.location.toLowerCase().includes(searchValue) ||
        event.cause.toLowerCase().includes(searchValue);
      const matchesType = type === "All" || event.type === type;
      const matchesStatus = status === "All" || event.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });

    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
  } catch (error) {
    console.error("Error in queryEvents:", error);
    return {
      items: [],
      total: 0,
      page,
      pageSize,
      totalPages: 1,
    };
  }
}
