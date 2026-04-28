import { v } from "convex/values";
import { mutation } from "./_generated/server";

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

    return null;
  },
});
