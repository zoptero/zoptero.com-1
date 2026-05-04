"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("[Onboarding Error] An error occurred during onboarding:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });

    // TODO: Add error tracking to external service (e.g., Sentry)
    // if (typeof window !== "undefined" && window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Radās kļūda</CardTitle>
          <CardDescription className="text-base">
            Mēģināt ielādēt onbordingu radīja problēmu. Lūdzu, mēģiniet vēlreiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Ja problēma turpinās, lūdzu, atjaunojiet lapu vai sazinieties ar atbalsta komandu.
          </p>
          <Button onClick={reset} className="w-full">
            Mēģināt vēlreiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}