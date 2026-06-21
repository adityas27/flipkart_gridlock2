import { samplePrediction } from "@/mock-data/predictions";

export function generatePrediction(formData) {
  const crowdWeight = Math.min(35, Math.round(Number(formData.crowdSize || 0) / 700));
  const durationWeight = Math.min(18, Number(formData.duration || 0) * 2);
  const closureWeight = formData.roadClosure && formData.roadClosure !== "None" ? 14 : 4;
  const zoneWeight = formData.zone === "Central" || formData.zone === "West" ? 16 : 10;
  const score = Math.min(98, 24 + crowdWeight + durationWeight + closureWeight + zoneWeight);

  let severity = "Moderate";
  if (score >= 85) severity = "Critical";
  else if (score >= 70) severity = "High";
  else if (score < 50) severity = "Low";

  return {
    congestionScore: score,
    severity,
    delayMinutes: Math.max(8, Math.round(score * 0.42)),
    impactRadius: `${(score / 24).toFixed(1)} km`,
    confidenceScore: `${Math.min(97, score + 5)}%`,
    explanation: samplePrediction.explanation,
  };
}
