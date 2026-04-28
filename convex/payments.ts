import { internalMutation } from "./_generated/server";

import { v } from "convex/values";

export const updateProStatus = internalMutation({
  args: { clerkId: v.string(), isPro: v.boolean() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { isPro: args.isPro });
    return { success: true };
  },
});
