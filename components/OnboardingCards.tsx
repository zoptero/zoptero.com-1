"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FadeInSlide from "@/components/FadeInSlide";

const options = [
  { value: "b2c", title: "Individuāls speciālists", description: "Neatkarīgs eksperts vai meistars.", badge: "B2C" },
  { value: "b2b", title: "B2B Uzņēmums", description: "Uzņēmums, aģentūra vai komanda", badge: "B2B" },
];

export default function OnboardingCards({ onContinue, error, isSubmitting }: { onContinue?: (selected: string) => void, error?: string | null, isSubmitting?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex h-screen h-[100svh] h-[100dvh] w-full items-center justify-center overflow-hidden px-4 py-4 sm:py-6">
      <div className="flex w-full max-w-2xl flex-col items-center gap-5 sm:gap-6">
        {/* Badge and Title Section - Staggered Animation */}
        <FadeInSlide delay={0} className="flex w-full flex-col items-center">
          <Badge className="gap-1 mb-2" variant="outline">
            <svg aria-hidden="true" className="text-emerald-600" width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.00016 11.1998L2.80016 7.99984L1.86683 8.93317L6.00016 13.0665L15.0002 4.0665L14.0668 3.13317L6.00016 11.1998Z" fill="currentColor"/></svg>
            Informācijas platforma
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-center mb-2">Es darbošos kā</h1>
          <p className="text-muted-foreground text-sm text-center">Izvēlies piemērotāko veidu</p>
        </FadeInSlide>
        
        {/* Error Display - Staggered Animation */}
        {error && (
          <FadeInSlide delay={0.1} className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
            {error}
          </FadeInSlide>
        )}
        
        {/* Cards Section - Staggered Animation */}
        <FadeInSlide delay={0.2} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              className="text-left h-full"
              style={{ minHeight: '220px' }}
            >
              <Card
                className={["transition-all h-full min-h-[220px] flex flex-col justify-between", selected === option.value ? "border-green-600" : "border-foreground/10"].join(" ")}
              >
                <CardHeader className="flex-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between h-full">
                    <div className="flex-1">
                      <Badge className="mb-2" variant="outline">
                        {option.badge}
                      </Badge>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription className="mt-1">{option.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </button>
          ))}
        </FadeInSlide>
        
        {/* Action Button - Staggered Animation */}
        <FadeInSlide delay={0.3}>
          <Button
            size="lg"
            disabled={!selected || isSubmitting}
            className="mt-1"
            onClick={() => {
              if (selected) {
                onContinue?.(selected);
              }
            }}
          >
            {isSubmitting ? "Veidojam lietotāju" : "Turpināt"}
          </Button>
        </FadeInSlide>
      </div>
    </div>
  );
}