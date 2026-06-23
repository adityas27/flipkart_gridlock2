const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to database successfully.");

    // Query incident reports
    const res = await client.query('SELECT * FROM "IncidentReport" ORDER BY "submittedAt" DESC LIMIT 10;');
    console.log("Found", res.rows.length, "Incident Reports:");
    console.log(JSON.stringify(res.rows, null, 2));

  } catch (err) {
    console.error("Database connection/query error:", err);
  } finally {
    await client.end();
  }
}

run();
