import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import { internal } from '@/convex/_generated/api';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

// Use Convex URL from env
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  // Step 1: ALWAYS verify the webhook signature - NEVER skip this
  let evt;
  try {
    evt = await verifyWebhook(req); // uses CLERK_WEBHOOK_SECRET env var
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Verification failed', { status: 400 });
  }

  // Step 2: Listen for user.deleted event
  if (evt.type === 'user.deleted') {
    const { id } = evt.data;
    if (!id || typeof id !== 'string') {
      console.error('Missing or invalid Clerk user id in webhook event:', id);
      return new Response('Invalid Clerk user id', { status: 400 });
    }
    try {
      // Step 3: Call Convex public action to cascade delete user
      await convex.action(api.users.deleteUserCascadePublic, { clerkId: id });
    } catch (err) {
      console.error('Convex cascade deletion failed:', err);
      return new Response('Convex deletion failed', { status: 500 });
    }
  }

  // Always return 200 to acknowledge receipt
  return new Response('OK', { status: 200 });
}
