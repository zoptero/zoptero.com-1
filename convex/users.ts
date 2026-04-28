// Public action to allow API routes to trigger cascade deletion
export const deleteUserCascadePublic = action({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Optionally, add a secret check here for extra security
    await ctx.runAction(internal.users.deleteUserCascadeInternal, { clerkId: args.clerkId });
    return null;
  },
});
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalAction, internalMutation, mutation, query, type MutationCtx } from "./_generated/server";

// Utility to strip fields not in the profiles schema
function omitProfileSchemaExtras(obj: Record<string, any>) {
  const { onboardingComplete, secret, ...rest } = obj;
  return rest;
}

type AuthIdentity = NonNullable<
  Awaited<ReturnType<MutationCtx["auth"]["getUserIdentity"]>>
>;

async function requireIdentity(ctx: MutationCtx): Promise<AuthIdentity> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("Not authenticated");
  }

  return identity;
}

function normalizeEmail(email: string | undefined) {
  return email?.trim().toLowerCase();
}

function requireEmail(email: string | undefined, source: string) {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    throw new ConvexError(`Missing email for ${source}`);
  }

  return normalized;
}

function requireWebhookSecret(secret: string) {
  const expectedSecret = process.env.CLERK_WEBHOOK_SYNC_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    throw new ConvexError("Unauthorized webhook mutation call");
  }
}

async function syncByEmail(
  ctx: MutationCtx,
  input: {
    clerkId: string;
    email: string;
    name: string | undefined;
    avatarUrl: string | undefined;
    onboardingComplete?: boolean;
    accountType?: "b2c" | "b2b";
  }
) {
  const emailMatches = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", input.email))
    .collect();

  if (emailMatches.length === 0) {
    return null;
  }

  const sorted = [...emailMatches].sort((a, b) => a._creationTime - b._creationTime);
  const primary =
    sorted.find((row) => row.clerkId === input.clerkId) ??
    sorted[0];

  const mergedOnboardingComplete =
    input.onboardingComplete ??
    sorted.some((row) => row.onboardingComplete === true);
  const mergedAccountType =
    input.accountType ??
    primary.accountType ??
    sorted.find((row) => row.accountType !== undefined)?.accountType;

  await ctx.db.patch(primary._id, {
    clerkId: input.clerkId,
    email: input.email,
    name: input.name,
    avatarUrl: input.avatarUrl,
    onboardingComplete: mergedOnboardingComplete,
    accountType: mergedAccountType,
  });

  // Handle profile merging
  const primaryProfile = await ctx.db
    .query("profiles")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", primary.clerkId))
    .first();

  if (primaryProfile && primaryProfile.clerkId !== input.clerkId) {
    await ctx.db.patch(primaryProfile._id, { clerkId: input.clerkId });
  }

  // Find and delete duplicates
  for (const row of sorted) {
    if (row._id !== primary._id) {
      await ctx.db.delete(row._id);
      
      // Delete duplicate profiles
      const duplicateProfile = await ctx.db
        .query("profiles")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", row.clerkId))
        .first();
      if (duplicateProfile) {
        await ctx.db.delete(duplicateProfile._id);
      }
    }
  }

  return {
    onboardingComplete: mergedOnboardingComplete,
  };
}

async function getUsersByClerkId(ctx: MutationCtx, clerkId: string) {
  const matches = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .collect();

  return [...matches].sort((a, b) => a._creationTime - b._creationTime);
}

async function deleteUsersMissingInClerk(
  ctx: MutationCtx,
  args: {
    activeClerkIds: string[];
    allowLargeDeletion?: boolean;
    maxDeleteRatio?: number;
  }
) {
  const activeIds = new Set(
    args.activeClerkIds
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
  );

  const users = await ctx.db.query("users").collect();
  const profiles = await ctx.db.query("profiles").collect();
  const totalItems = users.length + profiles.length;

  if (totalItems > 0 && activeIds.size === 0) {
    throw new ConvexError("Safety stop: refusing reconcile with empty Clerk user set");
  }

  const usersToDelete = users.filter((row) => !activeIds.has(row.clerkId));
  const profilesToDelete = profiles.filter((row) => !activeIds.has(row.clerkId));
  
  const totalToDelete = usersToDelete.length + profilesToDelete.length;
  const deleteRatio = totalItems === 0 ? 0 : totalToDelete / totalItems;
  const maxDeleteRatio = args.maxDeleteRatio ?? 0.5;

  if (!args.allowLargeDeletion && deleteRatio > maxDeleteRatio) {
    throw new ConvexError(
      `Safety stop: refusing to delete ${totalToDelete}/${totalItems} records (ratio ${deleteRatio.toFixed(2)} > ${maxDeleteRatio.toFixed(2)})`
    );
  }

  let deletedCount = 0;

  // Delete users
  for (const row of usersToDelete) {
    await ctx.db.delete(row._id);
    deletedCount += 1;
  }

  // Delete profiles (including orphans)
  for (const row of profilesToDelete) {
    await ctx.db.delete(row._id);
    // If we haven't already counted this deletion (via user), count it
    if (!usersToDelete.some(u => u.clerkId === row.clerkId)) {
      deletedCount += 1;
    }
  }

  return { deletedCount };
}

