import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function OnboardingSkeleton() {
  return (
    <div className="flex h-screen h-[100svh] h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-4 py-4 sm:py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 sm:gap-6">
        {/* Badge and Title Section */}
        <div className="flex w-full flex-col items-center">
          <div className="h-6 w-32 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-10 w-64 bg-muted animate-pulse rounded-md mb-2" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
        </div>
        
        {/* Cards Section */}
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        
        {/* Button Section */}
        <div className="h-12 w-48 bg-muted animate-pulse rounded-md mt-1" />
      </div>
    </div>
  );
}
