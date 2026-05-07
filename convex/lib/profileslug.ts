const LEGACY_PROFILE_SLUG_PREFIX = "user-";

export const RESERVED_PROFILE_SLUGS = new Set([
  "about",
  "about-us",
  "admin",
  "api",
  "billing",
  "blog",
  "classifieds",
  "contact",
  "contacts",
  "cookies-policy",
  "cookie-policy",
  "coupons",
  "dashboard",
  "dashboard-shell-01",
  "events",
  "jobs",
  "login",
  "logout",
  "my-services",
  "my-store",
  "news",
  "onboarding",
  "p",
  "partners",
  "post-auth",
  "privacy-policy",
  "pro",
  "profile",
  "profile-about",
  "profile-contacts",
  "profile-faq",
  "profile-seo",
  "rentals",
  "reviews",
  "search-insights",
  "settings",
  "signin",
  "sign-in",
  "signup",
  "sign-up",
  "support",
  "terms",
  "terms-of-service",
  "terms-of-services",
  "trust-graph",
  "verification",
  "welcome",
]);

function slugifySegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizePublicProfileSlug(value: string): string {
  return slugifySegment(value);
}

export function getLegacyProfileSlugVariant(slug: string): string | null {
  if (!slug) {
    return null;
  }

  return slug.startsWith(LEGACY_PROFILE_SLUG_PREFIX)
    ? slug.slice(LEGACY_PROFILE_SLUG_PREFIX.length)
    : `${LEGACY_PROFILE_SLUG_PREFIX}${slug}`;
}

export function isReservedProfileSlug(slug: string): boolean {
  return RESERVED_PROFILE_SLUGS.has(slug.toLowerCase());
}

export function isRootPublicProfilePathname(pathname: string): boolean {
  if (!pathname.startsWith("/")) {
    return false;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) {
    return false;
  }

  const [slug] = segments;
  if (!slug || slug.includes(".")) {
    return false;
  }

  return !isReservedProfileSlug(slug);
}