export const getMe = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      clerkId: v.string(),
      email: v.string(),
      name: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
      accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
      onboardingComplete: v.optional(v.boolean()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const row = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!row) {
      return null;
    }

    return {
      clerkId: row.clerkId,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatarUrl,
      accountType: row.accountType,
      onboardingComplete: row.onboardingComplete,
      createdAt: row.createdAt,
    };
  },
});

export const getDashboardGreeting = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      displayName: v.optional(v.string()),
      name: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const clerkId = identity.subject;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    return {
      displayName: profile?.displayName,
      name: user?.name,
    };
  },
});

async function getPrimaryUserByClerkId(ctx: MutationCtx, clerkId: string) {
  const sorted = await getUsersByClerkId(ctx, clerkId);

  if (sorted.length === 0) {
    return {
      primary: null,
      duplicates: [] as Array<(typeof sorted)[number]>,
    };
  }

  return {
    primary: sorted[0],
    duplicates: sorted.slice(1),
  };
}

export const ensureCurrentUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  returns: v.object({ onboardingComplete: v.boolean() }),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const clerkId = identity.subject;
    // Prefer client-supplied email (from Clerk user object); JWT may omit it.
    const email = normalizeEmail(args.email) ?? normalizeEmail(identity.email);
    const name = args.name ?? identity.name;
    const avatarUrl = args.avatarUrl ?? identity.pictureUrl;

    // 1. clerkId-first lookup — no email required to update an existing record.
    const { duplicates, primary: existing } = await getPrimaryUserByClerkId(ctx, clerkId);
    if (existing) {
      const mergedOnboardingComplete =
        existing.onboardingComplete === true ||
        duplicates.some((row) => row.onboardingComplete === true);
      const mergedAccountType =
        existing.accountType ??
        duplicates.find((row) => row.accountType !== undefined)?.accountType;

      const resolvedEmail = email ?? existing.email;
      if (
        existing.email !== resolvedEmail ||
        existing.name !== name ||
        existing.avatarUrl !== avatarUrl ||
        existing.onboardingComplete !== mergedOnboardingComplete ||
        existing.accountType !== mergedAccountType
      ) {
        await ctx.db.patch(existing._id, {
          email: resolvedEmail,
          name,
          avatarUrl,
          onboardingComplete: mergedOnboardingComplete,
          accountType: mergedAccountType,
        });
      }

      for (const row of duplicates) {
        await ctx.db.delete(row._id);
      }

      return { onboardingComplete: mergedOnboardingComplete };
    }

    // 2. Email-based merge (handles pre-existing records created via webhook).
    if (email) {
      const syncedByEmail = await syncByEmail(ctx, { clerkId, email, name, avatarUrl });
      if (syncedByEmail) return syncedByEmail;
    }

    // 3. Create — only reached when no record exists at all.
    const requiredEmail = requireEmail(email, "ensureCurrentUser");
    await ctx.db.insert("users", {
      clerkId,
      email: requiredEmail,
      name,
      avatarUrl,
      onboardingComplete: false,
      createdAt: Date.now(),
    });

    return { onboardingComplete: false };
  },
});

export const setAccountType = mutation({
  args: {
    accountType: v.union(v.literal("b2c"), v.literal("b2b")),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const clerkId = identity.subject;
    // Prefer client-supplied email; JWT may omit it.
    const email = normalizeEmail(args.email) ?? normalizeEmail(identity.email);
    const name = args.name ?? identity.name;
    const avatarUrl = args.avatarUrl ?? identity.pictureUrl;

    // 1. clerkId-first — existing record can be updated without requiring email.
    const { duplicates, primary: existing } = await getPrimaryUserByClerkId(ctx, clerkId);
    if (existing) {
      await ctx.db.patch(existing._id, {
        email: email ?? existing.email,
        name: name ?? existing.name,
        avatarUrl: avatarUrl ?? existing.avatarUrl,
        accountType: args.accountType,
        onboardingComplete: true,
      });
      for (const row of duplicates) {
        await ctx.db.delete(row._id);
      }
      return null;
    }

    // 2. Email-based merge (legacy / webhook-created records).
    if (email) {
      const synced = await syncByEmail(ctx, {
        clerkId,
        email,
        name,
        avatarUrl,
        onboardingComplete: true,
        accountType: args.accountType,
      });
      if (synced) return null;
    }

    // 3. Create — only reached when no record exists at all.
    const requiredEmail = requireEmail(email, "setAccountType");
    await ctx.db.insert("users", {
      clerkId,
      email: requiredEmail,
      name,
      avatarUrl,
      accountType: args.accountType,
      onboardingComplete: true,
      createdAt: Date.now(),
    });

    return null;
  },
});

