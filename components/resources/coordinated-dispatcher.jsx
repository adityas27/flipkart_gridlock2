"use client";

import { useState } from "react";
import { coordinateResourcesAction } from "@/actions/resources";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export function CoordinatedDispatcher({ initialTable }) {
  const [coordinatedTable, setCoordinatedTable] = useState(null);
  const [reasoning, setReasoning] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleCoordinate() {
    setIsPending(true);
    setError(null);
    try {
      const res = await coordinateResourcesAction();
      if (res && res.success) {
        setCoordinatedTable(res.coordinatedTable);
        setReasoning(res.reasoning);
      } else {
        setError(res?.error || "Failed to coordinate resources.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred during resource coordination.");
    } finally {
      setIsPending(false);
    }
  }

  // Calculate current total officers requested from initial table
  const totalRequestedOfficers = initialTable?.reduce((sum, row) => sum + (row.officers || 0), 0) || 0;
  const isOverCapacity = totalRequestedOfficers > 150;

  return (
    <Card className="border-amber-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOverCapacity ? (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-[#34d399]" />
          )}
          Multi-Event Resource Coordination
        </CardTitle>
        <CardDescription>
          Resolve staging conflicts when events request more manpower than the global city pool (150 Officers, 100 Barricades).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-white/5 bg-[#1C1F23] p-4 text-sm text-slate-300">
          <p>
            <span className="font-semibold text-white">Global Pool Capacity:</span> 150 Officers, 100 Barricades, 20 Tow Vehicles
          </p>
          <p className="mt-1">
            <span className="font-semibold text-white">Active Demand:</span> {totalRequestedOfficers} Officers
          </p>
          {isOverCapacity && (
            <p className="mt-2 font-medium text-amber-400">
              ⚠️ Resource shortfall detected! Total demand exceeds the global city pool. Running AI coordination is recommended.
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {coordinatedTable ? (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Coordinated Operational Dispatch Table</h4>
            <DataTable
              rows={coordinatedTable}
              columns={[
                { key: "zone", label: "Zone" },
                { key: "officers", label: "Officers" },
                { key: "marshals", label: "Marshals" },
                { key: "barricades", label: "Barricades" },
                { key: "towVehicles", label: "Tow Vehicles" },
                { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
              ]}
            />
            {reasoning && (
              <div className="rounded-2xl border border-[#343a40] bg-[#16181b] p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Gemini Coordinated Reasoning</p>
                <p className="text-sm text-slate-300 leading-6">{reasoning}</p>
              </div>
            )}
            <Button variant="secondary" onClick={() => { setCoordinatedTable(null); setReasoning(null); }}>
              Reset allocations
            </Button>
          </div>
        ) : (
          <Button disabled={isPending} onClick={handleCoordinate} className="w-full sm:w-auto">
            {isPending ? "Running AI Coordination..." : "Run AI Resource Coordination"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
