import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const storeMediaKey = internalMutation({
  args: {
    clerkId: v.string(),
    fileKey: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { avatarKey: args.fileKey });
      return null;
    }

    await ctx.db.insert("profiles", {
      clerkId: args.clerkId,
      avatarKey: args.fileKey,
    });

    return null;
  },
});

export const getMediaKeyByClerkId = internalQuery({
  args: {
    clerkId: v.string(),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return existing?.avatarKey ?? existing?.mediaUrl ?? null;
  },
});
