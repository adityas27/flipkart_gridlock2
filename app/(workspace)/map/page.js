import { MapPanel } from "@/components/map/map-panel";
import { SectionHeader } from "@/components/shared/section-header";

export default function MapPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Geospatial view"
        title="Interactive traffic map"
        description="Inspect event markers, severity overlays, congestion zones, and diversion corridors on a live mock map."
      />
      <MapPanel />
    </div>
  );
}
