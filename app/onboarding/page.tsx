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
    console.log("[OnboardingPage] handleContinue called with selected:", selected);
    console.log("[OnboardingPage] User:", user);
    
    if (!user) {
      console.error("[OnboardingPage] User not found");
      setError("User not found");
      return;
    }

    // OPTIMISTIC REDIRECT: Set redirect state immediately to prevent long spinner
    console.log("[OnboardingPage] Setting optimistic redirect and submitting state");
    setIsOptimisticRedirecting(true);
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("[OnboardingPage] Calling setAccountType mutation with:", {
        accountType: selected as "b2b" | "b2c",
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || undefined,
        avatarUrl: user.imageUrl || undefined,
      });
      
      const result = await setAccountType({
        accountType: selected as "b2b" | "b2c",
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || undefined,
        avatarUrl: user.imageUrl || undefined,
      });
      
      console.log("[OnboardingPage] Mutation result:", result);
      console.log("[OnboardingPage] Mutation successful - OnboardingGuard will handle redirect");
      
      // NOTE: We do NOT call router.push here. The OnboardingGuard will handle
      // the redirect reactively based on the updated onboardingStatus.
      // This prevents navigation conflicts between the page and the guard.
    } catch (err) {
      console.error("[OnboardingPage] Error during onboarding:", err);
      setError(err instanceof Error ? err.message : "Failed to complete onboarding");
    } finally {
      console.log("[OnboardingPage] Resetting submitting state");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center w-full h-full bg-white">
      <OnboardingCards onContinue={handleContinue} error={error} isSubmitting={isSubmitting} />
    </div>
  );
}
