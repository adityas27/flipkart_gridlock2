import Link from "next/link";
import { AlertTriangle, ArrowRight, ShieldCheck, Siren, TrafficCone } from "lucide-react";
import { getEvents, getRecentEvents } from "@/services/events";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";

export function OverviewHome() {
  const events = getEvents();
  const activeCount = events.filter((event) => event.status === "Active").length;
  const criticalCount = events.filter((event) => event.severity === "Critical").length;
  const totalOfficers = events.reduce((sum, event) => sum + event.officersRequired, 0);
  const recentEvents = getRecentEvents().slice(0, 4);
  const priorityEvent = events[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="System overview"
        title="Traffic operations overview"
        description="Start here for a quick operational readout before moving into the full dashboard, event workflows, or route planning modules."
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/events">Review events</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardDescription>Priority alert</CardDescription>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Siren className="h-6 w-6 text-[#EF4444]" />
              {priorityEvent.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={priorityEvent.status} />
              <StatusBadge status={priorityEvent.severity} />
              <span className="text-sm text-[#A1A7B3]">{priorityEvent.location}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat label="Delay" value={`${priorityEvent.delayMinutes} min`} icon={AlertTriangle} />
              <MiniStat label="Officers" value={formatNumber(priorityEvent.officersRequired)} icon={ShieldCheck} />
              <MiniStat label="Barricades" value={formatNumber(priorityEvent.barricadesRequired)} icon={TrafficCone} />
            </div>
            <div className="rounded-2xl border border-[#343A40] bg-[#1C1F23] p-4 text-sm leading-6 text-[#A1A7B3]">
              Congestion score is {priorityEvent.congestionScore} with an estimated impact radius of {priorityEvent.impactRadius}. Use this event as the current reference point for deployment and diversion planning.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Control summary</CardTitle>
            <CardDescription>Current network posture across active operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SummaryRow label="Active events" value={String(activeCount).padStart(2, "0")} />
            <SummaryRow label="Critical alerts" value={String(criticalCount).padStart(2, "0")} />
            <SummaryRow label="Officer demand" value={formatNumber(totalOfficers)} />
            <SummaryRow label="Live map layers" value="Routes + zones" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recommended next actions</CardTitle>
            <CardDescription>Fastest path through the command workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ActionLink href="/predictor" title="Run congestion predictor" description="Validate expected traffic pressure before publishing resources." />
            <ActionLink href="/resources" title="Check manpower deployment" description="Review officer, marshal, and barricade allocation." />
            <ActionLink href="/diversions" title="Compare diversion options" description="Inspect ranked route alternatives and delay reduction." />
            <ActionLink href="/map" title="Open traffic map" description="Verify the geographic spread of alerts and overlays." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent event feed</CardTitle>
            <CardDescription>Latest records requiring operator awareness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex flex-col gap-3 rounded-2xl border border-[#343A40] bg-[#1C1F23] p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{event.name}</p>
                  <p className="text-sm text-[#7A818D]">{event.location}</p>
                  <p className="mt-1 text-xs text-[#A1A7B3]">{formatDateTime(event.startTime)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={event.status} />
                  <StatusBadge status={event.severity} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#343A40] bg-[#1C1F23] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-[#7A818D]">{label}</p>
        <Icon className="h-4 w-4 text-[#F59E0B]" />
      </div>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#343A40] bg-[#1C1F23] px-4 py-3">
      <span className="text-sm text-[#A1A7B3]">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function ActionLink({ href, title, description }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-2xl border border-[#343A40] bg-[#1C1F23] px-4 py-4 transition-colors hover:bg-[#22262B]">
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="mt-1 text-sm text-[#A1A7B3]">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#F59E0B]" />
    </Link>
  );
}
