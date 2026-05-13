// Internal query to fetch profile by clerkId
export const getByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import type { QueryCtx } from "./_generated/server";
import { internalMutation, internalQuery, mutation, query, action } from "./_generated/server";
import {
  getLegacyProfileSlugVariant,
  isReservedProfileSlug,
  normalizePublicProfileSlug,
} from "./lib/profileslug";

const userMediaKeyPattern = /^(avatars|uploads)\//;

const PROFILE_SECTOR_OPTIONS = [
  "Profesionālie pakalpojumi",
  "Tirdzniecība",
  "Būvniecība",
  "Nekustamais īpašums",
  "Transports",
  "Loģistika",
  "Izglītība",
  "Veselība",
  "Ēdināšana",
  "Viesmīlība",
  "Informācijas tehnoloģijas",
  "Ražošana",
  "Sabiedriskie pakalpojumi",
  "Izklaide",
  "Sports",
  "Dzīvesstils",
] as const;

function canonicalizeSector(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalized = value.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const exactMatch = PROFILE_SECTOR_OPTIONS.find((option) => option === normalized);
  if (exactMatch) {
    return exactMatch;
  }

  const searchKey = normalized
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase();

  const fuzzyMatch = PROFILE_SECTOR_OPTIONS.find((option) =>
    option
      .normalize("NFKD")
      .replace(/\p{M}+/gu, "")
      .toLowerCase() === searchKey
  );

  return fuzzyMatch ?? "";
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function extractSearchTokens(value: string): string[] {
  const words = normalizeSearchText(value).match(/[\p{L}\p{N}]+/gu) ?? [];
  return words.filter((word) => word.length >= 2);
}

function normalizeDigits(value: string | undefined): string {
  if (!value) {
    return "";
  }

  return value.replace(/\D+/g, "");
}

function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function proximityBoost(distanceKm: number): number {
  if (distanceKm <= 5) return 1.5;
  if (distanceKm <= 20) return 1.0;
  if (distanceKm <= 50) return 0.5;
  if (distanceKm <= 100) return 0.2;
  return 0;
}

function looksLikeProfileId(value: string): value is Id<"profiles"> {
  return /^j[0-9a-z]+$/i.test(value);
}

function pickPrimaryProfile<T extends { _creationTime: number }>(profiles: T[]): T | null {
  if (profiles.length === 0) {
    return null;
  }

  return [...profiles].sort((a, b) => b._creationTime - a._creationTime)[0];
}

function pickPreferredSector(profiles: Array<{ sector?: string; _creationTime: number }>): string {
  const ordered = [...profiles].sort((a, b) => b._creationTime - a._creationTime);
  for (const profile of ordered) {
    const canonical = canonicalizeSector(profile.sector);
    if (canonical) {
      return canonical;
    }
  }

  return "";
}

export const get = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    const primary = pickPrimaryProfile(profiles);
    if (!primary) {
      return null;
    }

    const resolvedSector = pickPreferredSector(profiles);
    return {
      ...primary,
      sector: resolvedSector,
      onlineStatus: typeof primary.onlineStatus === "boolean" ? primary.onlineStatus : true,
      strongKeywords: Array.isArray(primary.strongKeywords) ? primary.strongKeywords : [],
    };
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .collect();

    const primary = pickPrimaryProfile(profiles);
    if (!primary) {
      return null;
    }

    const resolvedSector = pickPreferredSector(profiles);
    return {
      ...primary,
      sector: resolvedSector,
      onlineStatus: typeof primary.onlineStatus === "boolean" ? primary.onlineStatus : true,
      strongKeywords: Array.isArray(primary.strongKeywords) ? primary.strongKeywords : [],
    };
  },
});