// ---------------------------------------------------------------------------
// Webhook and admin operations
// Internal business logic is kept private behind a secret-protected entrypoint.
// ---------------------------------------------------------------------------

export const deleteUserInternal = internalMutation({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const matches = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    for (const row of matches) {
      await ctx.db.delete(row._id);
    }

    return null;
  },
});

export const deleteUserAndProfileInternal = internalMutation({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    const users = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    for (const profile of profiles) {
      await ctx.db.delete(profile._id);
    }

    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    return null;
  },
});

export const deleteUserCompletelyInternal = internalMutation({
  args: { clerkId: v.string() },
  returns: v.object({ deletedProfiles: v.number(), deletedUsers: v.number() }),
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    const users = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    for (const profile of profiles) {
      await ctx.db.delete(profile._id);
    }

    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    return {
      deletedProfiles: profiles.length,
      deletedUsers: users.length,
    };
  },
});

export const deleteUserAndProfileCascadeInternal = internalAction({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      await ctx.runAction(internal.media.deleteUserMedia, {
        clerkId: args.clerkId,
      });
    } catch {
      // Swallow media deletion failure to avoid orphaned DB records.
    }

    await ctx.runMutation(internal.users.deleteUserAndProfileInternal, {
      clerkId: args.clerkId,
    });

    return null;
  },
});

export const deleteUserCascadeInternal = internalAction({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      await ctx.runAction(internal.media.deleteUserR2Folder, {
        clerkId: args.clerkId,
      });
    } catch (err) {
      console.error("[Convex] Cloudflare R2 media deletion failed for clerkId", args.clerkId, err);
    }

    await ctx.runMutation(internal.users.deleteUserCompletelyInternal, {
      clerkId: args.clerkId,
    });

    return null;
  },
});

export const deleteUsersMissingInClerkInternal = internalMutation({
  args: {
    activeClerkIds: v.array(v.string()),
    allowLargeDeletion: v.optional(v.boolean()),
    maxDeleteRatio: v.optional(v.number()),
  },
  returns: v.object({ deletedCount: v.number() }),
  handler: (ctx, args) => deleteUsersMissingInClerk(ctx, args),
});

export const reconcileClerkUsers = mutation({
  args: {
    activeClerkIds: v.array(v.string()),
    webhookSecret: v.string(),
    allowLargeDeletion: v.optional(v.boolean()),
    maxDeleteRatio: v.optional(v.number()),
  },
  returns: v.object({ deletedCount: v.number() }),
  handler: async (ctx, args) => {
    requireWebhookSecret(args.webhookSecret);

    return deleteUsersMissingInClerk(ctx, {
      activeClerkIds: args.activeClerkIds,
      allowLargeDeletion: args.allowLargeDeletion,
      maxDeleteRatio: args.maxDeleteRatio,
    });
  },
});

export const countUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.length;
  },
});

export const syncUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
    accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
  },
  handler: async (ctx, args) => {
    const email = requireEmail(args.email, "syncUser");
    const resolvedName = args.name?.trim() || "Lietotājs";

    // Deduplicate by email first
    const syncedByEmail = await syncByEmail(ctx, {
      clerkId: args.clerkId,
      email,
      name: resolvedName,
      avatarUrl: args.avatarUrl,
      onboardingComplete: args.onboardingComplete,
      accountType: args.accountType,
    });

    if (syncedByEmail) {
      return { success: true };
    }

    // Upsert user in users table
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (user) {
      await ctx.db.patch(user._id, args);
    } else {
      await ctx.db.insert("users", {
        ...args,
        createdAt: Date.now(),
      });
    }
    // Upsert profile in profiles table
    // Remove 'name' field and map to 'displayName' for profiles
    const { name, ...profileArgs } = args;
    // Remove onboardingComplete from profileArgs before upserting profile
    const { onboardingComplete, ...profileArgsNoOnboarding } = profileArgs;
    const profileData: any = { ...profileArgsNoOnboarding };
    if (name) profileData.displayName = name;
    let profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (profile) {
      await ctx.db.patch(profile._id, profileData);
    } else {
      await ctx.db.insert("profiles", profileData);
    }
    return { success: true };
  },
});

