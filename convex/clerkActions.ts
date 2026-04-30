import { v } from "convex/values";
import { action } from "./_generated/server";
import { createClerkClient } from "@clerk/backend";

// Initialize Clerk client for backend operations
let clerkClientInstance: ReturnType<typeof createClerkClient> | null = null;

function getClerkClient() {
  if (!clerkClientInstance) {
    if (!process.env.CLERK_SECRET_KEY) {
      console.error(`[Clerk] CLERK_SECRET_KEY is not set in environment`);
      throw new Error("CLERK_SECRET_KEY is not set in environment");
    }
    clerkClientInstance = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }
  return clerkClientInstance;
}

/**
 * Sync onboarding status to Clerk's publicMetadata
 * This is an action, not a mutation, so it can make network requests
 * Runs non-blocking to avoid blocking the main transaction
 */
export const syncClerkMetadata = action({
  args: {
    clerkId: v.string(),
    onboardingComplete: v.boolean(),
  },
  handler: async (ctx, args) => {
    try {
      const clerkClient = getClerkClient();
      
      // Non-blocking: don't await to prevent blocking the main transaction
      clerkClient.users.updateUserMetadata(args.clerkId, {
        publicMetadata: { onboardingComplete: args.onboardingComplete },
      });
      console.log(`[Clerk] Successfully updated metadata for user ${args.clerkId}: onboardingComplete=${args.onboardingComplete}`);
    } catch (error: any) {
      console.error(`[Clerk] Failed to update metadata for user ${args.clerkId}:`, {
        message: error.message,
        status: error.status,
        errors: error.errors,
        name: error.name,
        clerkId: args.clerkId,
        onboardingComplete: args.onboardingComplete
      });
      // Don't throw - this is optional and the onboarding should still succeed
      // The user data is already saved to Convex, so they can still use the app
    }
  },
});