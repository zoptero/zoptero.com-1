import { Suspense } from "react";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { OnboardingProvider } from "@/components/onboarding-context";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { OnboardingSkeleton } from "@/components/OnboardingSkeleton";

// Server component to preload onboarding status
async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Preload the onboarding status on the server
  const preloadedStatus = await preloadQuery(api.users.getOnboardingStatus);

   return (
    <OnboardingProvider>
      <Suspense fallback={<OnboardingSkeleton />}>
        <OnboardingGuard preloadedStatus={preloadedStatus}>
          {children}
        </OnboardingGuard>
      </Suspense>
    </OnboardingProvider>
  );
}

export default OnboardingLayout;