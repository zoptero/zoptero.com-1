import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
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
 * Runs non-blocking to avoid blocking database transactions
 * This is optional - if it fails, the onboarding can still complete
 */
async function syncClerkMetadata(clerkId: string, onboardingComplete: boolean) {
  try {
    // Get Clerk client instance
    const clerkClient = getClerkClient();
    
    // Non-blocking: don't await to prevent blocking database transactions
    const result = await clerkClient.users.updateUserMetadata(clerkId, {
      publicMetadata: { onboardingComplete },
    });
    console.log(`[Clerk] Successfully updated metadata for user ${clerkId}: onboardingComplete=${onboardingComplete}`, result);
  } catch (error: any) {
    console.error(`[Clerk] Failed to update metadata for user ${clerkId}:`, {
      message: error.message,
      status: error.status,
      errors: error.errors,
      name: error.name,
      clerkId: clerkId,
      onboardingComplete: onboardingComplete
    });
    // Don't throw - this is optional and the onboarding should still succeed
    // The user data is already saved to Convex, so they can still use the app
  }
}

/**
 * Atomically updates both the users and profiles tables with the selected accountType.
 * Call this from onboarding to keep both tables in sync.
 */
export const setAccountTypeForUserAndProfile = mutation({
  args: {
    accountType: v.union(v.literal("b2c"), v.literal("b2b")),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const clerkId = identity.subject;

    // Update users table
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (user) {
      await ctx.db.patch(user._id, {
        accountType: args.accountType,
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        onboardingComplete: true,
      });
    }

    // Update all profiles for this user
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .collect();
    for (const profile of profiles) {
      await ctx.db.patch(profile._id, {
        accountType: args.accountType,
      });
    }

    // Clerk metadata sync is now handled separately via webhook
    // This mutation only updates the Convex database
    // The onboardingComplete flag is set above

    return null;
  },
});
