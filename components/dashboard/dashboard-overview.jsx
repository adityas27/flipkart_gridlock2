import Link from "next/link";
import { AlertTriangle, Shield, Sparkles, TrafficCone, Waypoints } from "lucide-react";
import { getDashboardData } from "@/services/dashboard";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { MetricCard } from "@/components/shared/metric-card";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const metricIcons = {
  "Active Events": AlertTriangle,
  "High Risk Events": Shield,
  "Officers Required": TrafficCone,
  "Barricades Required": Waypoints,
  "Prediction Accuracy": Sparkles,
};

export async function DashboardOverview({ compact = false }) {
  const {
    dashboardMetrics,
    eventTypeSeries,
    severitySeries,
    zoneImpactSeries,
    recentEvents,
  } = await getDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Live overview"
        title="Command center dashboard"
        description="Track planned and unplanned event pressure, coordinate field deployment, and review route interventions from one control surface."
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link href="/predictor">Run Prediction</Link>
            </Button>
            <Button asChild>
              <Link href="/map">Open Traffic Map</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics
          .filter((metric) => metric.label !== "Prediction Accuracy")
          .map((metric) => (
            <MetricCard key={metric.id} label={metric.label} value={metric.value} trend={metric.trend} icon={metricIcons[metric.label]} />
          ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
            <CardDescription>Current operation mix by trigger category.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {eventTypeSeries.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-[#1C1F23]">
                  <div className="h-3 rounded-full bg-[#F59E0B]" style={{ width: `${item.value * 20}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Congestion Severity Distribution</CardTitle>
              <CardDescription>Live mix of monitored severity bands.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {severitySeries.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <div className="flex flex-1 items-center justify-between text-sm text-slate-300">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zone-wise Impact</CardTitle>
              <CardDescription>Relative pressure index by traffic zone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {zoneImpactSeries.map((item) => (
                <div key={item.zone} className="grid grid-cols-[72px_1fr_44px] items-center gap-3">
                  <span className="text-sm text-[#D1D5DB]">{item.zone}</span>
                  <div className="h-2 rounded-full bg-[#1C1F23]">
                    <div className="h-2 rounded-full bg-[#F97316]" style={{ width: `${item.impact}%` }} />
                  </div>
                  <span className="text-right text-sm text-white">{item.impact}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex-row items-end justify-between">
            <div>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Most recent activities across active corridors.</CardDescription>
            </div>
            {!compact ? (
              <Button variant="ghost" asChild>
                <Link href="/events">View all events</Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            <DataTable
              rows={recentEvents}
              columns={[
                { key: "name", label: "Event", render: (row) => <div><p className="font-medium text-white">{row.name}</p><p className="text-xs text-slate-500">{row.location}</p></div> },
                { key: "type", label: "Type" },
                { key: "startTime", label: "Window", render: (row) => formatDateTime(row.startTime) },
                { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
                { key: "crowdSize", label: "Crowd", render: (row) => formatNumber(row.crowdSize) },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump directly into common planning workflows.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild className="justify-start">
              <Link href="/events/create">Create new event record</Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/resources">Review manpower deployment</Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/diversions">Compare diversion routes</Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/map">Inspect geographic impact</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
