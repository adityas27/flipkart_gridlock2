export const predictorDefaults = {
  eventType: "Political Rally",
  eventCause: "Campaign Roadshow",
  crowdSize: 18000,
  duration: 5,
  zone: "Central",
  roadClosure: "Primary corridor closure",
};

export const samplePrediction = {
  congestionScore: 87,
  severity: "High",
  delayMinutes: 37,
  impactRadius: "3.9 km",
  confidenceScore: "92%",
  explanation: [
    "Large crowd size and primary road closure combine to raise corridor saturation during the first 90 minutes.",
    "Central zone historically shows the strongest spillover into bus priority lanes and adjacent market links.",
    "Delay can be reduced if entry gates are staggered and outbound traffic is split across two diversion corridors.",
  ],
};
