"use client";

import dynamic from "next/dynamic";

const TrafficMap = dynamic(() => import("@/components/map/traffic-map"), {
  ssr: false,
  loading: () => <div className="h-155 animate-pulse rounded-3xl bg-white/6" />,
});

export function MapPanel() {
  return <TrafficMap />;
}
