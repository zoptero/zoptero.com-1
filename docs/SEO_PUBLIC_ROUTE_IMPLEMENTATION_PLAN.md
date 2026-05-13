# SEO Public Route Implementation Plan

## Context
Public profile routing is not implemented yet. SEO image upload is already implemented in the profile dashboard and stored in Convex/R2.

## What Is Already Implemented
1. Dashboard SEO tab upload UI in `app/dashboard/(auth)/page-client.tsx`.
2. Exact image size validation: `1200 x 600` pixels before upload.
3. R2 upload via existing Convex action `api.media.generateUploadUrl` with `usage: "seo"`.
4. Profile save payload includes `seoImageKey` (set, replace, remove).
5. Convex profile mutation already supports `seoImageKey` and cleans up old files on replace/remove.
6. User cascade deletion already removes media folders under `uploads/{clerkId}` and `avatars/{clerkId}`.

## Pending Work (When Public Route Is Added)
1. Add public route, for example `app/p/[slug]/page.tsx`.
2. Fetch profile by slug with `api.profiles.getPublicProfileBySlug`.
3. In `generateMetadata`, set:
   - `title` from `seoTitle` (fallback to `displayName`).
   - `description` from `seoDescription` (fallback to `bio/aboutMe`).
   - `openGraph.images` and `twitter.images` from `seoImageKey` URL.
4. Build public image URL from `R2_PUBLIC_URL` + `seoImageKey`.
5. Keep fallback behavior when no SEO image is present.

## Suggested Metadata Mapping
- Open Graph image dimensions: `1200 x 600`.
- Twitter card: `summary_large_image` when image exists, otherwise `summary`.

## Env Requirements
- `NEXT_PUBLIC_CONVEX_URL`
- `R2_PUBLIC_URL` (recommended for stable public image URLs)
- Existing R2 credentials and bucket settings already used by Convex actions

## QA Checklist
1. Upload valid 1200x600 image -> save profile -> verify `seoImageKey` updated.
2. Upload image with invalid dimensions -> verify save blocked with error.
3. Replace SEO image -> verify old file deletion is scheduled/executed.
4. Remove SEO image -> verify `seoImageKey` cleared and old file deleted.
5. Delete user (Clerk webhook path) -> verify SEO upload files are removed from R2.
6. After public route exists, validate social preview tags (OG/Twitter) on slug page.

## Notes
- A temporary public route draft was intentionally removed to avoid shipping incomplete routing.
- This document is the source of truth for finishing the public SEO share image integration later.
