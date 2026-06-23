"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Search, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Custom premium amber marker icon
const customMarkerIcon = L.divIcon({
  className: "custom-location-picker-icon",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute h-8 w-8 rounded-full bg-[#F59E0B]/25 animate-ping"></div>
      <div class="relative h-5 w-5 rounded-full bg-[#F59E0B] border-[3px] border-[#16181B] shadow-[0_0_10px_rgba(245,158,11,0.6)]"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Component to handle map clicks
function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to handle recentering the map when parent coordinates change
function MapRecenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      // Use flyTo for a smooth transition
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
  className = "",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const markerRef = useRef(null);

  const center = useMemo(() => [latitude || 12.9716, longitude || 77.5946], [latitude, longitude]);

  // Forward geocoding (Address -> Coordinates)
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`,
        {
          headers: {
            "User-Agent": "FlipkartGridlockApp/1.0",
          },
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const displayName = data[0].display_name;
        
        // Notify parent of the new location
        onLocationChange(lat, lon, displayName);
      } else {
        setError("Location not found. Try a different search term.");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setError("Failed to reach search service.");
    } finally {
      setLoading(false);
    }
  };

  // Reverse geocoding (Coordinates -> Address)
  const performReverseGeocode = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            "User-Agent": "FlipkartGridlockApp/1.0",
          },
        }
      );
      const data = await response.json();

      if (data && data.display_name) {
        onLocationChange(lat, lon, data.display_name);
        setSearchQuery(data.display_name);
      } else {
        onLocationChange(lat, lon, `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      // Fallback to coordinates format on failure
      onLocationChange(lat, lon, `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    } finally {
      setLoading(false);
    }
  };

  // Dragging event handler
  const markerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          performReverseGeocode(latLng.lat, latLng.lng);
        }
      },
    }),
    [latitude, longitude]
  );

  const handleMapClick = (lat, lon) => {
    performReverseGeocode(lat, lon);
  };

  return (
    <div className={`relative flex flex-col rounded-2xl overflow-hidden border border-[#343A40] bg-[#16181B] ${className}`}>
      
      {/* Absolute Search bar Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search address or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border-[#343A40] bg-[#16181B]/90 backdrop-blur-md text-white text-xs placeholder:text-slate-500 focus-visible:ring-[#F59E0B] shadow-lg"
            />
            <div className="absolute left-3.5 top-3 text-slate-500">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#F59E0B]" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </div>
          </div>
          <Button 
            type="submit" 
            size="sm"
            disabled={loading}
            className="h-10 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-black font-semibold text-xs shadow-lg"
          >
            Search
          </Button>
        </form>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 min-h-[260px]">
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full bg-[#0F172A] z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapRecenterController center={center} />
          
          <MapEventsHandler onMapClick={handleMapClick} />

          <Marker
            position={center}
            draggable={true}
            eventHandlers={markerEventHandlers}
            ref={markerRef}
            icon={customMarkerIcon}
          />
        </MapContainer>

        {/* Floating coordinate helper */}
        <div className="absolute bottom-3 left-3 right-3 z-[1000] p-2.5 rounded-xl border border-[#343A40]/80 bg-[#16181B]/90 backdrop-blur-md flex items-center justify-between text-[10px] font-mono text-slate-400 shadow-md">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-white font-medium">Selected Location</span>
          </div>
          <div className="bg-black/30 px-2 py-1 rounded border border-[#343A40]/40">
            LAT: <span className="text-amber-400 font-bold">{Number(latitude).toFixed(5)}</span> | 
            LNG: <span className="text-amber-400 font-bold">{Number(longitude).toFixed(5)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="absolute bottom-16 left-3 right-3 z-[1000] p-2 rounded-lg bg-rose-950/90 border border-rose-800 text-rose-300 text-[10px] text-center backdrop-blur-sm animate-in fade-in slide-in-from-bottom-1">
          {error}
        </div>
      )}
    </div>
  );
}
