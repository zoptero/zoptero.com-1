import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/onboarding(.*)",
]);

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/(api|trpc)(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Public routes are accessible without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protected routes require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // All other routes are handled by Next.js default behavior
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protect all routes except static files and Next.js internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};