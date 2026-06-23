'use server';

import { generatePrediction as getPrediction } from "@/services/predictions";

export async function generatePredictionAction(formData) {
  try {
    return await getPrediction(formData);
  } catch (error) {
    console.error("Error in generatePredictionAction Server Action:", error);
    // Fallback response matching shape
    return {
      congestionScore: 0,
      severity: "N/A",
      delayMinutes: 0,
      impactRadius: "N/A",
      confidenceScore: "0%",
      explanation: ["Failed to get prediction from backend server."],
    };
  }
}
