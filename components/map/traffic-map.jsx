"use client";

import { useEffect, useState } from "react";
import { Circle, LayersControl, MapContainer, Marker, Popup, Polyline, TileLayer } from "react-leaflet";
import L from "leaflet";
import { getTrafficMapData } from "@/actions/map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";

const severityColors = {
  Critical: "#fb7185",
  High: "#f59e0b",
  Moderate: "#38bdf8",
  Low: "#34d399",
  "N/A": "#64748b",
};

function markerIcon(severity) {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background:${severityColors[severity]};width:16px;height:16px;border-radius:9999px;border:3px solid rgba(15,23,42,0.95);box-shadow:0 0 0 6px rgba(255,255,255,0.12);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function TrafficMap() {
  const [mapData, setMapData] = useState({
    mapEvents: [],
    congestionZones: [],
    mapRoutes: [],
  });

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const res = await getTrafficMapData();
        if (active) {
          setMapData(res ?? { mapEvents: [], congestionZones: [], mapRoutes: [] });
        }
      } catch (error) {
        console.error("Failed to load map data:", error);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const { mapEvents, congestionZones, mapRoutes } = mapData;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Interactive Traffic Map</CardTitle>
          <CardDescription>Event markers, severity overlays, congestion zones, and diversion routes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <MapContainer center={[12.9716, 77.5946]} zoom={12} scrollWheelZoom className="h-155 w-full bg-slate-900">
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Street map">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>

                <LayersControl.Overlay checked name="Event markers">
                  <div>
                    {mapEvents.map((event) => (
                      <Marker key={event.id} position={event.position} icon={markerIcon(event.severity)}>
                        <Popup>
                          <div className="space-y-2">
                            <p className="font-semibold">{event.name}</p>
                            <p>{event.zone} zone</p>
                            <p>{event.status}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </div>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Congestion zones">
                  <div>
                    {congestionZones.map((zone) => (
                      <Circle
                        key={zone.id}
                        center={zone.center}
                        radius={zone.radius}
                        pathOptions={{
                          color: severityColors[zone.severity],
                          fillColor: severityColors[zone.severity],
                          fillOpacity: 0.18,
                        }}
                      >
                        <Popup>{zone.label}</Popup>
                      </Circle>
                    ))}
                  </div>
                </LayersControl.Overlay>

                <LayersControl.Overlay checked name="Diversion routes">
                  <div>
                    {mapRoutes.map((route) => (
                      <Polyline key={route.id} positions={route.coordinates} pathOptions={{ color: route.rank === 1 ? "#34d399" : "#38bdf8", weight: 5, opacity: 0.75 }}>
                        <Popup>
                          <div className="space-y-2">
                            <p className="font-semibold">{route.name}</p>
                            <p>Delay reduction: {route.delayReduction}</p>
                            <p>Distance: {route.distance}</p>
                          </div>
                        </Popup>
                      </Polyline>
                    ))}
                  </div>
                </LayersControl.Overlay>
              </LayersControl>
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(severityColors).map(([label, color]) => (
              <div key={label} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                {label} severity
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layer Summary</CardTitle>
            <CardDescription>Mock map entities available for testing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mapEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-white/2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{event.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{event.zone} zone</p>
                  </div>
                  <StatusBadge status={event.severity} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
