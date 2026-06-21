import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}) {
  return (
    <Card className="border-dashed border-white/15 bg-white/2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-slate-400">
          {description}
        </p>

        {action}
      </CardContent>
    </Card>
  );
}