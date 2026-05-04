import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import Stripe from "stripe";

const http = httpRouter();

function getPrimaryEmailAddress(userData: any) {
  // 1. Try finding by primary_email_address_id
  if (userData.primary_email_address_id && Array.isArray(userData.email_addresses)) {
    const primary = userData.email_addresses.find(
      (email: any) => email.id === userData.primary_email_address_id
    );
    if (primary?.email_address) return primary.email_address;
  }

  // 2. Fallback to first email in the list
  if (Array.isArray(userData.email_addresses) && userData.email_addresses.length > 0) {
    return userData.email_addresses[0].email_address;
  }

  // 3. Check for top-level fields (common in some API responses or manual tests)
  return userData.email_address || userData.email || undefined;
}

// Clerk Webhook
http.route({
  path: "/api/webhooks/clerk",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.text();

    try {
      const secret = process.env.CLERK_WEBHOOK_SECRET;
      if (!secret) {
        throw new Error("Missing CLERK_WEBHOOK_SECRET");
      }

      const svixId = req.headers.get("svix-id");
      const svixTimestamp = req.headers.get("svix-timestamp");
      const svixSignature = req.headers.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        throw new Error("Missing svix headers");
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
        console.error("[Clerk Webhook] Signature verification failed");
        return new Response(null, { status: 400 });
      }

      if (event?.object !== "event") {
        return new Response(null, { status: 400 });
      }

      // Handle user.deleted event for hard delete
      if (event.type === "user.deleted") {
        const deletedClerkId = event.data?.id;
        
        if (!deletedClerkId) {
          return new Response("Missing user id in user.deleted event", { status: 400 });
        }

        try {
          await ctx.runAction(internal.users.deleteUserCascadeInternal, {
            clerkId: deletedClerkId,
          });
        } catch (err) {
          console.error("[Clerk Webhook] Error triggering cascade deletion", err);
          return new Response("Error deleting user in Convex", { status: 500 });
        }
        return new Response(null, { status: 200 });
      }

      if (event.type !== "user.created" && event.type !== "user.updated") {
        return new Response(null, { status: 200 });
      }

      const userData = event.data;
      const primaryEmail = getPrimaryEmailAddress(userData);

      if (!userData?.id || !primaryEmail) {
        console.error("[Clerk Webhook] Missing required user data (id or email)");
        return new Response("Missing required user data (id or email)", { status: 400 });
      }

      const name =
        [userData.first_name, userData.last_name].filter(Boolean).join(" ") ||
        userData.username ||
        undefined;

      await ctx.runMutation(internal.users.syncUser, {
        clerkId: userData.id,
        email: primaryEmail,
        name,
        avatarUrl: userData.image_url,
        accountType: userData.public_metadata?.accountType,
      });
      
      return new Response(null, { status: 200 });
    } catch (err) {
      console.error("[Clerk Webhook] Handler error", err);
      return new Response(null, { status: 400 });
    }
  }),
});


// Stripe Webhook
http.route({
  path: "/api/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!stripeSecret || !webhookSecret) {
        throw new Error("Missing Stripe configuration");
      }

      const stripe = new Stripe(stripeSecret, {
        apiVersion: "2025-01-27-preview" as any, // Use the latest or preferred version
      });

      const sig = req.headers.get("stripe-signature");
      if (!sig) return new Response("Missing signature", { status: 400 });

      const buf = await req.arrayBuffer();
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          Buffer.from(buf),
          sig,
          webhookSecret
        );
      } catch (err) {
        console.error("Stripe webhook signature verification failed", err);
        return new Response(null, { status: 400 });
      }

      if (
        event.type === "checkout.session.completed" ||
        event.type === "invoice.payment_succeeded"
      ) {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkId = session.metadata?.userId;
        if (clerkId) {
          await ctx.runMutation(internal.payments.updateProStatus, {
            clerkId,
            isPro: true,
          });
        }
      }
      return new Response(null, { status: 200 });
    } catch (err) {
      console.error("Stripe webhook error", err);
      return new Response(null, { status: 400 });
    }
  }),
});

export default http;

