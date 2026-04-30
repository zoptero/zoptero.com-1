// Public actions for webhooks and API routes
// This file is separate to avoid circular dependency issues

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Public action for webhooks to sync users
export const syncUserPublic = (action as any)({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
    accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx: any, args: any) => {
    return await ctx.runMutation(internal.users.syncUser, args);
  },
});

// Public action to allow API routes to trigger cascade deletion
export const deleteUserCascadePublic = (action as any)({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx: any, args: any) => {
    // Optionally, add a secret check here for extra security
    await ctx.runAction(internal.users.deleteUserCascadeInternal, { clerkId: args.clerkId });
    return null;
  },
});
