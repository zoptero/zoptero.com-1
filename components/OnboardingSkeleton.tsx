import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function OnboardingSkeleton() {
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-8">
      {/* Badge and Title Section */}
      <div className="flex flex-col items-center w-full mb-2 mt-8">
        <div className="h-6 w-32 bg-muted animate-pulse rounded-md mb-2" />
        <div className="h-10 w-64 bg-muted animate-pulse rounded-md mb-2" />
        <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
      </div>
      
      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {[1, 2].map((i) => (
          <Card key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      
      {/* Button Section */}
      <div className="h-12 w-48 bg-muted animate-pulse rounded-md mt-4" />
    </div>
  );
}
