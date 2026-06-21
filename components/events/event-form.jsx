"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";

import { EVENT_STATUSES, EVENT_TYPES } from "@/types";
import { getDurationHours } from "@/lib/utils";
import { createEvent } from "@/actions/events";

import { SectionHeader } from "@/components/shared/section-header";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const defaultState = {
  name: "",
  type: "Festival",
  cause: "",
  crowdSize: 0,
  location: "",
  latitude: "12.9716",
  longitude: "77.5946",
  startTime: "2026-06-26T09:00",
  endTime: "2026-06-26T14:00",
  status: "Scheduled",
};

export function EventForm({
  mode = "create",
  initialEvent,
}) {
  const [formState, setFormState] = useState(
    initialEvent
      ? mapEventToForm(initialEvent)
      : defaultState
  );

  const [submissionState, formAction, pending] = useActionState(
    createEvent,
    null
  );

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={
          mode === "edit"
            ? "Event maintenance"
            : "New event"
        }
        title={
          mode === "edit"
            ? "Edit event"
            : "Create event"
        }
        description="This form is frontend-only for now. It captures the exact fields needed for the later backend and planning pipeline."
        actions={
          <Button
            variant="secondary"
            asChild
          >
            <Link href="/events">
              Back to events
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              Event Information
            </CardTitle>

            <CardDescription>
              Submit this form to store the event in Supabase through Prisma.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={handleSubmit}
            >
              <Field label="Event Name">
                <Input
                  name="eventName"
                  value={formState.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  required
                />
              </Field>

              <Field label="Event Type">
                <Select
                  value={formState.type}
                  onValueChange={(value) =>
                    updateField("type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="eventType" value={formState.type} />
              </Field>

              <Field label="Event Cause">
                <Input
                  name="eventCause"
                  value={formState.cause}
                  onChange={(event) =>
                    updateField(
                      "cause",
                      event.target.value
                    )
                  }
                  required
                />
              </Field>

              <Field label="Crowd Size">
                <Input
                  name="crowdSize"
                  type="number"
                  min="0"
                  value={formState.crowdSize}
                  onChange={(event) =>
                    updateField(
                      "crowdSize",
                      event.target.value
                    )
                  }
                  required
                />
              </Field>

              <Field
                label="Location"
                className="md:col-span-2"
              >
                <Input
                  name="location"
                  value={formState.location}
                  onChange={(event) =>
                    updateField(
                      "location",
                      event.target.value
                    )
                  }
                  required
                />
              </Field>

              <Field label="Latitude">
                <Input
                  name="latitude"
                  value={formState.latitude}
                  onChange={(event) =>
                    updateField(
                      "latitude",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Longitude">
                <Input
                  name="longitude"
                  value={formState.longitude}
                  onChange={(event) =>
                    updateField(
                      "longitude",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Start Time">
                <Input
                  name="startTime"
                  type="datetime-local"
                  value={formState.startTime}
                  onChange={(event) =>
                    updateField(
                      "startTime",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="End Time">
                <Input
                  name="endTime"
                  type="datetime-local"
                  value={formState.endTime}
                  onChange={(event) =>
                    updateField(
                      "endTime",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Status">
                <Select
                  value={formState.status}
                  onValueChange={(value) =>
                    updateField("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {EVENT_STATUSES.map(
                      (status) => (
                        <SelectItem
                          key={status}
                          value={status}
                        >
                          {status}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <input type="hidden" name="status" value={formState.status} />
              </Field>

              <div className="flex flex-wrap gap-3 pt-2 md:col-span-2">
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving..." : mode === "edit"
                    ? "Save event"
                    : "Create event"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  asChild
                >
                  <Link href="/events">
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Live Preview
              </CardTitle>

              <CardDescription>
                Instant summary of the current form
                state.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-slate-300">
              <PreviewRow label="Event">
                {formState.name ||
                  "Untitled event"}
              </PreviewRow>

              <PreviewRow label="Type">
                {formState.type}
              </PreviewRow>

              <PreviewRow label="Cause">
                {formState.cause || "Pending"}
              </PreviewRow>

              <PreviewRow label="Duration">
                {getDurationHours(
                  formState.startTime,
                  formState.endTime
                )}{" "}
                hours
              </PreviewRow>

              <PreviewRow label="Coordinates">
                {`${formState.latitude}, ${formState.longitude}`}
              </PreviewRow>

              <PreviewRow label="Status">
                {formState.status}
              </PreviewRow>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Submission Response
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm text-slate-400">
              {submissionState ? (
                <>
                  <p className={submissionState.success ? "text-emerald-300 font-semibold" : "text-rose-300"}>
                    {submissionState.success ? "Event saved and predictions generated." : submissionState.error}
                  </p>
                  {submissionState.success && submissionState.prediction && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/2 p-4 space-y-2 text-white">
                      <p className="font-semibold text-sky-300">Model Predictions:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Risk Category: <span className="font-medium text-amber-300">{submissionState.prediction.riskCategory}</span></div>
                        <div>Risk Score: <span className="font-medium text-amber-300">{submissionState.prediction.riskScore}</span></div>
                        <div>Severity Score: <span className="font-medium">{submissionState.prediction.severityScore}</span></div>
                        <div>Traffic Score: <span className="font-medium">{submissionState.prediction.trafficScore}</span></div>
                      </div>
                      <p className="font-semibold text-sky-300 pt-2">Recommended Resources:</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>Officers: <span className="font-medium text-emerald-300">{submissionState.prediction.officers}</span></div>
                        <div>Barricades: <span className="font-medium text-emerald-300">{submissionState.prediction.barricades}</span></div>
                        <div>Tow Vehicles: <span className="font-medium text-emerald-300">{submissionState.prediction.towVehicles}</span></div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p>
                  Submit the form to store the event in the database.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-sm font-medium text-slate-300">
        {label}
      </span>

      {children}
    </label>
  );
}

function PreviewRow({
  label,
  children,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/2 px-4 py-3">
      <span className="text-slate-500">
        {label}
      </span>

      <span className="text-right text-white">
        {children}
      </span>
    </div>
  );
}

function mapEventToForm(event) {
  return {
    name: event.name,
    type: event.type,
    cause: event.cause,
    crowdSize: event.crowdSize,
    location: event.location,
    latitude: String(event.latitude),
    longitude: String(event.longitude),
    startTime: event.startTime.slice(0, 16),
    endTime: event.endTime.slice(0, 16),
    status: event.status,
  };
}
