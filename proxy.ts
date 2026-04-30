import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Type for Clerk session claims with onboarding metadata
type ClerkSessionClaims = {
  publicMetadata?: {
    onboardingComplete?: boolean;
  };
};

const isPublicRoute = createRouteMatcher([
  "/", 
  "/sign-in(.*)", 
  "/sign-up(.*)", 
  "/onboarding(.*)"
]);

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Get session claims to check onboarding status
  const session = await auth() as { sessionClaims: ClerkSessionClaims };
  const sessionClaims = session.sessionClaims;
  
  // Bi-directional onboarding guard using Clerk publicMetadata
  // O(1) performance - no network calls needed
  if (isDashboardRoute(req)) {
    // If user has completed onboarding, they should be on dashboard
    // If not, redirect to onboarding
    if (sessionClaims?.publicMetadata?.onboardingComplete !== true) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  // If user is on onboarding route and has completed onboarding, redirect to dashboard
  if (sessionClaims?.publicMetadata?.onboardingComplete === true) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  matcher: [
    // Protect all routes except static files and Next.js internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
