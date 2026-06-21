"use client";

import Link from "next/link";
import { startTransition, useState } from "react";

import { EVENT_STATUSES, EVENT_TYPES } from "@/types";
import { getDurationHours } from "@/lib/utils";

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

  const [submissionState, setSubmissionState] =
    useState(null);

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    startTransition(() => {
      setSubmissionState({
        message:
          mode === "edit"
            ? "Mock update prepared for review."
            : "Mock event created for frontend preview.",

        payload: {
          ...formState,

          durationHours: getDurationHours(
            formState.startTime,
            formState.endTime
          ),
        },
      });
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
              Use mock submission flow until backend
              APIs are approved.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={handleSubmit}
            >
              <Field label="Event Name">
                <Input
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
              </Field>

              <Field label="Event Cause">
                <Input
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
              </Field>

              <div className="flex flex-wrap gap-3 pt-2 md:col-span-2">
                <Button type="submit">
                  {mode === "edit"
                    ? "Save mock changes"
                    : "Generate mock event"}
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
                  <p className="text-emerald-300">
                    {submissionState.message}
                  </p>

                  <pre className="overflow-x-auto rounded-2xl bg-slate-900/80 p-4 text-xs text-slate-300">
                    {JSON.stringify(
                      submissionState.payload,
                      null,
                      2
                    )}
                  </pre>
                </>
              ) : (
                <p>
                  Submit the form to see the
                  mock payload that would later
                  be sent to the backend.
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