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
 * Checks and enforces the per-user rate limit for chat actions.
 *
 * This should be called at the start of any mutation or action that processes
 * user-submitted chat messages. It reads and updates the `lastMessageTimestamp`
 * and `messageCount` fields on the user record.
 *
 * Rate-limiting logic:
 * - If (now - lastMessageTimestamp) > WINDOW_MS, the window has expired.
 *   Reset count to 1 and update timestamp.
 * - If messageCount >= MAX_MESSAGES within the current window, reject with
 *   a 429-like error.
 * - Otherwise, increment messageCount.
 *
 * @param ctx - The mutation context (provides auth and db access).
 * @param clerkId - The authenticated user's Clerk subject ID.
 * @throws ConvexError if the rate limit is exceeded.
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
    // If the user record doesn't exist yet, we still allow the action,
    // but we can't track rate limiting for them. This is a safe default.
    return;
  }

  const lastTimestamp = user.lastMessageTimestamp ?? 0;
  const count = user.messageCount ?? 0;

  const windowExpired = now - lastTimestamp > WINDOW_MS;

  if (windowExpired) {
    // Reset the window: start fresh
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

  // Within the window and under the limit: increment
  await ctx.db.patch(user._id, {
    lastMessageTimestamp: now,
    messageCount: count + 1,
  });
}

/**
 * Strips or escapes potential HTML/script tags from a string to prevent
 * stored XSS and prompt injection via user input.
 *
 * This replaces < and > characters with their HTML entity equivalents.
 */
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .trim();
}

/**
 * Maximum allowed length for a single user chat message (140 characters).
 */
export const MAX_MESSAGE_LENGTH = 140;

/**
 * Internal mutation that delegates to checkChatRateLimit.
 * This is needed because actions can't directly use MutationCtx,
 * but they can call this via ctx.runMutation.
 */
export const checkChatRateLimitInternal = internalMutation({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await checkChatRateLimit(ctx, args.clerkId);
    return null;
  },
});
