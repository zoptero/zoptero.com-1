"use client";

import { Progress } from "@/components/ui/progress";

export default function ProgressUnderSearchbox() {
  return (
    <div className="w-full flex flex-col items-center mt-4">
      <div className="flex items-center gap-3 w-full max-w-xl">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Izstrādes darbi</span>
        <Progress value={27} className="flex-1" />
        <span className="text-xs text-muted-foreground font-semibold ml-2">27%</span>
      </div>
    </div>
  );
}
