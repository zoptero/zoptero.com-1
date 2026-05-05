import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";

const DEFAULT_MAX_CONTEXT_CHARS = 8000;
const MAX_ALLOWED_CONTEXT_CHARS = 20000;

function trimForContext(markdown: string): string {
  return markdown.replace(/\s+$/g, "").trim();
}

function buildKnowledgeContext(
  docs: Array<{ title: string; markdown: string }>,
  maxChars: number
): string {
  const sections: string[] = [];
  let currentLength = 0;

  for (const doc of docs) {
    const cleaned = trimForContext(doc.markdown);
    if (!cleaned) {
      continue;
    }

    const section = `## ${doc.title}\n${cleaned}`;
    if (currentLength + section.length > maxChars) {
      const remaining = maxChars - currentLength;
      if (remaining <= 0) {
        break;
      }
      sections.push(section.slice(0, remaining));
      break;
    }

    sections.push(section);
    currentLength += section.length + 2;
  }

  return sections.join("\n\n");
}

export const listRagChatDocuments = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("ragChatDocuments"),
      slug: v.string(),
      title: v.string(),
      markdown: v.string(),
      isActive: v.boolean(),
      updatedAt: v.number(),
      updatedByClerkId: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const docs = await ctx.db.query("ragChatDocuments").collect();
    return docs.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const upsertRagChatDocument = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    markdown: v.string(),
    isActive: v.optional(v.boolean()),
  },
  returns: v.id("ragChatDocuments"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const slug = args.slug.trim().toLowerCase();
    if (!slug) {
      throw new ConvexError("Slug is required");
    }

    const title = args.title.trim();
    if (!title) {
      throw new ConvexError("Title is required");
    }

    const markdown = args.markdown.trim();
    if (!markdown) {
      throw new ConvexError("Markdown is required");
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("ragChatDocuments")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title,
        markdown,
        isActive: args.isActive ?? existing.isActive,
        updatedAt: now,
        updatedByClerkId: identity.subject,
      });
      return existing._id;
    }

    return await ctx.db.insert("ragChatDocuments", {
      slug,
      title,
      markdown,
      isActive: args.isActive ?? true,
      updatedAt: now,
      updatedByClerkId: identity.subject,
    });
  },
});

export const getActiveRagChatContext = internalQuery({
  args: { maxChars: v.optional(v.number()) },
  returns: v.string(),
  handler: async (ctx, args) => {
    const maxCharsRaw = args.maxChars ?? DEFAULT_MAX_CONTEXT_CHARS;
    const maxChars = Math.max(500, Math.min(maxCharsRaw, MAX_ALLOWED_CONTEXT_CHARS));

    const docs = await ctx.db
      .query("ragChatDocuments")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .collect();

    const sortedDocs = docs.sort((a, b) => b.updatedAt - a.updatedAt);
    return buildKnowledgeContext(sortedDocs, maxChars);
  },
});
