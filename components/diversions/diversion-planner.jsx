"use client";

import { useEffect, useState } from "react";

import { getDiversionRoutes } from "@/services/diversions";

import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function DiversionPlanner() {
  const [routes, setRoutes] = useState([]);

  const [selectedRoute, setSelectedRoute] =
    useState(null);

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  useEffect(() => {
    let active = true;
    async function loadRoutes() {
      try {
        const data = await getDiversionRoutes();
        if (active) {
          setRoutes(data ?? []);
          if (data && data.length > 0) {
            setSelectedRoute(data[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadRoutes();
    return () => {
      active = false;
    };
  }, []);

  function openRoute(route) {
    setSelectedRoute(route);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Route interventions"
        title="Diversion planning engine"
        description="Compare candidate routes, estimate delay savings, and inspect route-level operational notes before publishing a diversion plan."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {routes.length > 0 ? (
          routes.map((route) => (
          <Card
            key={route.id}
            className={
              route.rank === 1
                ? "border-emerald-400/20"
                : ""
            }
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {route.name}
                </CardTitle>

                <StatusBadge
                  status={route.status}
                />
              </div>

              <CardDescription>
                Rank #{route.rank} in current
                scenario.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info
                  label="Delay Reduction"
                  value={route.delayReduction}
                />

                <Info
                  label="Zone"
                  value={route.zone}
                />

                <Info
                  label="Confidence"
                  value={route.confidence}
                />
              </div>

              {/* <Button
                variant={
                  route.rank === 1
                    ? "default"
                    : "secondary"
                }
                className="w-full"
                onClick={() =>
                  openRoute(route)
                }
              >
                View route details
              </Button> */}
            </CardContent>
          </Card>
          ))
        ) : (
          <Card className="lg:col-span-3">
            <CardContent className="pt-6">
              <div className="rounded-2xl border border-white/10 bg-white/2 p-8 text-center text-slate-400">
                add data here
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Route Ranking
          </CardTitle>

          <CardDescription>
            Priority order for rollout based on
            current assumptions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {routes.length > 0 ? (
            routes.map((route) => (
            <div
              key={route.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/2 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-white">
                  {route.rank}. {route.name}
                </p>

                <p className="text-sm text-slate-400">
                  {route.notes}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge
                  status={route.status}
                />

                <Button
                  variant="ghost"
                  onClick={() =>
                    openRoute(route)
                  }
                >
                  Inspect
                </Button>
              </div>
            </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/2 p-8 text-center text-slate-400">
              add data here
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>
              {selectedRoute?.name}
            </SheetTitle>

            <SheetDescription>
              Detailed route notes,
              checkpoints, and mock rollout
              guidance.
            </SheetDescription>
          </SheetHeader>

          {selectedRoute ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard
                  label="Estimated Delay Reduction"
                  value={
                    selectedRoute.delayReduction
                  }
                />

                <InfoCard
                  label="Route Status"
                  value={
                    <StatusBadge
                      status={
                        selectedRoute.status
                      }
                    />
                  }
                />

                <InfoCard
                  label="Confidence"
                  value={
                    selectedRoute.confidence
                  }
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Checkpoints
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {selectedRoute.checkpoints.map(
                    (item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/2 px-4 py-3 text-sm text-slate-300"
                      >
                        {item}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Operational Notes
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-sm leading-6 text-slate-300">
                  {selectedRoute.notes}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/2 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-white">
        {value}
      </p>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/2 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>

      <div className="mt-2 text-sm text-white">
        {value}
      </div>
    </div>
  );
}