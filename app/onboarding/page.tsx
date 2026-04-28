// app/onboarding/page.tsx
"use client";

import OnboardingCards from "@/components/OnboardingCards";

export default function OnboardingPage() {
  const handleContinue = (selected: string) => {
    // TODO: Replace with Convex mutation and redirect logic
    console.log("Selected account type:", selected);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <OnboardingCards onContinue={handleContinue} />
    </div>
  );
}
