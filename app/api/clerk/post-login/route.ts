import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { createClerkClient } from "@clerk/backend";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

// Initialize Clerk client for backend operations
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Create Convex HTTP client for server-side operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    // Get headers for signature verification
    const headerStore = await headers();
    const svixId = headerStore.get("svix-id");
    const svixTimestamp = headerStore.get("svix-timestamp");
    const svixSignature = headerStore.get("svix-signature");

    // Verify required headers
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("[Post-Login] Missing svix headers");
      return NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 }
      );
    }

    // Get the body
    const body = await req.text();

    // Verify webhook signature
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[Post-Login] Missing CLERK_WEBHOOK_SECRET");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const wh = new Webhook(secret);
    let event: any;

    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("[Post-Login] Signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle user.created and user.updated events
    if (event.type === "user.created" || event.type === "user.updated") {
      const userData = event.data;
      const clerkId = userData.id;

      if (!clerkId) {
        console.error("[Post-Login] Missing user ID in event");
        return NextResponse.json(
          { error: "Missing user ID" },
          { status: 400 }
        );
      }

      // Extract user data
      const primaryEmail = userData.email_addresses?.[0]?.email_address;
      const name = [userData.first_name, userData.last_name]
        .filter(Boolean)
        .join(" ") || userData.username;
      const avatarUrl = userData.image_url;

      if (!primaryEmail) {
        console.error("[Post-Login] Missing email for user:", clerkId);
        return NextResponse.json(
          { error: "Missing email" },
          { status: 400 }
        );
      }

      console.log(
        `[Post-Login] Syncing user ${clerkId} (${event.type})`,
        { email: primaryEmail, name }
      );

      // Call ensureCurrentUser mutation to sync user to Convex
      // This happens server-side, avoiding race conditions
      const startTime = Date.now();
      
      await convex.mutation(api.users.ensureCurrentUser, {
        email: primaryEmail,
        name,
        avatarUrl,
      });

      const latency = Date.now() - startTime;
      console.log(
        `[Post-Login] User sync completed in ${latency}ms for user ${clerkId}`
      );

      return NextResponse.json(
        { success: true, latency },
        { status: 200 }
      );
    }

    // Ignore other event types
    console.log(`[Post-Login] Ignoring event type: ${event.type}`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Post-Login] Handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}