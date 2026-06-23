import { notFound } from "next/navigation";
import { EventDetail } from "@/components/events/event-detail";
import { getEventById } from "@/services/events";

export default async function EventDetailPage({ params }) {
  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  return <EventDetail event={event} />;
}
