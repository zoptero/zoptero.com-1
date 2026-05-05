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
    // 1. STRICT STATE MACHINE: Only process when status is fully loaded
    if (onboardingStatus === undefined) return;
    
    // 2. Prevent redundant redirects
    if (hasRedirected.current) return;

    // 3. Optimistic redirect (after button click) - happens BEFORE database update
    if (isOptimisticRedirecting) {
      hasRedirected.current = true;
      router.replace("/dashboard");
      return;
    }

    // 4. SERVER-SIDE REDIRECT: Only redirect if status is "complete" AND accountType is set
    // This is the authoritative check - if accountType is missing, we MUST stay on onboarding
    if (onboardingStatus.status === "complete" && onboardingStatus.accountType) {
      hasRedirected.current = true;
      router.replace("/dashboard");
    }
    // If status is "incomplete" or "syncing", we NEVER redirect - stay on onboarding
    // If status is "not_logged_in", we let the middleware handle the redirect to /sign-in
  }, [onboardingStatus, isOptimisticRedirecting, router]);

  // UI RENDERING: Show skeleton IMMEDIATELY (no Suspense delay)
  if (onboardingStatus === undefined) {
    return (
      <div className="absolute inset-0 flex items-center justify-center w-full h-full">
        <OnboardingSkeleton />
      </div>
    );
  }

  // Show syncing state
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

  // Show onboarding UI only if incomplete
  if (onboardingStatus.status === "incomplete") {
    return (
      <div className="absolute inset-0 flex items-center justify-center w-full h-full">
        {children}
      </div>
    );
  }

  // For all other states (complete with accountType, not_logged_in), return null
  // The useEffect will handle the redirect
  return null;
}

export function OnboardingGuard({ children, preloadedStatus }: OnboardingGuardProps) {
  return (
    <OnboardingProvider>
      {/* Remove Suspense wrapper to show skeleton immediately */}
      <GuardContent>{children}</GuardContent>
    </OnboardingProvider>
  );
}
