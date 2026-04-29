"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DashboardDefaultPage() {
	const { user, isLoaded } = useUser();
	const router = useRouter();
	const me = useQuery(api.users.getMe, {});

	useEffect(() => {
		if (!isLoaded || !user || me === undefined) return;
		// If onboarding is not complete, redirect to onboarding
		if (!me || me.onboardingComplete === false) {
			router.replace("/onboarding");
		}
		// else, show dashboard (do nothing)
	}, [isLoaded, user, me, router]);

	if (!isLoaded || !user || me === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background px-4">
				<span>Loading...</span>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<h1 className="text-2xl font-bold">Welcome to your dashboard!</h1>
		</div>
	);
}
