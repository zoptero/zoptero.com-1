
import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/onboarding') || req.nextUrl.pathname.startsWith('/dashboard');

  if (!userId && isProtectedRoute) {
    return (await auth()).redirectToSignIn();
  }

  // Redirect newly created users to /onboarding
  if (userId && req.nextUrl.pathname.startsWith('/dashboard')) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (user && user.createdAt && user.updatedAt && String(user.createdAt) === String(user.updatedAt)) {
      return Response.redirect(new URL('/onboarding', req.url));
    }
  }
});

export const config = {
  matcher: ['/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
