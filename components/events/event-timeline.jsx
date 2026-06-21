import { formatDateTime } from "@/lib/utils";

export function EventTimeline({ timeline }) {
  return (
    <div className="space-y-4">
      {timeline.map((item, index) => (
        <div key={`${item.label}-${index}`} className="grid grid-cols-[20px_1fr] gap-4">
          <div className="flex flex-col items-center">
            <span className="mt-1 h-3 w-3 rounded-full bg-sky-300" />
            {index < timeline.length - 1 ? <span className="mt-2 h-full w-px bg-white/10" /> : null}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/2 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p className="font-medium text-white">{item.label}</p>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{formatDateTime(item.time)}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
