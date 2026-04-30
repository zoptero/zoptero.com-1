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
    if (!user) {
      setError("User not found");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await setAccountType({
        accountType: selected as "b2b" | "b2c",
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || undefined,
        avatarUrl: user.imageUrl || undefined,
      });
      // Redirect to dashboard
      router.replace("/dashboard");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(err instanceof Error ? err.message : "Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <OnboardingCards onContinue={handleContinue} />
    </div>
  );
}
