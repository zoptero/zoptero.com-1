"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OnboardingProvider, useOnboarding } from "@/components/onboarding-context";
import { OnboardingSkeleton } from "@/components/OnboardingSkeleton";
import OnboardingCards from "@/components/OnboardingCards";

interface OnboardingGuardProps {
  children: React.ReactNode;
  preloadedStatus?: Preloaded<typeof api.users.getOnboardingStatus>;
}

function GuardContent({ children, preloadedStatus }: { children: React.ReactNode; preloadedStatus?: Preloaded<typeof api.users.getOnboardingStatus> }) {
  const router = useRouter();
  const onboardingStatus = useQuery(api.users.getOnboardingStatus);
  const { isOptimisticRedirecting } = useOnboarding();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // 1. Ja vēl lādējas, neko nedarām
    if (onboardingStatus === undefined) return;
    
    // 2. Ja jau esam redirektējuši, neko nedarām
    if (hasRedirected.current) return;

    // 3. Optimistiskais redirekts (pēc pogas nospiešanas)
    if (isOptimisticRedirecting) {
      hasRedirected.current = true;
      router.replace("/dashboard");
      return;
    }

    // 4. Servera statusa redirekts
    if (onboardingStatus.status === "complete") {
      hasRedirected.current = true;
      router.replace("/dashboard");
    } else if (onboardingStatus.status === "not_logged_in") {
      hasRedirected.current = true;
      router.replace("/sign-in");
    }
  }, [onboardingStatus?.status, router]);

  // UI RENDERING:
  // Ja lādējas - skelets
  if (onboardingStatus === undefined) {
    return (
      <div className="absolute inset-0 flex items-center justify-center w-full h-full">
        <OnboardingSkeleton />
      </div>
    );
  }

  // Ja lietotājs ielādēts, bet status ir 'syncing', rādām sinhronizācijas indikatoru
  if (onboardingStatus.status === "syncing") {
    return (
      <div className="absolute inset-0 flex items-center justify-center w-full h-full">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Sinhronizējam profilu...</div>
          <div className="text-sm text-gray-500">Lūdzu, uzgaidiet</div>
        </div>
      </div>
    );
  }

  // Ja lietotājs ielādēts, bet status ir 'incomplete', rādām onbordingu.
  // Pārējos gadījumos (ja būs redirekts) renderējam null, 
  // jo useEffect jau izpildīs router.replace.
  if (onboardingStatus.status === "incomplete") {
    return (
      <div className="absolute inset-0 flex items-center justify-center w-full h-full">
        {children}
      </div>
    );
  }

  return null;
}

export function OnboardingGuard({ children, preloadedStatus }: OnboardingGuardProps) {
  return (
    <OnboardingProvider>
      <Suspense fallback={<OnboardingSkeleton />}>
        <GuardContent>{children}</GuardContent>
      </Suspense>
    </OnboardingProvider>
  );
}
