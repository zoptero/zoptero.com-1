"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import ThemeSwitch from "@/components/layout/header/theme-switch";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, ArrowRight, Locate } from "lucide-react";
// import { Tooltip8 } from "@/components/ui/tooltip8";
// import Footer1 from "@/components/footer1";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { cn, calculateDistance } from "@/lib/utils";
import { toast } from "sonner";

type LocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "active"; lat: number; lng: number }
  | { status: "error" };

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [locationState, setLocationState] = useState<LocationState>({ status: "idle" });

  const trimmedQuery = query.trim();
  const hasActiveLocation = locationState.status === "active";

  const searchArgs =
    trimmedQuery.length > 0
      ? {
          query: trimmedQuery,
          limit: 8,
          lat: hasActiveLocation ? locationState.lat : undefined,
          lng: hasActiveLocation ? locationState.lng : undefined,
        }
      : "skip";

  const searchResults = useQuery(api.profiles.searchProfilesReactive, searchArgs);

  const visibleResults = useMemo(() => {
    if (!searchResults) {
      return [];
    }

    if (!hasActiveLocation) {
      return searchResults;
    }

    return searchResults.map((result) => {
      if (typeof result.latitude !== "number" || typeof result.longitude !== "number") {
        return result;
      }

      const distanceKm = calculateDistance(
        locationState.lat,
        locationState.lng,
        result.latitude,
        result.longitude,
      );

      return {
        ...result,
        _distanceKm: Number(distanceKm.toFixed(2)),
      };
    });
  }, [searchResults, hasActiveLocation, locationState]);

  const activateLocation = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      toast.error("Šajā pārlūkā nav pieejama atrašanās vieta.");
      setLocationState({ status: "error" });
      return;
    }

    setLocationState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          status: "active",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success("Location Active");
      },
      (error) => {
        setLocationState({ status: "error" });
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Atrašanās vietas piekļuve tika liegta."
            : "Neizdevās noteikt atrašanās vietu.";
        toast.error(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <section className="flex min-h-screen flex-col items-center justify-between bg-[radial-gradient(125%_125%_at_50%_90%,#ffffff_40%,var(--color-purple-200)_100%)] bg-cover bg-center text-center text-sm max-md:px-4 dark:bg-[radial-gradient(125%_125%_at_50%_90%,var(--color-background)_40%,var(--color-purple-800)_100%)]">
      <nav className="flex w-full items-center justify-between py-4 md:px-16 lg:px-24 xl:px-32">
        {/* Logo removed as requested */}

        <NavigationMenu
          viewport={false}
          className="hidden max-w-none flex-1 justify-center md:flex"
        >
          {/* Navigation links removed as requested */}
        </NavigationMenu>

        <div className="flex items-center gap-2 w-full justify-end md:w-auto md:justify-start">
          <ThemeSwitch />
          <Button variant="outline" className="rounded-full" size="sm" asChild>
            <Link href="/sign-in">Ienākt</Link>
          </Button>
        </div>
      </nav>

      <div className="flex w-full max-w-xl flex-1 flex-col items-center justify-center space-y-4">
        <Badge className="gap-1 mb-2" variant="outline">
          <svg aria-hidden="true" className="text-emerald-600" width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.00016 11.1998L2.80016 7.99984L1.86683 8.93317L6.00016 13.0665L15.0002 4.0665L14.0668 3.13317L6.00016 11.1998Z" fill="currentColor"/></svg>
          Informācijas platforma
        </Badge>
        <header className="space-y-3">
          <h1 className="text-3xl leading-tight font-bold lg:text-5xl xl:text-6xl">Expertu meklētājs.</h1>
          <p className="text-muted-foreground text-sm">
            Šeit var atrast uzticamu informāciju ar MI.
          </p>
        </header>
        <div className="bg-muted mt-4 w-full space-y-4 overflow-hidden rounded-xl focus-within:ring-2 focus-within:ring-white/40">
          <Textarea
            placeholder="Kas nepieciešams atrast?"
            rows={3}
            className="min-h-16 resize-none border-0 bg-transparent! p-4 pb-0 shadow-none focus-visible:ring-0 text-sm placeholder:text-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Add"
                className="rounded-full"
              >
                <Plus />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Find nearby items"
                onClick={activateLocation}
                className={cn(
                  "rounded-full transition-colors",
                  hasActiveLocation && "bg-primary/10 text-primary border-primary/40",
                )}
              >
                <Locate
                  className={cn(
                    "transition-transform",
                    locationState.status === "loading" && "animate-pulse",
                  )}
                />
              </Button>
            </div>
            <Button size="icon-sm" aria-label="Send" className="rounded-full">
              <ArrowRight />
            </Button>
          </div>
        </div>

        {trimmedQuery.length > 0 ? (
          <div className="bg-muted/70 mt-3 w-full rounded-xl border border-border/60 p-3 text-left">
            {searchResults === undefined ? (
              <p className="text-muted-foreground text-xs">Meklējam ekspertus...</p>
            ) : visibleResults.length === 0 ? (
              <p className="text-muted-foreground text-xs">Nekas netika atrasts.</p>
            ) : (
              <ul className="space-y-2">
                {visibleResults.slice(0, 5).map((result) => (
                  <li key={result._id} className="flex items-center justify-between rounded-lg bg-background/80 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{result.displayName ?? "Bez nosaukuma"}</p>
                      <p className="text-muted-foreground text-xs">{result.city ?? "Atrašanās vieta nav norādīta"}</p>
                    </div>
                    {typeof result._distanceKm === "number" ? (
                      <span className="text-muted-foreground text-xs">{result._distanceKm.toFixed(1)} km</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

      </div>

      <footer
        className="w-full flex flex-col items-center justify-center text-center text-muted-foreground text-xs pb-3 pt-6 md:pb-5 md:pt-0 mt-10 md:mt-16"
      >
        <div className="w-full flex flex-col items-center justify-center text-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>&copy; {new Date().getFullYear()} Zoptero</span>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:text-primary no-underline">Par mums</Link>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:text-primary no-underline">Kontakti</Link>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:text-primary no-underline">Privātuma politika</Link>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:text-primary no-underline">Sīkdatņu politika</Link>
          </div>
        </div>
      </footer>
    </section>
  );
}
