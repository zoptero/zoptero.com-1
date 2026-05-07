import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST(request: NextRequest) {
  try {
    const { slug, clerkId } = await request.json();

    if (!slug || !clerkId) {
      return NextResponse.json(
        { error: "Missing slug or clerkId" },
        { status: 400 }
      );
    }

    // Use ConvexHttpClient to query the checkSlugAvailability function
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");
    const result = await client.query(api.profiles.checkSlugAvailability, {
      slug,
      clerkId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Slug check error:", error);
    return NextResponse.json(
      { error: "Failed to check slug availability", details: String(error) },
      { status: 500 }
    );
  }
}
