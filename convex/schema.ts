import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
    onboardingComplete: v.optional(v.boolean()),
    isPro: v.optional(v.boolean()),
    createdAt: v.number(),
    // Rate-limiting fields for chat abuse prevention
    lastMessageTimestamp: v.optional(v.number()),
    messageCount: v.optional(v.number()),
    // Rate-limiting fields for profile update abuse prevention
    lastProfileUpdateTimestamp: v.optional(v.number()),
    profileUpdateCount: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
  profiles: defineTable({
    clerkId: v.string(),
    accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
    avatarKey: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    displayName: v.optional(v.string()),
    aboutMe: v.optional(v.string()),
    bio: v.optional(v.string()),
    sector: v.optional(v.string()),
    onlineStatus: v.optional(v.boolean()),
    strongKeywords: v.optional(v.array(v.string())),
    // Legacy field kept for backward compatibility with existing documents.
    searchTriggers: v.optional(v.array(v.string())),
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
    pinterest: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    telegram: v.optional(v.string()),
    facebook: v.optional(v.string()),
    threads: v.optional(v.string()),
    // Legacy field kept temporarily for backward compatibility with existing documents.
    youtube: v.optional(v.string()),
    profileVideoUrl: v.optional(v.string()),
    profileHeaderURL: v.optional(v.string()), // Profila galvenes attēla URL
    linktree: v.optional(v.string()),
    etsy: v.optional(v.string()),
    deliveryInfo: v.optional(v.string()),
    paymentCash: v.optional(v.boolean()),
    paymentBankTransfer: v.optional(v.boolean()),
    paymentCard: v.optional(v.boolean()),
    faqs: v.optional(v.array(v.object({ question: v.string(), answer: v.string() }))),
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_slug", ["slug"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["accountType", "city"],
    }),
  ragChatDocuments: defineTable({
    slug: v.string(),
    title: v.string(),
    markdown: v.string(),
    isActive: v.boolean(),
    updatedAt: v.number(),
    updatedByClerkId: v.optional(v.string()),
    // Access control: if set, only users with matching accountType can access
    allowedAccountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
    // If set, only the user who owns this document can access it
    ownerClerkId: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_is_active", ["isActive"]),
});