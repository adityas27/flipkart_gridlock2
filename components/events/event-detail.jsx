import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EventTimeline } from "@/components/events/event-timeline";

export function EventDetail({ event }) {
  const detailCards = [
    { label: "Crowd Size", value: formatNumber(event.crowdSize) },
    { label: "Congestion Score", value: event.congestionScore },
    { label: "Delay Estimate", value: `${event.delayMinutes} min` },
    { label: "Impact Radius", value: event.impactRadius },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={event.zone}
        title={event.name}
        description={`${event.type} caused by ${event.cause}. Coordinates ${event.latitude}, ${event.longitude}.`}
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link href="/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to list
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/events/${event.id}/edit`}>
                <PencilLine className="mr-2 h-4 w-4" />
                Edit event
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {detailCards.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-white">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Event Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Status" value={<StatusBadge status={event.status} />} />
            <DetailItem label="Severity" value={<StatusBadge status={event.severity} />} />
            <DetailItem label="Start Time" value={formatDateTime(event.startTime)} />
            <DetailItem label="End Time" value={formatDateTime(event.endTime)} />
            <DetailItem label="Location" value={event.location} />
            <DetailItem label="Road Closure" value={event.roadClosure} />
            <DetailItem label="Officers Required" value={event.officersRequired} />
            <DetailItem label="Barricades Required" value={event.barricadesRequired} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational Notes</CardTitle>
            <CardDescription>Mock planning outputs for frontend review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-6 text-slate-400">
            <p>Marshals planned: {event.marshalsRequired}. Tow vehicles staged: {event.towVehicles}.</p>
            <p>Confidence score for predicted impact is {event.confidence}% based on event type, zone, and closure assumptions.</p>
            <p>Recommended review order: route map, manpower allocation, barricade staging, and outbound traffic sequencing.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Timeline</CardTitle>
          <CardDescription>Key planning and monitoring checkpoints.</CardDescription>
        </CardHeader>
        <CardContent>
          <EventTimeline timeline={event.timeline} />
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/2 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <div className="mt-3 text-sm text-white">{value}</div>
    </div>
  );
}
