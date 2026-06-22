import "server-only";

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
  return [
    {
      label: "Event created",
      time: event.createdAt ?? event.startTime,
      detail: `Event record created for ${event.location}.`,
    },
    {
      label: prediction ? "Prediction attached" : "Monitoring initiated",
      time: prediction?.createdAt ?? event.startTime,
      detail: prediction
        ? `Risk category marked ${prediction.riskCategory} with officer recommendation generated.`
        : "Awaiting prediction details or manual operations review.",
    },
    {
      label: "Operational window",
      time: event.endTime,
      detail: `Event scheduled between ${event.startTime.toISOString()} and ${event.endTime.toISOString()}.`,
    },
  ];
}

function mapDbEventToUiEvent(event) {
  const prediction = event.prediction ?? null;
  const score = Math.round(
    prediction?.riskScore ??
      prediction?.severityScore ??
      clamp(event.crowdSize / 220, 24, 78)
  );
  const severity = getSeverityFromScore(score);
  const officersRequired =
    prediction?.officers ??
    Math.max(6, Math.round(score * 0.8));
  const barricadesRequired =
    prediction?.barricades ??
    Math.max(2, Math.round(score * 0.45));
  const towVehicles =
    prediction?.towVehicles ??
    Math.max(0, Math.round(score * 0.05));

  return {
    id: event.id,
    name: event.eventName,
    type:
      EVENT_TYPE_LABELS[event.eventType] ??
      "Emergency Gathering",
    cause:
      event.eventCause ??
      "General disruption",
    crowdSize: event.crowdSize,
    location: event.location,
    zone: inferZoneFromLocation(event.location),
    latitude: Number(event.latitude),
    longitude: Number(event.longitude),
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    status:
      EVENT_STATUS_LABELS[event.status] ??
      "Scheduled",
    severity,
    congestionScore: score,
    delayMinutes: Math.max(
      8,
      Math.round(score * 0.42)
    ),
    impactRadius: `${(score / 24).toFixed(1)} km`,
    confidence: clamp(
      Math.round(
        prediction?.severityScore ?? score
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
      prediction?.closureScore >= 100
        ? "Primary corridor closure"
        : "Managed traffic flow",
    timeline: buildSyntheticTimeline(
      event,
      prediction
    ),
  };
}

async function getEventsFromDatabase() {
  try {
    const dbEvents = await db.event.findMany({
      include: { prediction: true },
      orderBy: { startTime: "asc" },
    });

    return dbEvents.map(mapDbEventToUiEvent);
  } catch (error) {
    console.error(
      "Error fetching events from database:",
      error
    );
    return [];
  }
}

async function getRecentEventsFromDatabase(
  limit = 5
) {
  try {
    const dbEvents = await db.event.findMany({
      include: { prediction: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return dbEvents.map(mapDbEventToUiEvent);
  } catch (error) {
    console.error(
      "Error fetching recent events from database:",
      error
    );
    return [];
  }
}

function formatMetricValue(value) {
  return String(value);
}

function selectPriorityEvent(events) {
  return [...events].sort((a, b) => {
    if (a.status === "Active" && b.status !== "Active") return -1;
    if (b.status === "Active" && a.status !== "Active") return 1;
    return b.congestionScore - a.congestionScore;
  })[0];
}

function getOverviewDataFromEvents(events, recentEvents) {
  return {
    events,
    recentEvents,
    activeCount: events.filter((event) => event.status === "Active").length,
    criticalCount: events.filter((event) => event.severity === "Critical").length,
    totalOfficers: events.reduce((sum, event) => sum + (event.officersRequired || 0), 0),
    priorityEvent: selectPriorityEvent(events),
  };
}

function buildEventTypeSeries(events) {
  const buckets = {
    Political: 0,
    Festival: 0,
    Sports: 0,
    Construction: 0,
    Emergency: 0,
  };

  for (const event of events) {
    if (event.type === "Political Rally") buckets.Political += 1;
    else if (event.type === "Festival") buckets.Festival += 1;
    else if (event.type === "Sports Event") buckets.Sports += 1;
    else if (event.type === "Construction") buckets.Construction += 1;
    else buckets.Emergency += 1;
  }

  return [
    { label: "Political", value: buckets.Political },
    { label: "Festival", value: buckets.Festival },
    { label: "Sports", value: buckets.Sports },
    { label: "Construction", value: buckets.Construction },
    { label: "Emergency", value: buckets.Emergency },
  ];
}

function buildSeveritySeries(events) {
  const buckets = {
    Critical: 0,
    High: 0,
    Moderate: 0,
    Low: 0,
  };

  for (const event of events) {
    if (buckets[event.severity] !== undefined) {
      buckets[event.severity] += 1;
    }
  }

  return [
    { label: "Critical", value: buckets.Critical, color: "bg-rose-500" },
    { label: "High", value: buckets.High, color: "bg-amber-500" },
    { label: "Moderate", value: buckets.Moderate, color: "bg-sky-500" },
    { label: "Low", value: buckets.Low, color: "bg-emerald-500" },
  ];
}

function buildZoneImpactSeries(events) {
  const buckets = {
    Central: 0,
    West: 0,
    East: 0,
    South: 0,
    North: 0,
  };

  for (const event of events) {
    const zone = event.zone ?? "Central";

    if (buckets[zone] !== undefined) {
      buckets[zone] += event.congestionScore ?? 0;
    }
  }

  return [
    { zone: "Central", impact: buckets.Central },
    { zone: "West", impact: buckets.West },
    { zone: "East", impact: buckets.East },
    { zone: "South", impact: buckets.South },
    { zone: "North", impact: buckets.North },
  ];
}

function buildDashboardMetrics(events) {
  const activeEvents = events.filter((event) => event.status === "Active").length;
  const highRiskEvents = events.filter((event) => ["High", "Critical"].includes(event.severity)).length;
  const totalOfficers = events.reduce((sum, event) => sum + (event.officersRequired || 0), 0);
  const totalBarricades = events.reduce((sum, event) => sum + (event.barricadesRequired || 0), 0);

  return [
    {
      id: "active-events",
      label: "Active Events",
      value: formatMetricValue(activeEvents),
      trend: `${activeEvents} currently ongoing`,
    },
    {
      id: "high-risk",
      label: "High Risk Events",
      value: formatMetricValue(highRiskEvents),
      trend: `${events.filter((event) => event.severity === "Critical").length} critical corridors`,
    },
    {
      id: "officers",
      label: "Officers Required",
      value: String(totalOfficers),
      trend: "Derived from saved predictions",
    },
    {
      id: "barricades",
      label: "Barricades Required",
      value: String(totalBarricades),
      trend: "Derived from saved predictions",
    },
    {
      id: "accuracy",
      label: "Prediction Accuracy",
      value: "NA",
      trend: "Not available from backend",
    },
  ];
}

function getEmptyOverviewData() {
  return {
    events: [],
    recentEvents: [],
    activeCount: 0,
    criticalCount: 0,
    totalOfficers: 0,
    priorityEvent: null,
  };
}

function getEmptyDashboardData() {
  return {
    dashboardMetrics: [
      {
        id: "active-events",
        label: "Active Events",
        value: "0",
        trend: "NA",
      },
      {
        id: "high-risk",
        label: "High Risk Events",
        value: "0",
        trend: "NA",
      },
      {
        id: "officers",
        label: "Officers Required",
        value: "0",
        trend: "NA",
      },
      {
        id: "barricades",
        label: "Barricades Required",
        value: "0",
        trend: "NA",
      },
      {
        id: "accuracy",
        label: "Prediction Accuracy",
        value: "NA",
        trend: "Not available from backend",
      },
    ],
    eventTypeSeries: [
      { label: "Political", value: 0 },
      { label: "Festival", value: 0 },
      { label: "Sports", value: 0 },
      { label: "Construction", value: 0 },
      { label: "Emergency", value: 0 },
    ],
    severitySeries: [
      { label: "Critical", value: 0, color: "bg-rose-500" },
      { label: "High", value: 0, color: "bg-amber-500" },
      { label: "Moderate", value: 0, color: "bg-sky-500" },
      { label: "Low", value: 0, color: "bg-emerald-500" },
    ],
    zoneImpactSeries: [
      { zone: "Central", impact: 0 },
      { zone: "West", impact: 0 },
      { zone: "East", impact: 0 },
      { zone: "South", impact: 0 },
      { zone: "North", impact: 0 },
    ],
    recentEvents: [],
  };
}

export async function getOverviewData() {
  const [dbEvents, recentDbEvents] = await Promise.all([
    getEventsFromDatabase(),
    getRecentEventsFromDatabase(4),
  ]);

  if (dbEvents.length) {
    return getOverviewDataFromEvents(dbEvents, recentDbEvents.length ? recentDbEvents : dbEvents.slice(0, 4));
  }

  return getEmptyOverviewData();
}

export async function getDashboardData() {
  const recentDbEvents = await getRecentEventsFromDatabase(5);
  const dbEvents = await getEventsFromDatabase();

  if (dbEvents.length) {
    return {
      dashboardMetrics: buildDashboardMetrics(dbEvents),
      eventTypeSeries: buildEventTypeSeries(dbEvents),
      severitySeries: buildSeveritySeries(dbEvents),
      zoneImpactSeries: buildZoneImpactSeries(dbEvents),
      recentEvents: recentDbEvents.length ? recentDbEvents : dbEvents.slice(0, 5),
    };
  }

  return getEmptyDashboardData();
}
