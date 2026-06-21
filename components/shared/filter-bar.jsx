import { Search } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

export function FilterBar({
  searchValue,
  onSearchChange,
  filters,
}) {
  return (
    <Card className="bg-slate-950/70">
      <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

          <Input
            value={searchValue}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search by name, cause, or location"
            className="pl-10"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:flex">
          {filters}
        </div>
      </CardContent>
    </Card>
  );
}