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

  // Layout Guard: Wait for query to resolve before checking status
  if (onboardingStatus === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Layout Guard: If user has completed onboarding, redirect to dashboard
  if (onboardingStatus?.status === "complete") {
    // Use replace to avoid adding to history stack
    // This helps maintain the Clerk session during redirect
    router.replace("/dashboard");
    return null;
  }

  // Otherwise, show the onboarding page
  return <>{children}</>;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingLayoutContent>{children}</OnboardingLayoutContent>;
}
