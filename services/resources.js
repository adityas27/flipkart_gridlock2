import { deploymentTable, optimizationSuggestions, resourceSummary } from "@/mock-data/resources";

export function getResourcePlan() {
  return {
    summary: resourceSummary,
    table: deploymentTable,
    suggestions: optimizationSuggestions,
  };
}
