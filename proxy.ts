import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']);

export default clerkMiddleware(async (auth, req) => {
  // Fix: await auth() and only destructure userId
  const { userId } = await auth();
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/onboarding') || req.nextUrl.pathname.startsWith('/dashboard');

  if (!userId && isProtectedRoute) {
    return (await auth()).redirectToSignIn();
  }
});

export const config = {
  matcher: ['/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
