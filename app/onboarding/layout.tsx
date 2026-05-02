"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

  function OnboardingLayoutContent({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const router = useRouter();
    const onboardingStatus = useQuery(api.users.getOnboardingStatus);

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
      // Use replace to avoid adding to history stack
      // This helps maintain the Clerk session during redirect
      router.replace("/dashboard");
      return null;
    }

    // Layout Guard: If user is not logged in, show nothing (shouldn't happen)
    if (onboardingStatus?.status === "not_logged_in") {
      console.log("[Onboarding Layout] User not logged in, showing nothing");
      return null;
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
