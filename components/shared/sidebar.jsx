"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarClock, CarFront, LayoutDashboard, MapPinned, Menu, Route, ShieldCheck, Gpu, TrafficCone, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { href: "/overview", label: "Overview", icon: ShieldCheck },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: CalendarClock },
  { href: "/predictor", label: "Predictor", icon: Gpu },
  { href: "/resources", label: "Resources", icon: TrafficCone },
  { href: "/diversions", label: "Diversions", icon: Route },
  { href: "/map", label: "Traffic Map", icon: MapPinned },
];

export function Sidebar({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside className="flex h-full w-full max-w-xs flex-col border-r border-[#343A40] bg-[#16181B] px-4 py-5">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#343A40] bg-[#22262B] text-[#F59E0B]">
          <CarFront className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#F59E0B]">Gridlock 2.0</p>
          <h2 className="text-lg font-semibold text-white">Traffic Command</h2>
        </div>
      </div>

      <nav className="space-y-1.5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "relative grid grid-cols-[18px_minmax(0,1fr)] items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                active ? "bg-[#22262B] text-white" : "text-[#A1A7B3] hover:bg-[#1C1F23] hover:text-white"
              )}
            >
              <span className={cn("absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full", active ? "bg-[#F59E0B]" : "bg-transparent")} />
              <Icon className={cn("h-4 w-4", active ? "text-[#F59E0B]" : "text-[#7A818D]")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-[#343A40] bg-[#1C1F23] p-4">
        <p className="text-sm font-medium text-white">Rapid response window</p>
        <p className="mt-2 text-sm leading-6 text-[#A1A7B3]">
          Use the predictor first, then mirror the selected route plan onto the traffic map for deployment review.
        </p>
      </div>
    </aside>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-transparent">
      <div className="grid grid-cols-1 xl:grid-cols-[296px_minmax(0,1fr)]">
        <div className="hidden xl:block">{sidebar}</div>
        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[#343A40] bg-[#16181B] px-4 py-4 md:px-6 xl:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="icon" className="xl:hidden" onClick={() => setMobileOpen(true)}>
                  <Menu className="h-4 w-4" />
                </Button>
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-slate-500">Operations Control Center</p>
                  <h1 className="text-lg font-semibold text-white">Event-driven congestion management</h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="hidden items-center gap-2 rounded-xl border border-[#343A40] bg-[#1C1F23] px-4 py-2 text-sm text-[#D1D5DB] md:flex">
                  <Bell className="h-4 w-4 text-[#F59E0B]" />
                  3 alerts need review
                </div>
                <Button asChild>
                  <Link href="/events/create">Create Event</Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 md:px-6 xl:px-8">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-full max-w-xs">
            <div className="relative h-full shadow-2xl">
              <button className="absolute right-3 top-3 z-10 rounded-full border border-[#343A40] bg-[#1C1F23] p-2 text-white" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </button>
              {sidebar}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
