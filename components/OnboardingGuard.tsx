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

  // Diagnostic logging for status and redirecting state
  useEffect(() => {
    console.log("[OnboardingGuard] Status check:", {
      status: onboardingStatus?.status,
      isOptimisticRedirecting,
      hasRedirected: hasRedirected.current,
      isLoading: onboardingStatus === undefined
    });
  }, [onboardingStatus?.status, isOptimisticRedirecting, hasRedirected.current]);

  // Log when status changes from undefined to a value
  useEffect(() => {
    if (onboardingStatus !== undefined) {
      console.log("[OnboardingGuard] Status resolved:", onboardingStatus);
    }
  }, [onboardingStatus]);

  // Consolidated redirect logic in a single useEffect
  useEffect(() => {
    // Only redirect if not already redirecting and haven't redirected yet
    if (!isOptimisticRedirecting && !hasRedirected.current) {
      const status = onboardingStatus?.status;
      
      console.log("[OnboardingGuard] Redirect decision:", {
        status,
        isOptimisticRedirecting,
        willRedirect: status === "complete" || status === "not_logged_in"
      });

      if (status === "complete") {
        hasRedirected.current = true;
        console.log("[OnboardingGuard] Redirecting to /dashboard (status: complete)");
        router.replace("/dashboard");
      } else if (status === "not_logged_in") {
        hasRedirected.current = true;
        console.log("[OnboardingGuard] Redirecting to /sign-in (status: not_logged_in)");
        router.replace("/sign-in");
      }
    }
  }, [onboardingStatus?.status, isOptimisticRedirecting, router]);

  // Layout Guard: Wait for query to resolve before checking status
  if (onboardingStatus === undefined) {
    return (
      <div className="absolute inset-0 flex items-center justify-center w-full h-full">
        <OnboardingSkeleton />
      </div>
    );
  }

  // Layout Guard: If user is redirecting (optimistic redirect), redirect immediately
  if (isOptimisticRedirecting) {
    // Prevent multiple redirects by checking if we've already redirected
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      // Use replace to avoid adding to history stack
      // This helps maintain the Clerk session during redirect
      console.log("[OnboardingGuard] Optimistic redirect to /dashboard");
      router.replace("/dashboard");
    }
    return null;
  }

  // Layout Guard: If user has completed onboarding, redirect to dashboard
  if (onboardingStatus?.status === "complete") {
    // Prevent multiple redirects by checking if we've already redirected
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      // Use replace to avoid adding to history stack
      // This helps maintain the Clerk session during redirect
      console.log("[OnboardingGuard] Redirecting to /dashboard (status: complete)");
      router.replace("/dashboard");
    }
    return null;
  }

  // Layout Guard: If user is not logged in, show loading spinner (prevents UI flicker)
  if (onboardingStatus?.status === "not_logged_in") {
    return (
      <div className="absolute inset-0 flex items-center justify-center w-full h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Otherwise, show the onboarding page with the onContinue prop
  return (
    <div className="absolute inset-0 flex items-center justify-center w-full h-full">
      {children}
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
