"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRef } from "react";

function OnboardingLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const onboardingStatus = useQuery(api.users.getOnboardingStatus);
  const hasRedirected = useRef(false);

  // DIAGNOSTIC LOGGING
  console.log("[Onboarding Layout] Guard check:", {
    status: onboardingStatus?.status,
    isLoading: onboardingStatus === undefined,
    isComplete: onboardingStatus?.status === "complete",
    isIncomplete: onboardingStatus?.status === "incomplete",
    isNotLoggedIn: onboardingStatus?.status === "not_logged_in",
    isSyncing: onboardingStatus?.status === "syncing",
  });

  // Layout Guard: Wait for query to resolve before checking status
  if (onboardingStatus === undefined) {
    console.log("[Onboarding Layout] Query still loading, showing spinner");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Layout Guard: If user has completed onboarding, redirect to dashboard
  if (onboardingStatus?.status === "complete") {
    console.log("[Onboarding Layout] Onboarding complete, redirecting to dashboard");
    // Prevent multiple redirects by checking if we've already redirected
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      console.log("[Onboarding Layout] First redirect triggered, preventing duplicate redirects");
      // Use replace to avoid adding to history stack
      // This helps maintain the Clerk session during redirect
      router.replace("/dashboard");
    } else {
      console.log("[Onboarding Layout] Redirect already triggered, skipping duplicate");
    }
    return null;
  }

  // Layout Guard: If user is not logged in, show loading spinner (prevents UI flicker)
  if (onboardingStatus?.status === "not_logged_in") {
    console.log("[Onboarding Layout] User not logged in, showing spinner during session reload");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Layout Guard: If user is syncing (race condition), show loading
  if (onboardingStatus?.status === "syncing") {
    console.log("[Onboarding Layout] User syncing, showing spinner");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Otherwise, show the onboarding page
  console.log("[Onboarding Layout] Onboarding incomplete, showing onboarding page");
  return <>{children}</>;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingLayoutContent>{children}</OnboardingLayoutContent>;
}