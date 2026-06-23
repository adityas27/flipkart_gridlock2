import { notFound } from "next/navigation";
import { EventForm } from "@/components/events/event-form";
import { getEventById } from "@/services/events";

export default async function EditEventPage({ params }) {
  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    notFound();
  }

  return <EventForm mode="edit" initialEvent={event} />;
}