export const update = mutation({
  args: {
    clerkId: v.string(),
      accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
    avatarKey: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    displayName: v.optional(v.string()),
    aboutMe: v.optional(v.string()),
    bio: v.optional(v.string()),
    sector: v.optional(v.string()),
    MyServices: v.optional(v.array(v.string())),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    hourPrice: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    workingEnvironment: v.optional(v.string()),
    startDate: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    seoImageKey: v.optional(v.string()),
    slug: v.optional(v.string()),
    email: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    instagram: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    telegram: v.optional(v.string()),
    facebook: v.optional(v.string()),
    threads: v.optional(v.string()),
    youtube: v.optional(v.string()),
    pinterest: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    onlineStatus: v.optional(v.boolean()),
    strongKeywords: v.optional(v.array(v.string())),
    profileVideoUrl: v.optional(v.string()),
    profileHeaderURL: v.optional(v.string()),
    linktree: v.optional(v.string()),
    etsy: v.optional(v.string()),
    paymentCash: v.optional(v.boolean()),
    paymentBankTransfer: v.optional(v.boolean()),
    paymentCard: v.optional(v.boolean()),
    faqs: v.optional(v.array(v.object({ question: v.string(), answer: v.string() })) ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== args.clerkId) {
      throw new Error("Not authorized");
    }

    const profilesByClerkId = await ctx.db
      .query("profiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .collect();
    const existingProfile = pickPrimaryProfile(profilesByClerkId);
    const duplicateProfiles = profilesByClerkId.filter(
      (profile) => profile._id !== existingProfile?._id
    );


    // Cleanup old media (avatar, seoImage, or profileHeaderURL) if they are being replaced or removed
    const mediaKeysToCleanup: string[] = [];

    // Avatar cleanup: if new key provided and different, or if avatarKey is explicitly removed
    if (existingProfile?.avatarKey) {
      const isAvatarReplaced = args.avatarKey && args.avatarKey !== existingProfile.avatarKey;
      const isAvatarRemoved = args.avatarKey === "" || (args.avatarKey === undefined && args.hasOwnProperty("avatarKey"));
      if (isAvatarReplaced || isAvatarRemoved) {
        mediaKeysToCleanup.push(existingProfile.avatarKey);
      }
    }

    // SEO Image cleanup: if new key provided and different, or if seoImageKey is explicitly removed
    if (existingProfile?.seoImageKey) {
      const isSeoImageReplaced = args.seoImageKey && args.seoImageKey !== existingProfile.seoImageKey;
      const isSeoImageRemoved = args.seoImageKey === "" || (args.seoImageKey === undefined && args.hasOwnProperty("seoImageKey"));
      if (isSeoImageReplaced || isSeoImageRemoved) {
        mediaKeysToCleanup.push(existingProfile.seoImageKey);
      }
    }

    // Profile header image cleanup: if profileHeaderURL is being removed or replaced
    if (existingProfile?.profileHeaderURL) {
      const isHeaderRemoved = args.profileHeaderURL === "" || (args.profileHeaderURL === undefined && args.hasOwnProperty("profileHeaderURL"));
      const isHeaderReplaced = args.profileHeaderURL && args.profileHeaderURL !== existingProfile.profileHeaderURL;
      if (isHeaderRemoved || isHeaderReplaced) {
        mediaKeysToCleanup.push(existingProfile.profileHeaderURL);
      }
    }

    for (const key of mediaKeysToCleanup) {
      if (userMediaKeyPattern.test(key)) {
        await ctx.scheduler.runAfter(0, internal.media.deleteMediaByKey, {
          clerkId: args.clerkId,
          key,
        });
      }
    }

    const normalizedSlug = args.slug ? normalizePublicProfileSlug(args.slug) : undefined;

    // Backend verification of slug uniqueness
    if (normalizedSlug) {
      if (isReservedProfileSlug(normalizedSlug)) {
        throw new Error("Šis URL identifikators nav pieejams");
      }

      const legacySlug = getLegacyProfileSlugVariant(normalizedSlug);
      const [existingWithSlug, existingWithLegacySlug] = await Promise.all([
        ctx.db
          .query("profiles")
          .withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
          .first(),
        legacySlug
          ? ctx.db
              .query("profiles")
              .withIndex("by_slug", (q) => q.eq("slug", legacySlug))
              .first()
          : Promise.resolve(null),
      ]);

      const conflictingProfile = [existingWithSlug, existingWithLegacySlug].find(
        (profile) => profile && profile.clerkId !== args.clerkId
      );

      if (conflictingProfile) {
        throw new Error("Šis URL identifikators jau ir aizņemts");
      }
    }

    const { clerkId, slug, onlineStatus, strongKeywords, ...fieldsToUpdate } = args;

    // Sanitize text fields from HTML entities like &nbsp;
    const sanitizedFields: any = { ...fieldsToUpdate };
    // removed industryCategory
    if (onlineStatus !== undefined) sanitizedFields.onlineStatus = onlineStatus;
    if (strongKeywords !== undefined) sanitizedFields.strongKeywords = strongKeywords;
    if (typeof sanitizedFields.aboutMe === "string") {
      sanitizedFields.aboutMe = sanitizedFields.aboutMe.replace(/&nbsp;/g, " ");
    }
    if (typeof sanitizedFields.displayName === "string") {
      sanitizedFields.displayName = sanitizedFields.displayName.replace(/&nbsp;/g, " ");
    }
    if (typeof sanitizedFields.sector === "string") {
      sanitizedFields.sector = canonicalizeSector(sanitizedFields.sector);
    }

    const nextFields = {
      ...sanitizedFields,
      ...(slug !== undefined ? { slug: normalizedSlug } : {}),
    };

    if (nextFields.sector === undefined) {
      const preservedSector = pickPreferredSector(profilesByClerkId);
      if (preservedSector) {
        nextFields.sector = preservedSector;
      }
    }

    let profileId = existingProfile?._id;

    if (existingProfile) {
      // Remove onboardingComplete if present
      const { onboardingComplete, ...safeFields } = nextFields;
      await ctx.db.patch(existingProfile._id, safeFields);
    } else {
      const { onboardingComplete, ...safeFields } = nextFields;
      profileId = await ctx.db.insert("profiles", {
        clerkId,
        ...safeFields,
      });
    }

    for (const duplicate of duplicateProfiles) {
      await ctx.db.delete(duplicate._id);
    }

    if (profileId) {
      await ctx.scheduler.runAfter(0, internal.ai.generateProfileEmbedding, {
        profileId,
      });
    }

    return { success: true };
  },
});

export const listAllPublicSlugs = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db
      .query("profiles")
      .collect();

    return profiles
      .map((p) => p.slug)
      .filter((slug): slug is string => Boolean(slug));
  },
});

