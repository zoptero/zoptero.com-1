"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function OnboardingLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const onboardingStatus = useQuery(api.users.getOnboardingStatus);

  useEffect(() => {
    // If user is not logged in, let Clerk handle the redirect
    if (onboardingStatus?.status === "not_logged_in") {
      return;
    }

    // If user is on /onboarding and has completed onboarding, redirect to dashboard
    if (onboardingStatus?.status === "complete" && pathname === "/onboarding") {
      router.replace("/dashboard");
    }
  }, [onboardingStatus, pathname, router]);

  // Show loading state while query is undefined (during initial load)
  if (onboardingStatus === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If user is not logged in, let Clerk handle the redirect
  if (onboardingStatus?.status === "not_logged_in") {
    return null;
  }

  // If user is syncing (race condition), show loading state
  if (onboardingStatus?.status === "syncing") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If user has not completed onboarding, show the onboarding page
  if (onboardingStatus?.status === "incomplete") {
    return <>{children}</>;
  }

  // If user has completed onboarding and is on /onboarding, redirect to dashboard
  if (onboardingStatus?.status === "complete" && pathname === "/onboarding") {
    router.replace("/dashboard");
    return null;
  }

  // Fallback: show children
  return <>{children}</>;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingLayoutContent>{children}</OnboardingLayoutContent>;
}
