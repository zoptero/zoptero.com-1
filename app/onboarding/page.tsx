// app/onboarding/page.tsx
"use client";


import OnboardingCards from "@/components/OnboardingCards";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const setAccountType = useMutation(api.onboarding.setAccountTypeForUserAndProfile);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async (selected: string) => {
    console.log("[Onboarding] handleContinue called with selected:", selected);
    console.log("[Onboarding] User:", user);
    console.log("[Onboarding] User email:", user?.emailAddresses[0]?.emailAddress);
    console.log("[Onboarding] User name:", user?.fullName);
    console.log("[Onboarding] User avatar:", user?.imageUrl);
    
    if (!user) {
      console.error("[Onboarding] User not found");
      setError("User not found");
      return;
    }

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
      // Imperative redirect - happens immediately after successful mutation
      console.log("[Onboarding] About to call router.push('/dashboard')");
      router.push('/dashboard');
      console.log("[Onboarding] router.push called successfully");
    } catch (err) {
      console.error("[Onboarding] Error during onboarding:", err);
      setError(err instanceof Error ? err.message : "Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <OnboardingCards onContinue={handleContinue} error={error} isSubmitting={isSubmitting} />
    </div>
  );
}
