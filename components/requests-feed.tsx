"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FadeInSlide from "@/components/FadeInSlide";

interface RequestItem {
  _id: string;
  requestTaskTitle: string;
  requestLocation: string;
  requestTask: string;
  displayName: string;
  _creationTime: number;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function RequestsFeed() {
  const rawRequests = useQuery(api.profiles.getLatestRequests, { limit: 10 });
  const [requests, setRequests] = useState<RequestItem[]>([]);

  useEffect(() => {
    if (rawRequests) {
      setRequests(rawRequests as RequestItem[]);
    }
  }, [rawRequests]);

  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <FadeInSlide delay={0.3} className="w-full">
      <div className="w-full px-4 flex justify-center">
        <div className="w-full max-w-2xl mx-auto space-y-0.5">
          {requests.map((req) => (
            <div
              key={req._id}
              className="flex items-baseline gap-1.5 text-xs text-muted-foreground leading-relaxed"
            >
              <span className="tabular-nums shrink-0 text-[11px] text-muted-foreground/50 font-mono">
                {formatDate(req._creationTime)}
              </span>
              <span className="truncate text-foreground/70">
                {req.requestTaskTitle}
              </span>
              {req.requestLocation && (
                <span className="shrink-0 text-muted-foreground/40 hidden sm:inline">
                  ({req.requestLocation})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </FadeInSlide>
  );
}