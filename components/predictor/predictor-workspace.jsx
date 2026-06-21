"use client";

import { startTransition, useState } from "react";

import { predictorDefaults } from "@/mock-data/predictions";
import { generatePrediction } from "@/services/predictions";
import { EVENT_TYPES } from "@/types";

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

import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";

const zones = [
  "Central",
  "West",
  "East",
  "South",
  "North",
];

const closures = [
  "None",
  "Partial lane closure",
  "Primary corridor closure",
  "One-way outbound",
  "Parking diversion",
];

export function PredictorWorkspace() {
  const [formData, setFormData] =
    useState(predictorDefaults);

  const [prediction, setPrediction] =
    useState(
      generatePrediction(
        predictorDefaults
      )
    );

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handlePredict(event) {
    event.preventDefault();

    startTransition(() => {
      setPrediction(
        generatePrediction(formData)
      );
    });
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Decision support"
        title="Event impact predictor"
        description="Model traffic stress, delay, and geographic spread using mock assumptions before approving field deployment."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              Prediction Inputs
            </CardTitle>

            <CardDescription>
              Frontend-only form using mock
              logic.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={handlePredict}
            >
              <Field label="Event Type">
                <Select
                  value={
                    formData.eventType
                  }
                  onValueChange={(
                    value
                  ) =>
                    updateField(
                      "eventType",
                      value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {EVENT_TYPES.map(
                      (item) => (
                        <SelectItem
                          key={item}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Event Cause">
                <Input
                  value={
                    formData.eventCause
                  }
                  onChange={(event) =>
                    updateField(
                      "eventCause",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Crowd Size">
                <Input
                  type="number"
                  value={
                    formData.crowdSize
                  }
                  onChange={(event) =>
                    updateField(
                      "crowdSize",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Duration (hours)">
                <Input
                  type="number"
                  value={
                    formData.duration
                  }
                  onChange={(event) =>
                    updateField(
                      "duration",
                      event.target.value
                    )
                  }
                />
              </Field>

              <Field label="Zone">
                <Select
                  value={formData.zone}
                  onValueChange={(
                    value
                  ) =>
                    updateField(
                      "zone",
                      value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {zones.map(
                      (item) => (
                        <SelectItem
                          key={item}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Road Closure">
                <Select
                  value={
                    formData.roadClosure
                  }
                  onValueChange={(
                    value
                  ) =>
                    updateField(
                      "roadClosure",
                      value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {closures.map(
                      (item) => (
                        <SelectItem
                          key={item}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </Field>

              <Button type="submit">
                Generate prediction
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <ResultCard
              label="Congestion Score"
              value={
                prediction.congestionScore
              }
            />

            <ResultCard
              label="Severity"
              value={
                <StatusBadge
                  status={
                    prediction.severity
                  }
                />
              }
            />

            <ResultCard
              label="Delay Minutes"
              value={
                prediction.delayMinutes
              }
            />

            <ResultCard
              label="Impact Radius"
              value={
                prediction.impactRadius
              }
            />

            <ResultCard
              label="Confidence"
              value={
                prediction.confidenceScore
              }
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Prediction Explanation
              </CardTitle>

              <CardDescription>
                Mock reasoning that will
                later be backed by actual
                model outputs.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {prediction.explanation.map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/2 p-4 text-sm leading-6 text-slate-300"
                  >
                    {item}
                  </div>
                )
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
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-300">
        {label}
      </span>

      {children}
    </label>
  );
}

function ResultCard({
  label,
  value,
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>
          {label}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="text-xl font-semibold text-white">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}