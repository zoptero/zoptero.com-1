import { ConvexError, v } from "convex/values";
import { internalMutation, type MutationCtx } from "./_generated/server";

/**
 * Rate-limiting configuration for chat mutations.
 *
 * MAX_MESSAGES: maximum number of messages allowed within WINDOW_MS.
 * WINDOW_MS: sliding time window in milliseconds.
 */
const MAX_MESSAGES = 5;
const WINDOW_MS = 30_000; // 30 seconds

/**
 * Rate-limiting configuration for profile update mutations.
 *
 * MAX_PROFILE_UPDATES: maximum number of profile updates allowed within PROFILE_UPDATE_WINDOW_MS.
 * PROFILE_UPDATE_WINDOW_MS: sliding time window in milliseconds.
 */
const MAX_PROFILE_UPDATES = 3;
const PROFILE_UPDATE_WINDOW_MS = 10_000; // 10 seconds

/**
 * Maximum allowed payload size in bytes for a profile update request.
 * This is an application-level protection against abuse through
 * excessively large request bodies.
 */
export const MAX_PROFILE_PAYLOAD_BYTES = 10 * 1024; // 10 KB

/**
 * Maximum array sizes for profile fields to prevent array flooding.
 */
export const MAX_STRONG_KEYWORDS = 10;
export const MAX_MY_SERVICES_ITEMS = 20;
export const MAX_FAQS_ITEMS = 20;

/**
 * Maximum string lengths for profile fields (server-side enforcement).
 * These match or are slightly more restrictive than the frontend Zod schema
 * to ensure frontend bypass attempts are caught.
 */
export const FIELD_MAX_LENGTHS: Record<string, number> = {
  displayName: 80,
  email: 320,
  phone: 30,
  city: 80,
  aboutMe: 2000,
  bio: 140,
  sector: 120,
  slug: 80,
  workingEnvironment: 120,
  startDate: 30,
  hourPrice: 3,
  myServicesText: 500,
  mediaUrl: 250,
  profileVideoUrl: 250,
  seoTitle: 120,
  seoDescription: 300,
  whatsapp: 30,
  instagram: 250,
  linkedin: 250,
  tiktok: 250,
  telegram: 120,
  facebook: 250,
  threads: 250,
  youtube: 250,
  linktree: 250,
  pinterest: 250,
  etsy: 250,
  deliveryInfo: 1000,
  profileHeaderURL: 250,
  avatarKey: 500,
  avatarUrl: 500,
  seoImageKey: 500,
  companyName: 120,
  regNr: 50,
  vatNr: 50,
  legalAddress: 200,
  actualAddress: 200,
};

/**
 * Checks and enforces the per-user rate limit for chat actions.
 */
export async function checkChatRateLimit(
  ctx: MutationCtx,
  clerkId: string
): Promise<void> {
  const now = Date.now();

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  if (!user) {
    return;
  }

  const lastTimestamp = user.lastMessageTimestamp ?? 0;
  const count = user.messageCount ?? 0;

  const windowExpired = now - lastTimestamp > WINDOW_MS;

  if (windowExpired) {
    await ctx.db.patch(user._id, {
      lastMessageTimestamp: now,
      messageCount: 1,
    });
    return;
  }

  if (count >= MAX_MESSAGES) {
    const retryAfterMs = WINDOW_MS - (now - lastTimestamp);
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    throw new ConvexError(
      `Ratelimit exceeded. Please wait ${retryAfterSeconds} second(s) before sending another message.`
    );
  }

  await ctx.db.patch(user._id, {
    lastMessageTimestamp: now,
    messageCount: count + 1,
  });
}

/**
 * Checks and enforces the per-user rate limit for profile update mutations.
 *
 * - Allows up to MAX_PROFILE_UPDATES within PROFILE_UPDATE_WINDOW_MS.
 * - Uses separate user fields (lastProfileUpdateTimestamp, profileUpdateCount)
 *   from chat rate limiting to avoid cross-interference.
 */
export async function checkProfileUpdateRateLimit(
  ctx: MutationCtx,
  clerkId: string
): Promise<void> {
  const now = Date.now();

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .first();

  if (!user) {
    return;
  }

  const lastTimestamp = user.lastProfileUpdateTimestamp ?? 0;
  const count = user.profileUpdateCount ?? 0;

  const windowExpired = now - lastTimestamp > PROFILE_UPDATE_WINDOW_MS;

  if (windowExpired) {
    await ctx.db.patch(user._id, {
      lastProfileUpdateTimestamp: now,
      profileUpdateCount: 1,
    });
    return;
  }

  if (count >= MAX_PROFILE_UPDATES) {
    const retryAfterMs = PROFILE_UPDATE_WINDOW_MS - (now - lastTimestamp);
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    throw new ConvexError(
      `Rate limit exceeded. Please wait ${retryAfterSeconds} second(s) before updating your profile again.`
    );
  }

  await ctx.db.patch(user._id, {
    lastProfileUpdateTimestamp: now,
    profileUpdateCount: count + 1,
  });
}

/**
 * Strips or escapes potential HTML/script tags from a string to prevent
 * stored XSS and prompt injection via user input.
 *
 * This replaces < and > characters with their HTML entity equivalents.
 * Also strips javascript: protocol from URLs.
 */
function escapeLt(): string { return String.fromCharCode(38, 108, 116, 59); }
function escapeGt(): string { return String.fromCharCode(38, 103, 116, 59); }

export function sanitizeUserInput(input: string): string {
  return input
    .replace(/</g, escapeLt())
    .replace(/>/g, escapeGt())
    .replace(/javascript\s*:/gi, "blocked:")
    .replace(/on\w+\s*=/gi, "blocked=")
    .trim();
}

/**
 * Strips all HTML tags from a string for safe storage.
 * This is more aggressive than sanitizeUserInput and is appropriate
 * for fields like bio, aboutMe, displayName where HTML makes no sense.
 */
export function stripHtmlTags(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/javascript\s*:/gi, "blocked:")
    .replace(/on\w+\s*=/gi, "blocked=")
    .trim();
}

/**
 * Maximum allowed length for a single user chat message (140 characters).
 */
export const MAX_MESSAGE_LENGTH = 140;

/**
 * Internal mutation that delegates to checkChatRateLimit.
 */
export const checkChatRateLimitInternal = internalMutation({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await checkChatRateLimit(ctx, args.clerkId);
    return null;
  },
});

/**
 * Internal mutation that delegates to checkProfileUpdateRateLimit.
 * For use from actions if needed.
 */
export const checkProfileUpdateRateLimitInternal = internalMutation({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await checkProfileUpdateRateLimit(ctx, args.clerkId);
    return null;
  },
});