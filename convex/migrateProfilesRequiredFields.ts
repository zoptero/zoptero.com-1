import { mutation } from "./_generated/server";
import { v } from "convex/values";

// One-time migration: Ensure all profiles have required fields
export const migrateProfilesRequiredFields = mutation(async ({ db }) => {
  const profiles = await db.query("profiles").collect();
  let updated = 0;
  for (const profile of profiles) {
    const patch: Record<string, any> = {};
    if (typeof profile.onlineStatus !== "boolean") patch.onlineStatus = true;
    if (!Array.isArray(profile.strongKeywords)) patch.strongKeywords = [];
    if (Object.keys(patch).length > 0) {
      await db.patch(profile._id, patch);
      // Schedule embedding recalculation
      await db.scheduler.runAfter(0, internal.ai.generateProfileEmbedding, {
        profileId: profile._id,
      });
      updated++;
    }
  }
  return { updated };
});
