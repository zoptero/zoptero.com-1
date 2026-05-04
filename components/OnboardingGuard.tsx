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
  const { isOptimisticRedirecting, setIsOptimisticRedirecting } = useOnboarding();
  const hasRedirected = useRef(false);
  const preloadedStatusRef = useRef(preloadedStatus);
  
  // Update ref when preloadedStatus changes
  if (preloadedStatus !== preloadedStatusRef.current) {
    preloadedStatusRef.current = preloadedStatus;
  }

  // Reactive redirect when onboarding status changes
  useEffect(() => {
    // Only redirect if not already redirecting and haven't redirected yet
    if (!isOptimisticRedirecting && !hasRedirected.current) {
      if (onboardingStatus?.status === "complete") {
        console.log("[Onboarding Guard] Onboarding complete, redirecting to dashboard");
        hasRedirected.current = true;
        router.replace("/dashboard");
      } else if (onboardingStatus?.status === "not_logged_in") {
        console.log("[Onboarding Guard] User not logged in, redirecting to sign-in");
        hasRedirected.current = true;
        router.replace("/sign-in");
      }
    }
  }, [onboardingStatus?.status, isOptimisticRedirecting, router]);

  // Helper to check if status is complete
  const isComplete = onboardingStatus?.status === "complete";
  const isNotLoggedIn = onboardingStatus?.status === "not_logged_in";

  // DIAGNOSTIC LOGGING
  console.log("[Onboarding Guard] Guard check:", {
    status: onboardingStatus?.status,
    isLoading: onboardingStatus === undefined,
    isComplete: onboardingStatus?.status === "complete",
    isIncomplete: onboardingStatus?.status === "incomplete",
    isNotLoggedIn: onboardingStatus?.status === "not_logged_in",
    isOptimisticRedirecting,
  });

  // Layout Guard: Wait for query to resolve before checking status
  if (onboardingStatus === undefined) {
    console.log("[Onboarding Guard] Query still loading, showing skeleton");
    return (
      <div className="absolute inset-0 flex items-center justify-center w-full h-full">
        <OnboardingSkeleton />
      </div>
    );
  }

  // Layout Guard: If user is redirecting (optimistic redirect), redirect immediately
  if (isOptimisticRedirecting) {
    console.log("[Onboarding Guard] Optimistic redirect triggered, redirecting to dashboard");
    // Prevent multiple redirects by checking if we've already redirected
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      console.log("[Onboarding Guard] First redirect triggered, preventing duplicate redirects");
      // Use replace to avoid adding to history stack
      // This helps maintain the Clerk session during redirect
      router.replace("/dashboard");
    } else {
      console.log("[Onboarding Guard] Redirect already triggered, skipping duplicate");
    }
    return null;
  }

  // Layout Guard: If user has completed onboarding, redirect to dashboard
  if (onboardingStatus?.status === "complete") {
    console.log("[Onboarding Guard] Onboarding complete, redirecting to dashboard");
    // Prevent multiple redirects by checking if we've already redirected
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      console.log("[Onboarding Guard] First redirect triggered, preventing duplicate redirects");
      // Use replace to avoid adding to history stack
      // This helps maintain the Clerk session during redirect
      router.replace("/dashboard");
    } else {
      console.log("[Onboarding Guard] Redirect already triggered, skipping duplicate");
    }
    return null;
  }

  // Layout Guard: If user is not logged in, show loading spinner (prevents UI flicker)
  if (onboardingStatus?.status === "not_logged_in") {
    console.log("[Onboarding Guard] User not logged in, showing spinner during session reload");
    return (
      <div className="absolute inset-0 flex items-center justify-center w-full h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Otherwise, show the onboarding page
  console.log("[Onboarding Guard] Onboarding incomplete, showing onboarding page");
  return (
    <div className="absolute inset-0 flex items-center justify-center w-full h-full">
      <OnboardingCards onContinue={(selected: string) => {
        console.log("[Onboarding Guard] User selected:", selected);
        // The actual onboarding flow is handled by the parent component
      }} />
    </div>
  );
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
