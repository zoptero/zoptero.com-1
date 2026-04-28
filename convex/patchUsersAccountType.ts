import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const patchUsersAccountType = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let patched = 0;
    for (const user of users) {
      if (user.accountType !== "b2c" && user.accountType !== "b2b") {
        await ctx.db.patch(user._id, { accountType: "b2c" });
        patched++;
      }
    }
    return { patched };
  },
});
