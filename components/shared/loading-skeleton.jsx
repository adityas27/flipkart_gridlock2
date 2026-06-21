import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton({
  className = "h-24 w-full",
}) {
  return (
    <Skeleton
      className={`rounded-2xl ${className}`}
    />
  );
}