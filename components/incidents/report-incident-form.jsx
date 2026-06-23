"use client";

import { useState } from "react";
import { AlertTriangle, Camera, MapPin, ShieldAlert } from "lucide-react";

import { SectionHeader } from "@/components/shared/section-header";
import { submitReportAction } from "@/actions/reports";

import { Button } from "@/components/ui/button";

import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";

const INCIDENT_TYPES = [
"Accident",
"Vehicle Breakdown",
"Road Blockage",
"Spontaneous Protest",
"Emergency Gathering",
"Flooding",
"Construction Hazard",
"Tree Fall",
"VIP Movement",
"Other",
];

export default function ReportIncidentForm() {
const [formData, setFormData] = useState({
incidentType: "Accident",
location: "",
description: "",
estimatedPeople: "",
blockedLanes: "1",
roadClosed: false,
image: null,
});

const [submitted, setSubmitted] = useState(null);
const [isPending, setIsPending] = useState(false);
const [error, setError] = useState(null);

function updateField(field, value) {
setFormData((current) => ({
...current,
[field]: value,
}));
}

function handleSubmit(event) {
event.preventDefault();
setIsPending(true);
setError(null);

submitReportAction(formData)
  .then((res) => {
    if (res.success) {
      setSubmitted({
        source: "Citizen",
        status: "Pending Verification",
        ...formData,
        reportedAt: new Date().toISOString(),
      });
    } else {
      setError(res.error || "Failed to submit report.");
    }
  })
  .catch((err) => {
    console.error(err);
    setError("An unexpected error occurred during submission.");
  })
  .finally(() => {
    setIsPending(false);
  });
}

return ( 

<div className="mx-auto w-full max-w-6xl py-10 md:py-12 space-y-8">
  <SectionHeader
     eyebrow="Citizen Reporting"
     title="Report Traffic Incident"
     description="Help authorities identify disruptions early. Reports are reviewed before becoming active traffic alerts."
   />

  <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
    <Card>
      <CardHeader>
        <CardTitle>Incident Details</CardTitle>
        <CardDescription>
          Submit information about an ongoing traffic disruption.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Incident Type
            </label>

            <Select
              value={formData.incidentType}
              onValueChange={(value) =>
                updateField(
                  "incidentType",
                  value
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {INCIDENT_TYPES.map((item) => (
                  <SelectItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Location
            </label>

            <Input
              placeholder="MG Road Junction"
              value={formData.location}
              onChange={(event) =>
                updateField(
                  "location",
                  event.target.value
                )
              }
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description
            </label>

            <Textarea
              rows={5}
              placeholder="Describe what happened..."
              value={formData.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Estimated People Affected
              </label>

              <Input
                type="number"
                value={formData.estimatedPeople}
                onChange={(event) =>
                  updateField(
                    "estimatedPeople",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Blocked Lanes
              </label>

              <Input
                type="number"
                value={formData.blockedLanes}
                onChange={(event) =>
                  updateField(
                    "blockedLanes",
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="font-medium">
                Road Completely Closed
              </p>

              <p className="text-sm text-muted-foreground">
                Enable if traffic cannot pass.
              </p>
            </div>

            <Switch
              checked={formData.roadClosed}
              onCheckedChange={(value) =>
                updateField(
                  "roadClosed",
                  value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Photo Evidence
            </label>

            <Input
              type="file"
              accept="image/*"
              onChange={(event) =>
                updateField(
                  "image",
                  event.target.files?.[0] ??
                    null
                )
              }
            />
          </div>

          <Button
            type="submit"
            className="w-full"
          >
            Submit Incident Report
          </Button>
        </form>
      </CardContent>
    </Card>

    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Report Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <SummaryItem
            icon={AlertTriangle}
            label="Incident"
            value={formData.incidentType}
          />

          <SummaryItem
            icon={MapPin}
            label="Location"
            value={
              formData.location ||
              "Not specified"
            }
          />

          <SummaryItem
            icon={ShieldAlert}
            label="Status"
            value="Pending Verification"
          />

          <SummaryItem
            icon={Camera}
            label="Photo"
            value={
              formData.image
                ? formData.image.name
                : "Not attached"
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            What Happens Next?
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Step text="Report submitted by citizen" />
          <Step text="ML impact assessment generated" />
          <Step text="Traffic officer verification" />
          <Step text="Resource deployment recommendation" />
          <Step text="Live alert published" />
        </CardContent>
      </Card>

      {submitted ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Submission Preview
            </CardTitle>
          </CardHeader>

          <CardContent>
            <pre className="overflow-auto rounded-xl bg-black/20 p-4 text-xs">
              {JSON.stringify(
                submitted,
                null,
                2
              )}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  </div>
</div>
);
}

function SummaryItem({
icon: Icon,
label,
value,
}) {
    return ( 
    <div className="flex items-center gap-3"> 
        <Icon className="h-4 w-4 text-[#F59E0B]" /> 
        <div> 
            <p className="text-xs text-muted-foreground">
                {label} 
            </p> 
            <p className="font-medium">
                {value} 
                </p> 
        </div> 
    </div>
    );
}

function Step({ text }) {
    return ( 
        <div className="rounded-xl border p-3 text-sm">
            {text} 
        </div>
    );
}
