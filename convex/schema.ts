import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"), v.literal("individual"))),
    onboardingComplete: v.optional(v.boolean()),
    isPro: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
  profiles: defineTable({
    clerkId: v.string(),
    accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"), v.literal("individual"))),
    avatarKey: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    displayName: v.optional(v.string()),
    aboutMe: v.optional(v.string()),
    bio: v.optional(v.string()),
    sector: v.optional(v.string()),
    onlineStatus: v.optional(v.boolean()),
    strongKeywords: v.optional(v.array(v.string())),
    searchTriggers: v.optional(v.array(v.string())),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    workingEnvironment: v.optional(v.string()),
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
    profileVideoUrl: v.optional(v.string()),
    linktree: v.optional(v.string()),
    etsy: v.optional(v.string()),
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
});
