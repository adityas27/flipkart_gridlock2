const { Client } = require('pg');
require('dotenv').config();

const citizenReports = [
  {
    id: "RPT-001",
    title: "Accident at MG Road",
    status: "Pending Verification",
    severity: "High",
    location: "MG Road Junction",
    submittedAt: new Date("2026-06-21T10:30:00Z"),
    affectedLanes: 2,
    progress: 2,
    description: "Multi-vehicle collision blocking two lanes.",
    estimatedPeople: 50,
    roadClosed: false,
  },
  {
    id: "RPT-002",
    title: "Vehicle Breakdown at Western Express Highway",
    status: "Active",
    severity: "Moderate",
    location: "Western Express Highway",
    submittedAt: new Date("2026-06-20T17:15:00Z"),
    affectedLanes: 1,
    progress: 4,
    description: "Broken down bus causing slow traffic.",
    estimatedPeople: 15,
    roadClosed: false,
  },
  {
    id: "RPT-003",
    title: "Spontaneous Protest at Azad Maidan",
    status: "Resolved",
    severity: "Critical",
    location: "Azad Maidan",
    submittedAt: new Date("2026-06-18T14:10:00Z"),
    affectedLanes: 4,
    progress: 5,
    description: "Protestors gathered on primary corridor, road closed.",
    estimatedPeople: 300,
    roadClosed: true,
  },
];

async function run() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database successfully.");

    // Delete existing test reports if any to avoid duplicates
    await client.query('DELETE FROM "IncidentReport" WHERE id IN (\'RPT-001\', \'RPT-002\', \'RPT-003\');');

    // Insert reports
    for (const report of citizenReports) {
      await client.query(
        `INSERT INTO "IncidentReport" (id, title, status, severity, location, "submittedAt", "affectedLanes", progress, description, "estimatedPeople", "roadClosed") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
        [
          report.id,
          report.title,
          report.status,
          report.severity,
          report.location,
          report.submittedAt,
          report.affectedLanes,
          report.progress,
          report.description,
          report.estimatedPeople,
          report.roadClosed,
        ]
      );
      console.log(`Inserted report: ${report.id}`);
    }

    console.log("Seeding completed successfully.");

  } catch (err) {
    console.error("Database seeding error:", err);
  } finally {
    await client.end();
  }
}

run();
