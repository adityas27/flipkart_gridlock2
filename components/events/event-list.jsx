"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  PencilLine,
  Plus,
} from "lucide-react";

import {
  EVENT_STATUSES,
  EVENT_TYPES,
} from "@/types";

import { queryEvents } from "@/services/events";
import {
  formatDateTime,
  formatNumber,
} from "@/lib/utils";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DataTable } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";

export function EventList() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

  const deferredSearch =
    useDeferredValue(search);

  const result = useMemo(
    () =>
      queryEvents({
        search: deferredSearch,
        type,
        status,
        page,
        pageSize: 5,
      }),
    [
      deferredSearch,
      type,
      status,
      page,
    ]
  );

  function updateSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function updateType(value) {
    setType(value);
    setPage(1);
  }

  function updateStatus(value) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Operations registry"
        title="Event management"
        description="Review planned and live disruptions, refine deployment assumptions, and keep traffic control metadata organized."
        actions={
          <Button asChild>
            <Link href="/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Create event
            </Link>
          </Button>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={updateSearch}
        filters={
          <>
            <Select
              value={type}
              onValueChange={updateType}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="All">
                  All Types
                </SelectItem>

                {EVENT_TYPES.map((item) => (
                  <SelectItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={updateStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="All">
                  All Statuses
                </SelectItem>

                {EVENT_STATUSES.map(
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
          </>
        }
      />

      <Card>
        <CardHeader className="flex-row items-end justify-between">
          <div>
            <CardTitle>
              Event List
            </CardTitle>

            <CardDescription>
              {result.total} events match
              the current filters.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <DataTable
            rows={result.items}
            columns={[
              {
                key: "name",
                label: "Event",

                render: (row) => (
                  <div>
                    <Link
                      href={`/events/${row.id}`}
                      className="font-medium text-white hover:text-sky-300"
                    >
                      {row.name}
                    </Link>

                    <p className="text-xs text-slate-500">
                      {row.location}
                    </p>
                  </div>
                ),
              },

              {
                key: "type",
                label: "Type",
              },

              {
                key: "cause",
                label: "Cause",
              },

              {
                key: "crowdSize",
                label: "Crowd",

                render: (row) =>
                  formatNumber(
                    row.crowdSize
                  ),
              },

              {
                key: "startTime",
                label: "Start",

                render: (row) =>
                  formatDateTime(
                    row.startTime
                  ),
              },

              {
                key: "status",
                label: "Status",

                render: (row) => (
                  <StatusBadge
                    status={row.status}
                  />
                ),
              },

              {
                key: "actions",
                label: "Actions",

                render: (row) => (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link
                        href={`/events/${row.id}`}
                      >
                        View
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link
                        href={`/events/${row.id}/edit`}
                      >
                        <PencilLine className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                ),
              },
            ]}
          />

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              Page {result.page} of{" "}
              {result.totalPages}
            </p>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      1,
                      current - 1
                    )
                  )
                }
                disabled={page === 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      result.totalPages,
                      current + 1
                    )
                  )
                }
                disabled={
                  page ===
                  result.totalPages
                }
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}