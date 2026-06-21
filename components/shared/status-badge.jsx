import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const badgeClasses = {
  Active:
    "bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/30 hover:bg-[#EF4444]/15",

  Scheduled:
    "bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/30 hover:bg-[#F59E0B]/15",

  Monitoring:
    "bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/30 hover:bg-[#F97316]/15",

  Resolved:
    "bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/30 hover:bg-[#22C55E]/15",

  Assigned:
    "bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/30 hover:bg-[#22C55E]/15",

  Queued:
    "bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/30 hover:bg-[#F59E0B]/15",

  Reserved:
    "bg-[#52525B]/40 text-[#D4D4D8] border-[#52525B] hover:bg-[#52525B]/40",

  Recommended:
    "bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/30 hover:bg-[#22C55E]/15",

  Fallback:
    "bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/30 hover:bg-[#F59E0B]/15",

  Critical:
    "bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/30 hover:bg-[#EF4444]/15",

  High:
    "bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/30 hover:bg-[#F97316]/15",

  Moderate:
    "bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/30 hover:bg-[#F59E0B]/15",

  Low:
    "bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/30 hover:bg-[#22C55E]/15",
};

export function StatusBadge({
  status,
  className,
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold tracking-[0.02em]",
        badgeClasses[status] || badgeClasses.Monitoring,
        className
      )}
    >
      {status}
    </Badge>
  );
}