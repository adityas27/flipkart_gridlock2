"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { citizenReports } from "@/mock-data/reports";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SectionHeader } from "@/components/shared/section-header";

const STATUSES = [
  "All",
  "Pending Verification",
  "Active",
  "Monitoring",
  "Resolved",
];

const STEPS = [
  "Submitted",
  "ML Assessment",
  "Officer Verification",
  "Resource Deployment",
  "Resolved",
];

export function MyReports() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const reports = useMemo(() => {
    return citizenReports.filter((report) => {
      const matchesSearch =
        report.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        report.location
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "All" || report.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const stats = {
    total: citizenReports.length,
    pending: citizenReports.filter(
      (r) => r.status === "Pending Verification"
    ).length,
    active: citizenReports.filter(
      (r) => r.status === "Active"
    ).length,
    resolved: citizenReports.filter(
      (r) => r.status === "Resolved"
    ).length,
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 py-10">
      <SectionHeader
        eyebrow="Citizen Portal"
        title="My Reports"
        description="Track the status of incidents you have submitted."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Reports"
          value={stats.total}
        />

        <StatCard
          title="Pending Verification"
          value={stats.pending}
        />

        <StatCard
          title="Active"
          value={stats.active}
        />

        <StatCard
          title="Resolved"
          value={stats.resolved}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search reports..."
              className="pl-10"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUSES.map((item) => (
              <Button
                key={item}
                variant={
                  status === item
                    ? "default"
                    : "outline"
                }
                onClick={() => setStatus(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>
                    {report.title}
                  </CardTitle>

                  <CardDescription>
                    {report.id}
                  </CardDescription>
                </div>

                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    value={report.status}
                  />

                  <SeverityBadge
                    value={report.severity}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-3 md:grid-cols-3">
                <InfoItem
                  icon={MapPin}
                  label="Location"
                  value={report.location}
                />

                <InfoItem
                  icon={Clock}
                  label="Submitted"
                  value={report.submittedAt}
                />

                <InfoItem
                  icon={AlertTriangle}
                  label="Affected Lanes"
                  value={String(
                    report.affectedLanes
                  )}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-white">
                  Progress
                </p>

                <div className="grid gap-3 md:grid-cols-5">
                  {STEPS.map((step, index) => {
                    const completed =
                      index < report.progress;

                    return (
                      <div
                        key={step}
                        className="flex items-center gap-2 rounded-xl border border-[#343A40] bg-[#1C1F23] px-3 py-3"
                      >
                        <CheckCircle2
                          className={`h-4 w-4 ${
                            completed
                              ? "text-[#F59E0B]"
                              : "text-[#6B7280]"
                          }`}
                        />

                        <span className="text-xs text-[#D1D5DB]">
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="secondary">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          {title}
        </CardDescription>

        <CardTitle className="text-3xl">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#343A40] bg-[#1C1F23] p-4">
      <Icon className="h-4 w-4 text-[#F59E0B]" />

      <div>
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="text-sm font-medium text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  const styles = {
    "Pending Verification":
      "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    Active:
      "bg-orange-500/15 text-orange-400 border-orange-500/30",
    Monitoring:
      "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Resolved:
      "bg-green-500/15 text-green-400 border-green-500/30",
  };

  return (
    <Badge
      variant="outline"
      className={styles[value]}
    >
      {value}
    </Badge>
  );
}

function SeverityBadge({ value }) {
  const styles = {
    Low: "bg-green-500/15 text-green-400 border-green-500/30",
    Moderate:
      "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    High:
      "bg-orange-500/15 text-orange-400 border-orange-500/30",
    Critical:
      "bg-red-500/15 text-red-400 border-red-500/30",
  };

  return (
    <Badge
      variant="outline"
      className={styles[value]}
    >
      {value}
    </Badge>
  );
}