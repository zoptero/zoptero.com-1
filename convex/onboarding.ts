import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
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
 * Action to update Clerk user metadata
 * This is a separate action to allow fetch() usage
 * Runs non-blocking to avoid blocking database transactions
 */
export const updateClerkMetadata = action({
  args: {
    clerkId: v.string(),
    onboardingComplete: v.boolean(),
  },
  handler: async (ctx, args) => {
    try {
      // Get Clerk client instance
      const clerkClient = getClerkClient();
      
      // Non-blocking: don't await to prevent blocking database transactions
      const result = await clerkClient.users.updateUserMetadata(args.clerkId, {
        publicMetadata: { onboardingComplete: args.onboardingComplete },
      });
      console.log(`[Clerk] Successfully updated metadata for user ${args.clerkId}: onboardingComplete=${args.onboardingComplete}`, result);
    } catch (error: any) {
      console.error(`[Clerk] Failed to update metadata for user ${args.clerkId}:`, {
        message: error.message,
        status: error.status,
        errors: error.errors,
        name: error.name,
        clerkId: args.clerkId,
        onboardingComplete: args.onboardingComplete
      });
      // Don't throw - this is optional and the onboarding can still complete
      // The user data is already saved to Convex, so they can still use the app
    }
  },
});

/**
 * Atomically updates both the users and profiles tables with the selected accountType.
 * Call this from onboarding to keep both tables in sync.
 * Offloads Clerk metadata update to a separate action using scheduler.
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

    // Update users table - create if doesn't exist
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    
    if (user) {
      // User exists - update it
      await ctx.db.patch(user._id, {
        accountType: args.accountType,
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        onboardingComplete: true,
      });
    } else {
      // User doesn't exist - create it
      await ctx.db.insert("users", {
        clerkId,
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        accountType: args.accountType,
        onboardingComplete: true,
        createdAt: Date.now(),
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

    // Sync to Clerk metadata to ensure middleware can check status
    // This is non-blocking and won't fail the onboarding if it fails
    // Use scheduler.runAfter to offload the network request to a separate action
    try {
      await ctx.scheduler.runAfter(0, api.onboarding.updateClerkMetadata, {
        clerkId,
        onboardingComplete: true,
      });
    } catch (error: any) {
      // Don't throw - this is critical for the redirect to work
      // The onboarding should still succeed, but the user might see a redirect loop
    }

    return null;
  },
});
