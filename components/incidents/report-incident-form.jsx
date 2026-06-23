"use client";

import { useState } from "react";
import { 
  AlertTriangle, 
  Camera, 
  MapPin, 
  ShieldAlert, 
  FileText, 
  Brain, 
  ShieldCheck, 
  Briefcase, 
  Radio,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Clock,
  Users,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Activity
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

import { SectionHeader } from "@/components/shared/section-header";
import { submitReportAction } from "@/actions/reports";
import { EVENT_TYPES } from "@/types";

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

// Import Leaflet location picker dynamically with ssr disabled
const LocationPickerMap = dynamic(() => import("@/components/map/location-picker-map"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full animate-pulse rounded-2xl bg-white/5 border border-[#343A40] flex items-center justify-center text-slate-500 text-xs">
      Loading Interactive Map...
    </div>
  ),
});

const EVENT_CAUSES = {
  "Vehicle Breakdown": "vehicle_breakdown",
  "Others": "others",
  "Tree Fall": "tree_fall",
  "Accident": "accident",
  "Public Event": "public_event",
  "Water Logging": "water_logging",
  "Pot Holes": "pot_holes",
  "Congestion": "congestion",
  "Construction": "construction",
  "Road Conditions": "road_conditions",
  "VIP Movement": "vip_movement",
  "Procession": "procession",
  "Protest": "protest",
  "Debris": "Debris",
  "Fog / Low Visibility": "Fog / Low Visibility"
};

const getCauseLabel = (value) => {
  return Object.keys(EVENT_CAUSES).find(key => EVENT_CAUSES[key] === value) || value;
};

export default function ReportIncidentForm() {
  const [formData, setFormData] = useState({
    eventName: "",
    eventType: "Festival",
    eventCause: "vehicle_breakdown",
    crowdSize: 0,
    location: "",
    startTime: "",
    endTime: "",
    photoUrl: "",
    latitude: 12.9716,
    longitude: 77.5946,
  });

  const [submitted, setSubmitted] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [receiptId] = useState(() => Math.random().toString(36).substr(2, 9).toUpperCase());

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField("photoUrl", reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      updateField("photoUrl", "");
    }
  }

  function handleReset() {
    setFormData({
      eventName: "",
      eventType: "Festival",
      eventCause: "vehicle_breakdown",
      crowdSize: 0,
      location: "",
      startTime: "",
      endTime: "",
      photoUrl: "",
      latitude: 12.9716,
      longitude: 77.5946,
    });
    setSubmitted(null);
    setError(null);
    setShowJsonInspector(false);
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

  const handleCopyId = () => {
    navigator.clipboard.writeText(receiptId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Synchronize coordinates and address name from interactive map
  const handleLocationMapChange = (lat, lon, addressName) => {
    setFormData((current) => ({
      ...current,
      latitude: lat,
      longitude: lon,
      location: addressName,
    }));
  };

  // Live calculations for the summary widget
  const getCrowdStatus = (size) => {
    if (!size || size <= 0) return { label: "No Crowd Data", color: "text-slate-400 bg-slate-400/10 border-slate-400/20", percentage: 0 };
    if (size < 100) return { label: "Light Crowd", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", percentage: 25 };
    if (size <= 500) return { label: "Moderate Crowd", color: "text-sky-400 bg-sky-400/10 border-sky-400/20", percentage: 50 };
    if (size <= 2000) return { label: "Heavy Crowd", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", percentage: 75 };
    return { label: "Extreme Crowd", color: "text-rose-400 bg-rose-400/10 border-rose-400/20", percentage: 100 };
  };

  const calculateDuration = (start, end) => {
    if (!start) return null;
    const s = new Date(start);
    // If end time is not provided, default to start time + 2 hours for display
    const e = end ? new Date(end) : new Date(s.getTime() + 2 * 60 * 60 * 1000);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    const diffMs = e - s;
    if (diffMs <= 0) return null;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHrs === 0) return `${diffMins} mins`;
    if (diffMins === 0) return `${diffHrs} hours`;
    return `${diffHrs}h ${diffMins}m`;
  };

  const crowdStatus = getCrowdStatus(formData.crowdSize);
  const duration = calculateDuration(formData.startTime, formData.endTime);

  const PIPELINE_STEPS = [
    {
      id: "step-1",
      icon: FileText,
      title: "1. Citizen Submission",
      desc: "Incident logged in control database.",
      details: "Your report is securely stored and timestamped. It is assigned a unique tracking ID and queued for automatic triage.",
      color: "border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/10",
      activeColor: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    },
    {
      id: "step-2",
      icon: Brain,
      title: "2. AI Impact Assessment",
      desc: "ML predicts congestion and alternative corridors.",
      details: "Our AI models analyze historical traffic data, current flow patterns, and your report inputs to predict congestion bottlenecks and suggest optimized diversion routes.",
      color: "border-sky-400 text-sky-400 bg-sky-400/10",
      activeColor: "shadow-[0_0_15px_rgba(56,189,248,0.3)]",
    },
    {
      id: "step-3",
      icon: ShieldCheck,
      title: "3. Commander Review",
      desc: "Traffic operator reviews and verifies the report.",
      details: "A live control room operator evaluates the report, verifies photo evidence against nearby CCTV feeds, and upgrades the report to verified status.",
      color: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
      activeColor: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    },
    {
      id: "step-4",
      icon: Briefcase,
      title: "4. Resource Allocation",
      desc: "Calculates deployment recommendations for manpower/barricades.",
      details: "The system calculates exactly how many traffic personnel, barricades, or signal timing adjustments are needed to mitigate the disruption.",
      color: "border-violet-500 text-violet-400 bg-violet-500/10",
      activeColor: "shadow-[0_0_15px_rgba(139,92,246,0.3)]",
    },
    {
      id: "step-5",
      icon: Radio,
      title: "5. Live Network Launch",
      desc: "Incident publishes onto maps and updates field navigation.",
      details: "Once authorized, the incident and active diversions are broadcasted to navigation apps, public displays, and emergency service networks.",
      color: "border-pink-500 text-pink-400 bg-pink-500/10",
      activeColor: "shadow-[0_0_15px_rgba(236,72,153,0.3)]",
    }
  ];

  // custom syntax highlighter for raw JSON
  const renderFormattedJson = (obj) => {
    const jsonStr = JSON.stringify(obj, null, 2);
    return jsonStr.split("\n").map((line, i) => {
      const keyMatch = line.match(/^(\s*)"([^"]+)": (.*)$/);
      if (keyMatch) {
        const indent = keyMatch[1];
        const key = keyMatch[2];
        const val = keyMatch[3];
        
        let coloredVal = val;
        if (val.startsWith('"')) {
          coloredVal = <span className="text-amber-300">{val}</span>;
        } else if (!isNaN(parseFloat(val)) || val === "true" || val === "false" || val === "null") {
          coloredVal = <span className="text-sky-400">{val}</span>;
        }
        
        return (
          <div key={i} className="font-mono text-xs leading-5">
            {indent}
            <span className="text-emerald-400">"{key}"</span>: {coloredVal}
          </div>
        );
      }
      return <div key={i} className="font-mono text-xs leading-5 text-slate-400">{line}</div>;
    });
  };

  const barcodePattern = () => {
    const str = receiptId;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const widths = [];
    for (let i = 0; i < 38; i++) {
      widths.push((hash >> (i % 32)) & 1 ? 3 : 1.5);
    }
    return widths;
  };

  return (
    <div className="mx-auto w-full max-w-6xl py-10 md:py-12 space-y-8">
      <SectionHeader
        eyebrow="Citizen Reporting Portal"
        title="Report Traffic Incident"
        description="Help authorities identify disruptions early. Reports are reviewed by operators before becoming active traffic alerts."
      />

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        
        {/* Left Column: Form or Success Card */}
        {submitted ? (
          <Card className="border-[#10B981]/30 bg-gradient-to-b from-[#10B981]/5 to-transparent relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 h-48 w-48 bg-[#10B981]/5 rounded-full blur-3xl" />
            
            {/* Retro Stamp */}
            <div className="absolute top-12 right-6 border-4 border-dashed border-[#10B981]/40 text-[#10B981]/50 uppercase font-extrabold text-sm tracking-widest px-4 py-2 rounded-lg transform rotate-12 select-none pointer-events-none animate-pulse">
              Verifying
            </div>

            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl text-white">Report Successfully Logged</CardTitle>
              <CardDescription className="text-[#9CA3AF]">
                Your report has been submitted and is currently queued for commander verification.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-4">
              {/* Skeuomorphic Digital Ticket Card */}
              <div className="relative rounded-2xl border border-[#343A40] bg-[#16181B] overflow-hidden shadow-xl">
                {/* Header of Ticket */}
                <div className="border-b border-[#343A40] bg-[#1E2124] px-5 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#10B981] animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Submission Receipt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded border border-[#F59E0B]/20">
                      ID: {receiptId}
                    </span>
                    <button 
                      onClick={handleCopyId} 
                      className="p-1 rounded hover:bg-[#343A40] transition-colors text-slate-400 hover:text-white"
                      title="Copy Receipt ID"
                    >
                      {copiedId ? <Check className="h-3.5 w-3.5 text-[#10B981]" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Ticket Details Body */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
                    <div>
                      <p className="text-xs text-[#9CA3AF] uppercase tracking-wider">Event Name</p>
                      <p className="font-semibold text-white mt-1 text-base">{submitted.eventName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF] uppercase tracking-wider">Event Type</p>
                      <p className="font-semibold text-[#F59E0B] mt-1 text-base">{submitted.eventType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF] uppercase tracking-wider">Location</p>
                      <p className="font-semibold text-white mt-1 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-sky-400" />
                        {submitted.location || "Coordinates Selected"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF] uppercase tracking-wider">Crowd Estimate</p>
                      <p className="font-semibold text-white mt-1 flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-amber-400" />
                        {submitted.crowdSize} people
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#343A40]/60 pt-4">
                    <p className="text-xs text-[#9CA3AF] uppercase tracking-wider">Event Cause</p>
                    <p className="text-sm text-slate-300 mt-1.5 font-medium flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                      {getCauseLabel(submitted.eventCause)}
                    </p>
                  </div>

                  {submitted.photoUrl && (
                    <div className="border-t border-[#343A40]/60 pt-4 space-y-2">
                      <p className="text-xs text-[#9CA3AF] uppercase tracking-wider">Photo Evidence</p>
                      <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[#343A40] bg-[#111315] group">
                        <img 
                          src={submitted.photoUrl} 
                          alt="Uploaded evidence preview" 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    </div>
                  )}

                  {/* SVG Barcode */}
                  <div className="border-t border-[#343A40]/60 pt-6 flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-[2px] h-12 bg-white/5 py-2 px-4 rounded-lg border border-[#343A40]/40">
                      {barcodePattern().map((w, idx) => (
                        <div key={idx} className="h-full bg-slate-300" style={{ width: `${w}px` }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase">GRIDLOCK-SECURE-{receiptId}</span>
                  </div>
                </div>

                {/* Perforated Jagged Bottom Edge */}
                <div className="relative h-4 w-full overflow-hidden flex justify-between px-1.5 -mt-2 bg-transparent select-none pointer-events-none">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 rounded-full bg-[#0B0C10] -mt-2 border border-[#343A40]/10" />
                  ))}
                </div>
              </div>

              {/* Expandable JSON Payload Inspector */}
              <div className="border border-[#343A40] bg-[#16181B]/40 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowJsonInspector(!showJsonInspector)}
                  className="w-full px-4 py-3 flex justify-between items-center text-sm font-medium text-slate-300 hover:text-white hover:bg-[#1C1F23]/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-sky-400" />
                    <span>View Raw Payload JSON</span>
                  </div>
                  {showJsonInspector ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showJsonInspector && (
                  <div className="border-t border-[#343A40] p-4 bg-black/40 max-h-64 overflow-y-auto font-mono scrollbar-thin scrollbar-thumb-slate-800">
                    {renderFormattedJson(submitted)}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button className="flex-1 gap-2" asChild>
                  <Link href="/my-reports">
                    View My Reports
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="secondary" className="gap-2" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4" />
                  Submit Another Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-[#343A40] bg-[#16181B]/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl">Incident Details</CardTitle>
              <CardDescription>
                Provide critical details about the traffic event to assist field operators.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#D1D5DB]">Event Name</label>
                  <Input
                    placeholder="e.g. MG Road Festival"
                    value={formData.eventName}
                    onChange={(event) =>
                      updateField("eventName", event.target.value)
                    }
                    required
                    className="rounded-xl border-[#343A40] bg-[#1C1F23] focus-visible:ring-[#F59E0B]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#D1D5DB]">Event Type</label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value) => updateField("eventType", value)}
                  >
                    <SelectTrigger className="rounded-xl border-[#343A40] bg-[#1C1F23]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1F23] border-[#343A40]">
                      {EVENT_TYPES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#D1D5DB]">Event Cause</label>
                  <Select
                    value={formData.eventCause}
                    onValueChange={(value) => updateField("eventCause", value)}
                  >
                    <SelectTrigger className="rounded-xl border-[#343A40] bg-[#1C1F23]">
                      <SelectValue placeholder="Select event cause" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1F23] border-[#343A40] max-h-60 overflow-y-auto">
                      {Object.entries(EVENT_CAUSES).map(([label, val]) => (
                        <SelectItem key={val} value={val}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#D1D5DB]">Crowd Size</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.crowdSize}
                    onChange={(event) =>
                      updateField("crowdSize", Number(event.target.value))
                    }
                    required
                    className="rounded-xl border-[#343A40] bg-[#1C1F23] focus-visible:ring-[#F59E0B]"
                  />
                </div>

                {/* Interactive Location Picker Map */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#D1D5DB]">Interactive Location Picker Map</label>
                  <p className="text-xs text-slate-500">
                    Search for an address above or click/drag the marker on the map to set the exact location coordinates and address name.
                  </p>
                  <LocationPickerMap
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationChange={handleLocationMapChange}
                    className="h-72 w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#D1D5DB]">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(event) =>
                      updateField("startTime", event.target.value)
                    }
                    required
                    className="rounded-xl border-[#343A40] bg-[#1C1F23]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#D1D5DB]">Photo Evidence</label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="rounded-xl border-[#343A40] bg-[#1C1F23] file:text-[#F59E0B] file:font-semibold"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isPending}>
                  {isPending ? "Submitting..." : "Submit Incident Report"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Right Column: Visual Summary & Process Flow */}
        <div className="space-y-6">
          
          {/* 1. Attractive & Clean Report Summary Card */}
          <Card className="border-[#343A40] bg-[#16181B]/40 overflow-hidden relative shadow-lg backdrop-blur-md">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#F59E0B]" />
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Live Report Summary</CardTitle>
              <CardDescription>Visual preview of the data fields currently entered.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-[#343A40] bg-[#1C1F23]/60">
                  <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Name</p>
                  <p className="text-sm font-semibold text-white mt-1 truncate">
                    {formData.eventName || "Untitled Event"}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-[#343A40] bg-[#1C1F23]/60">
                  <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Type</p>
                  <p className="text-sm font-semibold text-[#F59E0B] mt-1 truncate">
                    {formData.eventType}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-[#343A40] bg-[#1C1F23]/60 col-span-2 relative overflow-hidden group">
                  <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Location</p>
                  <p className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5 truncate">
                    <span className="relative flex h-2 w-2">
                      <span className={`absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 ${formData.location ? "animate-ping" : ""}`}></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                    <MapPin className="h-4 w-4 text-sky-400" />
                    {formData.location || "Not specified (use map)"}
                  </p>
                </div>
              </div>

              {/* Live Cause Preview */}
              <div className="p-3.5 rounded-xl border border-[#343A40] bg-[#1C1F23]/60">
                <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Selected Cause</p>
                <p className="text-sm font-semibold text-white mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#F59E0B] animate-pulse" />
                  {getCauseLabel(formData.eventCause)}
                </p>
              </div>

              {/* Dynamic Crowd Density Indicator */}
              <div className="p-3.5 rounded-xl border border-[#343A40] bg-[#1C1F23]/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Crowd Density</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${crowdStatus.color}`}>
                    {crowdStatus.label}
                  </span>
                </div>
                <div className="w-full bg-[#111315] h-2 rounded-full overflow-hidden border border-[#343A40]/40">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${crowdStatus.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>0</span>
                  <span>500</span>
                  <span>2000+</span>
                </div>
              </div>

              {/* Dynamic Duration Panel */}
              {duration && (
                <div className="p-3.5 rounded-xl border border-[#343A40] bg-[#1C1F23]/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#F59E0B] animate-pulse" />
                    <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">Planned Duration</span>
                  </div>
                  <span className="text-sm font-bold text-white font-mono bg-[#111315] px-2.5 py-1 rounded border border-[#343A40]">
                    {duration}
                  </span>
                </div>
              )}

              {/* Dynamic Photo Container inside Summary */}
              <div className="p-3 rounded-xl border border-[#343A40] bg-[#1C1F23]/40">
                <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mb-2">Attached Photo Evidence</p>
                {formData.photoUrl ? (
                  <div className="relative h-32 w-full overflow-hidden rounded-lg border border-[#343A40] group">
                    <img 
                      src={formData.photoUrl} 
                      alt="Thumbnail preview" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs text-white font-medium bg-black/60 px-2 py-1 rounded backdrop-blur-sm">Evidence Attached</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-16 flex flex-col items-center justify-center rounded-lg border border-dashed border-[#343A40] bg-black/10 text-slate-500">
                    <Camera className="h-5 w-5 mb-1 text-slate-600 animate-pulse" />
                    <span className="text-xs">No image selected yet</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Visual Flow Graph / Stepper for "What happens next" */}
          <Card className="border-[#343A40] bg-[#16181B]/40 shadow-lg backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Operational Pipeline</CardTitle>
              <CardDescription>Visual tracker showing how your report flows into live mitigation.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="relative pl-8 space-y-5">
                {/* Vertical connecting bar */}
                <div className="absolute left-[13.5px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#F59E0B] via-sky-400 to-[#343A40]" />
                
                {PIPELINE_STEPS.map((step) => {
                  const isExpanded = expandedStep === step.id;
                  return (
                    <div 
                      key={step.id}
                      className="group cursor-pointer"
                      onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                    >
                      <PipelineStep 
                        icon={step.icon} 
                        title={step.title} 
                        desc={step.desc} 
                        color={step.color}
                        activeColor={step.activeColor}
                        isExpanded={isExpanded}
                      />
                      
                      {/* Interactive Detail Drawer */}
                      {isExpanded && (
                        <div className="mt-2 ml-1 p-3 rounded-lg border border-[#343A40]/80 bg-[#111315]/80 text-xs text-slate-300 leading-relaxed shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
                          {step.details}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

function PipelineStep({ icon: Icon, title, desc, color, activeColor, isExpanded }) {
  return (
    <div className="relative flex items-start gap-4">
      {/* Node Bullet */}
      <div className={`absolute -left-8 top-0.5 flex h-7.5 w-7.5 items-center justify-center rounded-full border ${color} ${activeColor} transition-all duration-300 group-hover:scale-110`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-semibold leading-none text-white group-hover:text-[#F59E0B] transition-colors">
            {title}
          </h4>
          <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors pl-2">
            {isExpanded ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed truncate">{desc}</p>
      </div>
    </div>
  );
}