export const getEmbeddingSource = internalQuery({
  args: { profileId: v.id("profiles") },
  returns: v.union(
    v.null(),
    v.object({
      profileId: v.id("profiles"),
      clerkId: v.string(),
      displayName: v.optional(v.string()),
      aboutMe: v.optional(v.string()),
      bio: v.optional(v.string()),
      MyServices: v.optional(v.array(v.string())),
      city: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      workingEnvironment: v.optional(v.string()),
      seoTitle: v.optional(v.string()),
      seoDescription: v.optional(v.string()),
      whatsapp: v.optional(v.string()),
      telegram: v.optional(v.string()),
      instagram: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      facebook: v.optional(v.string()),
      threads: v.optional(v.string()),
      linktree: v.optional(v.string()),
      profileVideoUrl: v.optional(v.string()),
      paymentCash: v.optional(v.boolean()),
      paymentBankTransfer: v.optional(v.boolean()),
      paymentCard: v.optional(v.boolean()),
      faqs: v.optional(v.array(v.object({ question: v.string(), answer: v.string() }))),
      accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
      onlineStatus: v.optional(v.boolean()),
      strongKeywords: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", profile.clerkId))
      .first();

    return {
      profileId: profile._id,
      clerkId: profile.clerkId,
      displayName: profile.displayName ?? user?.name,
      aboutMe: profile.aboutMe ?? profile.seoTitle ?? profile.workingEnvironment,
      bio: profile.bio,
      MyServices: profile.MyServices,
      city: profile.city,
      phone: profile.phone,
      email: profile.email ?? user?.email,
      workingEnvironment: profile.workingEnvironment,
      seoTitle: profile.seoTitle,
      seoDescription: profile.seoDescription,
      whatsapp: profile.whatsapp,
      telegram: profile.telegram,
      instagram: profile.instagram,
      tiktok: profile.tiktok,
      facebook: profile.facebook,
      threads: profile.threads,
      linktree: profile.linktree,
      profileVideoUrl: profile.profileVideoUrl,
      paymentCash: profile.paymentCash,
      paymentBankTransfer: profile.paymentBankTransfer,
      paymentCard: profile.paymentCard,
      faqs: profile.faqs,
      accountType: profile.accountType ?? user?.accountType,
      onlineStatus: typeof profile.onlineStatus === "boolean" ? profile.onlineStatus : true,
      strongKeywords: Array.isArray(profile.strongKeywords) ? profile.strongKeywords : [],
    };
  },
});

export const updateEmbedding = internalMutation({
  args: {
    profileId: v.id("profiles"),
    embedding: v.array(v.float64()),
    accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      return null;
    }

    await ctx.db.patch(args.profileId, {
      embedding: args.embedding,
      accountType: args.accountType ?? profile.accountType,
    });

    return null;
  },
});

export const getProfilesByIdsForSearch = internalQuery({
  args: { profileIds: v.array(v.id("profiles")) },
  returns: v.array(
    v.object({
      _id: v.id("profiles"),
      slug: v.optional(v.string()),
      displayName: v.optional(v.string()),
      aboutMe: v.optional(v.string()),
      bio: v.optional(v.string()),
      sector: v.optional(v.string()),
      MyServices: v.optional(v.array(v.string())),
      city: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      workingEnvironment: v.optional(v.string()),
      seoTitle: v.optional(v.string()),
      seoDescription: v.optional(v.string()),
      profileVideoUrl: v.optional(v.string()),
      linktree: v.optional(v.string()),
      etsy: v.optional(v.string()),
      paymentCash: v.optional(v.boolean()),
      paymentBankTransfer: v.optional(v.boolean()),
      paymentCard: v.optional(v.boolean()),
      faqs: v.optional(v.array(v.object({ question: v.string(), answer: v.string() }))),
      avatarKey: v.optional(v.string()),
      accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
      whatsapp: v.optional(v.string()),
      telegram: v.optional(v.string()),
      instagram: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      facebook: v.optional(v.string()),
      threads: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const docs = await Promise.all(args.profileIds.map((profileId) => ctx.db.get(profileId)));
    const resolvedDocs = docs.filter((doc): doc is NonNullable<typeof doc> => Boolean(doc));

    const uniqueClerkIds = Array.from(new Set(resolvedDocs.map((doc) => doc.clerkId)));
    const users = await Promise.all(
      uniqueClerkIds.map((clerkId) =>
        ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
          .first()
      )
    );
    const userByClerkId = new Map(
      users
        .filter((user): user is NonNullable<typeof user> => Boolean(user))
        .map((user) => [user.clerkId, user])
    );

    return resolvedDocs.map((doc) => ({
        _id: doc._id,
        slug: doc.slug,
        displayName: doc.displayName ?? userByClerkId.get(doc.clerkId)?.name,
        aboutMe: doc.aboutMe ?? doc.seoTitle ?? doc.workingEnvironment,
        bio: doc.bio,
        sector: doc.sector,
        MyServices: doc.MyServices,
        city: doc.city,
        phone: doc.phone,
        email: doc.email,
        workingEnvironment: doc.workingEnvironment,
        seoTitle: doc.seoTitle,
        seoDescription: doc.seoDescription,
        profileVideoUrl: doc.profileVideoUrl,
        linktree: doc.linktree,
        etsy: doc.etsy,
        paymentCash: doc.paymentCash,
        paymentBankTransfer: doc.paymentBankTransfer,
        paymentCard: doc.paymentCard,
        faqs: doc.faqs,
        avatarKey: doc.avatarKey,
        accountType: doc.accountType,
        whatsapp: doc.whatsapp,
        telegram: doc.telegram,
        instagram: doc.instagram,
        tiktok: doc.tiktok,
        facebook: doc.facebook,
        threads: doc.threads,
        onlineStatus: typeof doc.onlineStatus === "boolean" ? doc.onlineStatus : true,
        strongKeywords: Array.isArray(doc.strongKeywords) ? doc.strongKeywords : [],
      }));
  },
});

export const searchProfilesByText = internalQuery({
  args: {
    query: v.string(),
    limit: v.number(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("profiles"),
      _score: v.number(),
      _distanceKm: v.optional(v.number()),
      slug: v.optional(v.string()),
      displayName: v.optional(v.string()),
      aboutMe: v.optional(v.string()),
      bio: v.optional(v.string()),
      sector: v.optional(v.string()),
      MyServices: v.optional(v.array(v.string())),
      city: v.optional(v.string()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      linktree: v.optional(v.string()),
      etsy: v.optional(v.string()),
      profileVideoUrl: v.optional(v.string()),
      avatarKey: v.optional(v.string()),
      accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
      whatsapp: v.optional(v.string()),
      telegram: v.optional(v.string()),
      instagram: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      facebook: v.optional(v.string()),
      onlineStatus: v.optional(v.boolean()),
      strongKeywords: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx, args) => {
    return await searchProfilesByTextImpl(ctx, args.query, args.limit, {
      lat: args.lat,
      lng: args.lng,
    });
  },
});

export const searchProfilesReactive = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("profiles"),
      _score: v.number(),
      _distanceKm: v.optional(v.number()),
      slug: v.optional(v.string()),
      displayName: v.optional(v.string()),
      aboutMe: v.optional(v.string()),
      bio: v.optional(v.string()),
      sector: v.optional(v.string()),
      MyServices: v.optional(v.array(v.string())),
      city: v.optional(v.string()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      linktree: v.optional(v.string()),
      etsy: v.optional(v.string()),
      profileVideoUrl: v.optional(v.string()),
      avatarKey: v.optional(v.string()),
      accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
      whatsapp: v.optional(v.string()),
      telegram: v.optional(v.string()),
      instagram: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      facebook: v.optional(v.string()),
      onlineStatus: v.optional(v.boolean()),
      strongKeywords: v.optional(v.array(v.string())),
    })
  ),
  handler: async (ctx, args) => {
    const trimmedQuery = args.query.trim();
    if (!trimmedQuery) {
      return [];
    }

    return await searchProfilesByTextImpl(
      ctx,
      trimmedQuery,
      Math.max(1, Math.min(args.limit ?? 12, 20)),
      {
        lat: args.lat,
        lng: args.lng,
      },
    );
  },
});

async function searchProfilesByTextImpl(
  ctx: QueryCtx,
  query: string,
  limit: number,
  userLocation?: { lat?: number; lng?: number },
) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  const tokens = extractSearchTokens(normalizedQuery);
  const queryDigits = normalizeDigits(query);
  const allProfiles = await ctx.db.query("profiles").collect();
  const allUsers = await ctx.db.query("users").collect();
  const userByClerkId = new Map(allUsers.map((user) => [user.clerkId, user]));

  const scored = allProfiles
    .map((profile) => {
      const linkedUser = userByClerkId.get(profile.clerkId);
      const aboutMe = profile.aboutMe ?? profile.seoTitle ?? profile.workingEnvironment;
      const phoneFields = [profile.phone, profile.whatsapp, profile.telegram]
        .filter(Boolean)
        .map((entry) => String(entry));
      const userName = linkedUser?.name?.trim();
      const userEmailLocalPart = linkedUser?.email?.split("@")[0]?.trim();
      const faqText = profile.faqs?.map((faq) => `${faq.question} ${faq.answer}`).join(" ");
      const searchableText = normalizeSearchText(
        [
          profile.displayName,
          userName,
          userEmailLocalPart,
          profile.email,
          aboutMe,
          profile.workingEnvironment,
          profile.sector,
          profile.seoTitle,
          profile.seoDescription,
          profile.bio,
          profile.city,
          profile.linktree,
          profile.etsy,
          profile.profileVideoUrl,
          profile.instagram,
          profile.tiktok,
          profile.facebook,
          profile.threads,
          ...phoneFields,
          faqText,
          profile.paymentCash ? "cash payment" : "",
          profile.paymentBankTransfer ? "bank transfer payment" : "",
          profile.paymentCard ? "card payment" : "",
          ...(profile.MyServices ?? []),
          ...(profile.strongKeywords ?? []),
        ]
          .filter(Boolean)
          .join(" ")
      );

      if (!searchableText) {
        return null;
      }


      let score = 0;
      if (searchableText.includes(normalizedQuery)) {
        score += 1;
      }

      // Strong keyword boost
      const strongKeywords = Array.isArray(profile.strongKeywords) ? profile.strongKeywords.map(k => k.toLowerCase()) : [];
      for (const token of tokens) {
        if (searchableText.includes(token)) {
          score += 0.2;
        }
        // Boost if token matches a strongKeyword
        if (strongKeywords.includes(token)) {
          score += 1.5; // Strong boost for exact keyword match
        }
      }

      if (queryDigits.length >= 5) {
        const candidateDigits = normalizeDigits(phoneFields.join(" "));
        if (candidateDigits.includes(queryDigits)) {
          score += 1.2;
        }
      }

      let distanceKm: number | undefined;
      if (
        typeof userLocation?.lat === "number" &&
        typeof userLocation?.lng === "number" &&
        typeof profile.latitude === "number" &&
        typeof profile.longitude === "number"
      ) {
        distanceKm = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          profile.latitude,
          profile.longitude,
        );
        score += proximityBoost(distanceKm);
      }

      if (score <= 0) {
        return null;
      }

      return {
        _id: profile._id,
        _score: Number(score.toFixed(3)),
        _distanceKm: typeof distanceKm === "number" ? Number(distanceKm.toFixed(2)) : undefined,
        slug: profile.slug,
        displayName: profile.displayName ?? userName,
        aboutMe: profile.aboutMe,
        bio: profile.bio,
        sector: profile.sector,
        MyServices: profile.MyServices,
        city: profile.city,
        latitude: profile.latitude,
        longitude: profile.longitude,
        phone: profile.phone,
        email: profile.email,
        linktree: profile.linktree,
        etsy: profile.etsy,
        profileVideoUrl: profile.profileVideoUrl,
        avatarKey: profile.avatarKey,
        accountType: profile.accountType,
        whatsapp: profile.whatsapp,
        telegram: profile.telegram,
        instagram: profile.instagram,
        tiktok: profile.tiktok,
        facebook: profile.facebook,
        onlineStatus: typeof profile.onlineStatus === "boolean" ? profile.onlineStatus : true,
        strongKeywords: Array.isArray(profile.strongKeywords) ? profile.strongKeywords : [],
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => {
      if (b._score !== a._score) {
        return b._score - a._score;
      }
      if (typeof a._distanceKm === "number" && typeof b._distanceKm === "number") {
        return a._distanceKm - b._distanceKm;
      }
      if (typeof a._distanceKm === "number") {
        return -1;
      }
      if (typeof b._distanceKm === "number") {
        return 1;
      }
      return 0;
    })
    .slice(0, Math.max(1, Math.min(limit, 20)));

  return scored;
}

export const scheduleEmbeddingBackfill = internalMutation({
  args: {
    limit: v.optional(v.number()),
    onlyMissingEmbedding: v.optional(v.boolean()),
  },
  returns: v.object({
    scheduled: v.number(),
    scanned: v.number(),
  }),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 200, 1000));
    const onlyMissingEmbedding = args.onlyMissingEmbedding ?? true;

    const profiles = await ctx.db.query("profiles").collect();
    const candidates = onlyMissingEmbedding
      ? profiles.filter((profile) => !profile.embedding)
      : profiles;

    const toSchedule = candidates.slice(0, limit);
    for (const profile of toSchedule) {
      await ctx.scheduler.runAfter(0, internal.ai.generateProfileEmbedding, {
        profileId: profile._id,
      });
    }

    return {
      scheduled: toSchedule.length,
      scanned: candidates.length,
    };
  },
});

