# Convex + Clerk + Cloudflare R2 Cascade Deletion Integration Plan

This plan outlines the step-by-step approach to implement automatic user onboarding, profile creation, and full cascade deletion (Convex + Cloudflare R2) triggered by Clerk events.

---

## 1. Environment Setup
- Ensure the following environment variables are set in `.env.local`:
  - `CONVEX_DEPLOYMENT`, `CONVEX_URL`, `CONVEX_ADMIN_KEY`
  - `R2_BUCKET_NAME`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
  - `CLERK_WEBHOOK_SYNC_SECRET` (for secure webhook calls)

## 2. Convex Schema & Functions
- Implement Convex tables: `users`, `profiles` (with `clerkId` as foreign key)
- Implement Convex functions:
  - `ensureCurrentUser` (on sign-in, creates/updates user)
  - `deleteUserCascadeInternal` (deletes user, profile, and all Cloudflare R2 files)
  - `deleteUserCompletelyInternal` (deletes all user/profile records)
  - `deleteUserR2Folder` and `deleteUserMedia` (delete all R2 files for a user)

## 3. Cloudflare R2 Integration
- Use AWS S3-compatible SDK for R2 operations
- Store user files under `avatars/{clerkId}/` and `uploads/{clerkId}/`
- On deletion, remove all files with these prefixes

## 4. Clerk Webhook Setup
- In Clerk dashboard, set up a webhook for user deletion events
- Webhook should POST to a secure Next.js API route (e.g. `/api/clerk/webhook`)
- Validate webhook secret in the API route

## 5. Next.js API Route (Webhook Handler)
- On receiving a Clerk user deletion event:
  1. Validate the webhook secret
  2. Extract `clerkId` from the event
  3. Call Convex internal action: `deleteUserCascadeInternal({ clerkId })`

## 6. Testing & Safety
- Test with a test user: create, upload avatar, delete in Clerk, verify all data/files are removed
- Use safety checks in Convex to prevent mass deletion (see `deleteUsersMissingInClerk`)

## 7. Ongoing Maintenance
- Periodically reconcile Clerk and Convex users (optional)
- Monitor for errors in webhook/API logs

---

**References:**
- See `convex/users.ts` and `convex/media.ts` for implementation details
- See Clerk and Convex documentation for webhook and server function setup
