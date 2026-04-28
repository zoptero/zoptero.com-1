"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function DashboardDefaultPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;
    // If user is new (createdAt === updatedAt), redirect to onboarding
    if (user.createdAt === user.updatedAt) {
      router.replace("/onboarding");
    }
    // else, show dashboard (do nothing)
  }, [isLoaded, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <h1 className="text-2xl font-bold">Welcome to your dashboard!</h1>
    </div>
  );
}
