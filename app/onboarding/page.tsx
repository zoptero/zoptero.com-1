// app/onboarding/page.tsx
"use client";


import OnboardingCards from "@/components/OnboardingCards";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";


export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const setAccountType = useMutation(api.onboarding.setAccountTypeForUserAndProfile);

  const handleContinue = async (selected: string) => {
    if (!user) return;
    await setAccountType({
      accountType: selected,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: user.fullName || undefined,
      avatarUrl: user.imageUrl || undefined,
    });
    // Optionally, you may want to also set onboardingComplete in a separate mutation if needed
    router.replace("/dashboard/default");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <OnboardingCards onContinue={handleContinue} />
    </div>
  );
}
