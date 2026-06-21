import { diversionRoutes } from "@/mock-data/routes";

export const mapEvents = [
  { id: "marker-1", name: "Central Avenue Rally", severity: "Critical", position: [12.9721, 77.5933], zone: "Central", status: "Active" },
  { id: "marker-2", name: "Riverfront Festival", severity: "High", position: [12.9807, 77.6161], zone: "East", status: "Scheduled" },
  { id: "marker-3", name: "West Stadium Match", severity: "Critical", position: [12.9664, 77.5601], zone: "West", status: "Scheduled" },
  { id: "marker-4", name: "South Link Repair", severity: "Moderate", position: [12.9315, 77.6148], zone: "South", status: "Monitoring" },
];

export const congestionZones = [
  { id: "zone-1", center: [12.9728, 77.5927], radius: 1450, severity: "Critical", label: "Central core spillover" },
  { id: "zone-2", center: [12.9798, 77.6171], radius: 1100, severity: "High", label: "Festival parking pressure" },
  { id: "zone-3", center: [12.9659, 77.5584], radius: 1650, severity: "Critical", label: "Stadium ingress ring" },
];

export const mapRoutes = diversionRoutes;
