const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    
    // Check Event table
    const eventsRes = await client.query('SELECT COUNT(*) FROM "Event"');
    console.log(`Found ${eventsRes.rows[0].count} events in "Event" table.`);
    
    if (parseInt(eventsRes.rows[0].count) > 0) {
      const sampleEvents = await client.query('SELECT * FROM "Event" LIMIT 2');
      console.log("Sample Events:", JSON.stringify(sampleEvents.rows, null, 2));
    }
    
    // Check Prediction table
    const predictionsRes = await client.query('SELECT COUNT(*) FROM "Prediction"');
    console.log(`Found ${predictionsRes.rows[0].count} predictions in "Prediction" table.`);
    
    if (parseInt(predictionsRes.rows[0].count) > 0) {
      const samplePreds = await client.query('SELECT * FROM "Prediction" LIMIT 2');
      console.log("Sample Predictions:", JSON.stringify(samplePreds.rows, null, 2));
    }
    
  } catch (error) {
    console.error("Database query failed:", error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();
