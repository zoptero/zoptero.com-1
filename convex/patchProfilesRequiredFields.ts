import { mutation } from "./_generated/server";

// One-time migration: Ensure all profiles have required fields
export const patchProfilesRequiredFields = mutation(async ({ db }) => {
  const profiles = await db.query("profiles").collect();
  let updated = 0;
  for (const profile of profiles) {
    const patch: Record<string, any> = {};
    if (typeof profile.onlineStatus !== "boolean") patch.onlineStatus = true;
    if (!Array.isArray(profile.strongKeywords)) patch.strongKeywords = [];
    if (Object.keys(patch).length > 0) {
      await db.patch(profile._id, patch);
      updated++;
    }
  }
  return { updated };
});