export const checkSlugAvailability = query({
  args: { slug: v.string(), clerkId: v.string() },
  handler: async (ctx, args) => {
    const normalizedSlug = normalizePublicProfileSlug(args.slug);
    if (!normalizedSlug) return { available: true, normalizedSlug: "" };

    if (isReservedProfileSlug(normalizedSlug)) {
      return { available: false, reserved: true, normalizedSlug };
    }

    const legacySlug = getLegacyProfileSlugVariant(normalizedSlug);
    const [existing, legacyExisting] = await Promise.all([
      ctx.db
        .query("profiles")
        .withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
        .first(),
      legacySlug
        ? ctx.db
            .query("profiles")
            .withIndex("by_slug", (q) => q.eq("slug", legacySlug))
            .first()
        : Promise.resolve(null),
    ]);

    const conflictingProfile = existing || legacyExisting;

    if (!conflictingProfile) return { available: true, normalizedSlug };
    
    // If it's the current user's slug, it's available for them
    return { available: conflictingProfile.clerkId === args.clerkId, normalizedSlug };
  },
});

export const getPublicProfileBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const normalizedSlug = normalizePublicProfileSlug(args.slug);
    const legacySlug = getLegacyProfileSlugVariant(normalizedSlug);
    const [profile, legacyProfile] = await Promise.all([
      ctx.db
        .query("profiles")
        .withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
        .first(),
      legacySlug
        ? ctx.db
            .query("profiles")
            .withIndex("by_slug", (q) => q.eq("slug", legacySlug))
            .first()
        : Promise.resolve(null),
    ]);

    let resolvedProfile = profile || legacyProfile;

    if (!resolvedProfile && looksLikeProfileId(args.slug)) {
      resolvedProfile = await ctx.db.get(args.slug);
    }

    if (!resolvedProfile) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", resolvedProfile.clerkId))
      .first();

    return {
      ...resolvedProfile,
      slug: normalizedSlug,
      accountType: user?.accountType || "b2c",
    };
  },
});

