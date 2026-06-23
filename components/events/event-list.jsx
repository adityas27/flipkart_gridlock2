"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
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
import { getPendingReportsAction, verifyIncidentAction, deleteIncidentAction } from "@/actions/reports";
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

  const [result, setResult] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize: 5,
    totalPages: 1,
  });

  const [pendingReports, setPendingReports] = useState([]);
  const [verifyingId, setVerifyingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const deferredSearch =
    useDeferredValue(search);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const res = await queryEvents({
          search: deferredSearch,
          type,
          status,
          page,
          pageSize: 5,
        });
        if (active) {
          setResult(res ?? {
            items: [],
            total: 0,
            page: 1,
            pageSize: 5,
            totalPages: 1,
          });
        }
        
        const pendingRes = await getPendingReportsAction();
        if (active) {
          setPendingReports(pendingRes);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [
    deferredSearch,
    type,
    status,
    page,
  ]);

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

  async function handleVerify(id) {
    setVerifyingId(id);
    await verifyIncidentAction(id);
    const newPending = await getPendingReportsAction();
    setPendingReports(newPending);
    // Reload events to show the newly created event
    const res = await queryEvents({
      search: search,
      type,
      status,
      page,
      pageSize: 5,
    });
    setResult(res ?? result);
    setVerifyingId(null);
  }

  async function handleDelete(id) {
    setDeletingId(id);
    await deleteIncidentAction(id);
    const newPending = await getPendingReportsAction();
    setPendingReports(newPending);
    setDeletingId(null);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
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

      {pendingReports.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-500">Pending Citizen Reports</CardTitle>
            <CardDescription>
              These incident reports require commander verification to generate ML assessments and diversion routes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingReports.map(report => (
              <div key={report.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <div>
                  <h4 className="font-medium text-white">{report.title}</h4>
                  <p className="text-sm text-slate-400">{report.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>{report.location}</span>
                    <span>&bull;</span>
                    <span>{formatDateTime(report.submittedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => handleVerify(report.id)} 
                    disabled={verifyingId === report.id || deletingId === report.id}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {verifyingId === report.id ? "Verifying..." : "Verify & Assess"}
                  </Button>
                  <Button 
                    onClick={() => handleDelete(report.id)} 
                    disabled={verifyingId === report.id || deletingId === report.id}
                    variant="destructive"
                  >
                    {deletingId === report.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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