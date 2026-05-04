// app/onboarding/page.tsx
"use client";

import OnboardingCards from "@/components/OnboardingCards";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useOnboarding } from "@/components/onboarding-context";

export default function OnboardingPage() {
  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();
  const setAccountType = useMutation(api.onboarding.setAccountTypeForUserAndProfile);
  const { setIsOptimisticRedirecting } = useOnboarding();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Query to check onboarding status (used for refresh mechanism)
  const onboardingStatus = useQuery(api.users.getOnboardingStatus);

  const handleContinue = async (selected: string) => {
    console.log("[Onboarding] handleContinue called with selected:", selected);
    console.log("[Onboarding] User:", user);
    
    if (!user) {
      console.error("[Onboarding] User not found");
      setError("User not found");
      return;
    }

    // OPTIMISTIC REDIRECT: Set redirect state immediately to prevent long spinner
    setIsOptimisticRedirecting(true);
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("[Onboarding] Calling setAccountType mutation...");
      const result = await setAccountType({
        accountType: selected as "b2b" | "b2c",
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || undefined,
        avatarUrl: user.imageUrl || undefined,
      });
      console.log("[Onboarding] Mutation result:", result);
      console.log("[Onboarding] Mutation successful, redirecting to dashboard...");
      
      // Client-side navigation to dashboard
      // Convex's reactivity will trigger OnboardingGuard redirect automatically
      // No need to manually reload session or navigate
      console.log("[Onboarding] About to navigate to dashboard");
      router.push("/dashboard");
      console.log("[Onboarding] router.push() called");
    } catch (err) {
      console.error("[Onboarding] Error during onboarding:", err);
      console.error("[Onboarding] Error details:", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError(err instanceof Error ? err.message : "Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center w-full h-full bg-white">
      <OnboardingCards onContinue={handleContinue} error={error} isSubmitting={isSubmitting} />
    </div>
  );
}
