import { ArrowUpRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  trend,
  icon: Icon,
}) {
  const tone = label.includes("Accuracy")
    ? "text-[#22C55E]"
    : label.includes("High Risk")
      ? "text-[#EF4444]"
      : label.includes("Barricades")
        ? "text-[#F97316]"
        : "text-[#F59E0B]";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#A1A7B3]">
            {label}
          </p>

          {Icon ? (
            <Icon className={`h-5 w-5 ${tone}`} />
          ) : null}
        </div>

        <CardTitle className="text-3xl text-[#F3F4F6]">
          {value}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex items-center gap-2 border-t border-[#343A40] pt-4 text-sm text-[#7A818D]">
        <ArrowUpRight className={`h-4 w-4 ${tone}`} />
        <span>{trend}</span>
      </CardContent>
    </Card>
  );
}