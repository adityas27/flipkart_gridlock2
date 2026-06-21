import { cn } from "@/lib/utils";

export function SectionHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#F59E0B]">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
        {description ? <p className="max-w-3xl text-sm leading-6 text-[#A1A7B3] md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
