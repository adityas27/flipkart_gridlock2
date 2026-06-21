import { getResourcePlan } from "@/services/resources";
import { SectionHeader } from "@/components/shared/section-header";
import { MetricCard } from "@/components/shared/metric-card";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ResourcePlanner() {
  const plan = getResourcePlan();
  const summaryCards = [
    { label: "Officers Required", value: plan.summary.officersRequired, trend: `${plan.summary.utilization} utilization` },
    { label: "Traffic Marshals", value: plan.summary.trafficMarshals, trend: `${plan.summary.readiness} readiness` },
    { label: "Barricades", value: plan.summary.barricades, trend: "2 reusable clusters" },
    { label: "Tow Vehicles", value: plan.summary.towVehicles, trend: "1 floating reserve" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Field operations"
        title="Resource recommendation engine"
        description="Mock allocation view for manpower, marshals, barricades, and towing support across the city response grid."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} trend={item.trend} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Table</CardTitle>
          <CardDescription>Shift-by-shift resource placement across zones.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            rows={plan.table}
            columns={[
              { key: "zone", label: "Zone" },
              { key: "shift", label: "Shift" },
              { key: "officers", label: "Officers" },
              { key: "marshals", label: "Marshals" },
              { key: "barricades", label: "Barricades" },
              { key: "towVehicles", label: "Tow Vehicles" },
              { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Suggestions</CardTitle>
          <CardDescription>Mock recommendations to tighten staffing efficiency.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {plan.suggestions.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/2 p-4 text-sm leading-6 text-slate-300">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
