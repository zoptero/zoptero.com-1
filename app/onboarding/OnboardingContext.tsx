"use client";

import { createContext, useContext, ReactNode, useState } from "react";

type OnboardingContextType = {
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  return (
    <OnboardingContext.Provider value={{ onboardingComplete, setOnboardingComplete }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}