export const backfillMissingSlugs = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 500, 2000));
    const dryRun = args.dryRun ?? true;

    const allProfiles = await ctx.db.query("profiles").collect();
    const users = await ctx.db.query("users").collect();
    const userByClerkId = new Map(users.map((user) => [user.clerkId, user]));

    const usedSlugs = new Set<string>();
    for (const profile of allProfiles) {
      if (!profile.slug) continue;
      const normalized = normalizePublicProfileSlug(profile.slug);
      if (normalized) {
        usedSlugs.add(normalized);
      }
    }

    const candidates = allProfiles.filter((profile) => !profile.slug).slice(0, limit);

    let updated = 0;
    const restored: Array<{ clerkId: string; slug: string }> = [];

    for (const profile of candidates) {
      const linkedUser = userByClerkId.get(profile.clerkId);
      const emailLocalPart = linkedUser?.email?.split("@")[0]?.trim();

      const baseInput =
        profile.displayName?.trim() ||
        linkedUser?.name?.trim() ||
        emailLocalPart ||
        profile.clerkId;

      const initial = normalizePublicProfileSlug(baseInput);
      if (!initial) {
        continue;
      }

      const baseSlug = initial;
      let candidateSlug = initial;
      let counter = 2;

      while (usedSlugs.has(candidateSlug) || isReservedProfileSlug(candidateSlug)) {
        candidateSlug = normalizePublicProfileSlug(`${baseSlug}-${counter}`);
        counter += 1;
      }

      usedSlugs.add(candidateSlug);

      if (!dryRun) {
        await ctx.db.patch(profile._id, { slug: candidateSlug });
      }

      updated += 1;
      if (restored.length < 25) {
        restored.push({ clerkId: profile.clerkId, slug: candidateSlug });
      }
    }

    return {
      dryRun,
      scanned: allProfiles.length,
      missingBefore: allProfiles.filter((profile) => !profile.slug).length,
      processed: candidates.length,
      updated,
      restored,
      hasMore: allProfiles.filter((profile) => !profile.slug).length > candidates.length,
    };
  },
});