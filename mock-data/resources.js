export const resourceSummary = {
  officersRequired: 122,
  trafficMarshals: 36,
  barricades: 74,
  towVehicles: 7,
  utilization: "82%",
  readiness: "High",
};

export const deploymentTable = [
  { zone: "Central", shift: "06:00 - 12:00", officers: 32, marshals: 10, barricades: 18, towVehicles: 2, status: "Assigned" },
  { zone: "West", shift: "12:00 - 18:00", officers: 28, marshals: 8, barricades: 16, towVehicles: 2, status: "Assigned" },
  { zone: "East", shift: "14:00 - 22:00", officers: 24, marshals: 7, barricades: 14, towVehicles: 1, status: "Queued" },
  { zone: "South", shift: "20:00 - 04:00", officers: 18, marshals: 5, barricades: 12, towVehicles: 1, status: "Monitoring" },
  { zone: "North", shift: "05:00 - 11:00", officers: 20, marshals: 6, barricades: 14, towVehicles: 1, status: "Reserved" },
];

export const optimizationSuggestions = [
  "Shift 8 officers from South overnight coverage to Central pre-event staging between 07:00 and 10:00.",
  "Reuse barricade cluster B-14 from bridge repair once compliance audit closes at 05:30.",
  "Pre-stage tow vehicles near West Stadium exits to reduce post-event clearance time by an estimated 11 minutes.",
];
