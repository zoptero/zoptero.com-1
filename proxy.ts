import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Only redirect /dashboard to /dashboard/default, leave root (/) as home
  if (request.nextUrl.pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/dashboard/default", request.url));
  }
  // For root, do nothing (let Next.js serve /)
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/"]
};
