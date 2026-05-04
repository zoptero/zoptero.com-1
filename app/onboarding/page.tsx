// app/onboarding/page.tsx
"use client";

import OnboardingCards from "@/components/OnboardingCards";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  
  // Redirect to dashboard if onboarding is already complete
  useEffect(() => {
    if (onboardingStatus?.status === "complete") {
      router.replace("/dashboard");
    }
  }, [onboardingStatus, router]);
  
  // Prevent re-submission if already complete
  if (onboardingStatus?.status === "complete") {
    return null;
  }

  const handleContinue = async (selected: string) => {
    if (!user) {
      setError("User not found");
      return;
    }

    // OPTIMISTIC REDIRECT: Set redirect state immediately to prevent long spinner
    setIsOptimisticRedirecting(true);
    setIsSubmitting(true);
    setError(null);

    try {
      await setAccountType({
        accountType: selected as "b2b" | "b2c",
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || undefined,
        avatarUrl: user.imageUrl || undefined,
      });
      
      // NOTE: We do NOT call router.push here. The OnboardingGuard will handle
      // the redirect reactively based on the updated onboardingStatus.
      // This prevents navigation conflicts between the page and the guard.
    } catch (err) {
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
