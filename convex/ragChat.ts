import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery, mutation, query, type MutationCtx } from "./_generated/server";

const DEFAULT_MAX_CONTEXT_CHARS = 8000;
const MAX_ALLOWED_CONTEXT_CHARS = 20000;
const PROFILE_ASSISTANT_GUIDE_SLUG = "profile-assistant-guide";
const PROFILE_ASSISTANT_FALLBACK_SLUG = "profile-assistant-fallback";

const DEFAULT_PROFILE_ASSISTANT_GUIDE_MARKDOWN = `
Tu esi palīgs zoptero.com platformā — Latvijas profesionāļu un uzņēmumu direktorijā.
Tava loma: palīdzēt lietotājam aizpildīt sava profila laukus pēc iespējas labāk.
Atbildi latviski, kodolīgi un draudzīgi.

Profila lauki un to nozīme:
- **Vārds Uzvārds** (displayName): Pilnais vārds vai uzņēmuma nosaukums. Redzams publiski. Min 3, max 80 rakstzīmes.
- **Īss apraksts** (bio): 1-2 teikumi par to, ko tu dari. Redzams profilā un meklēšanā.
- **Par mani** (aboutMe): Garāks apraksts — pieredze, vērtības, ko piedāvā klientiem.
- **Pilsēta** (city): Kur tu strādā vai atrodies.
- **Tālrunis** (phone): Kontaktinformācija klientiem.
- **E-pasts** (email): Kontaktinformācija klientiem.
- **Nozare** (sector): Tava profesionālā joma vai nozare.
- **Darba vide** (workingEnvironment): Vai strādā attālināti, klātienē vai abējos.
- **URL identifikators** (slug): Tavs publiski redzamais profila links, piemēram: zoptero.com/maris-kalns.
- **Statuss tiešsaistē** (onlineStatus): Vai esi pieejams jauniem klientiem.
- **Atslēgas vārdi** (strongKeywords): Vissvarīgākie vārdi, pēc kuriem tevi var atrast.
- **Meklēšanas trigeris** (searchTriggers): Papildu frāzes, pēc kurām tevi var meklēt.
- **WhatsApp**: Tava WhatsApp numura formāts: +371 2XXXXXXX.
- **Instagram/TikTok/Telegram/Facebook/Threads**: Sociālo tīklu profilu saites vai lietotājvārdi.
- **YouTube**: Saite uz tavu YouTube kanālu.
- **Linktree/Etsy**: Saites uz citām platformām.
- **Profila video** (profileVideoUrl): Saite uz video, kas tevi iepazīstina.
- **Maksājumu veidi**: Cash (skaidra nauda), bankas pārskaitījums, karte.
- **SEO virsraksts** (seoTitle): Virsraksts meklētājprogrammām (max 60 rakstzīmes).
- **SEO apraksts** (seoDescription): Apraksts meklētājprogrammām (max 160 rakstzīmes).

Sniedz konkrētus piemērus, ja tas palīdz. Ja jautājums nav saistīts ar profila aizpildīšanu, pieklājīgi novirzi uz tēmu.
`.trim();

const DEFAULT_PROFILE_ASSISTANT_FALLBACK_MARKDOWN = `
AI limits īslaicīgi sasniegti. Šeit ir ātrie piemēri:

- Vārds Uzvārds: Jānis Bērziņš vai SIA Zoptero Studio.
- Īss apraksts: Palīdzu mazajiem uzņēmumiem izveidot modernu mājaslapu, specializējos Next.js un SEO.
- URL identifikators: janis-berzins vai zoptero-studio.
- Kontakti: lieto +371 2XXXXXXX formātu.
- SEO virsraksts: līdz 60 rakstzīmēm ar pakalpojumu un pilsētu.
- SEO apraksts: līdz 160 rakstzīmēm ar skaidru ieguvumu un aicinājumu sazināties.
`.trim();

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

function requireRagAdminSecret(secret: string) {
  const expected = process.env.RAG_CHAT_ADMIN_SECRET ?? process.env.CLERK_WEBHOOK_SYNC_SECRET;
  if (!expected || secret !== expected) {
    throw new ConvexError("Unauthorized");
  }
}

async function upsertDocument(
  ctx: MutationCtx,
  args: {
    slug: string;
    title: string;
    markdown: string;
    isActive?: boolean;
    updatedByClerkId?: string;
  }
) {
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
      updatedByClerkId: args.updatedByClerkId,
    });
    return existing._id;
  }

  return await ctx.db.insert("ragChatDocuments", {
    slug,
    title,
    markdown,
    isActive: args.isActive ?? true,
    updatedAt: now,
    updatedByClerkId: args.updatedByClerkId,
  });
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

    return await upsertDocument(ctx, {
      ...args,
      updatedByClerkId: identity.subject,
    });
  },
});

export const upsertRagChatDocumentInternal = internalMutation({
  args: {
    slug: v.string(),
    title: v.string(),
    markdown: v.string(),
    isActive: v.optional(v.boolean()),
    updatedByClerkId: v.optional(v.string()),
  },
  returns: v.id("ragChatDocuments"),
  handler: async (ctx, args) => {
    return await upsertDocument(ctx, args);
  },
});

export const upsertRagChatDocumentBySecret = action({
  args: {
    secret: v.string(),
    slug: v.string(),
    title: v.string(),
    markdown: v.string(),
    isActive: v.optional(v.boolean()),
  },
  returns: v.id("ragChatDocuments"),
  handler: async (ctx, args): Promise<Id<"ragChatDocuments">> => {
    requireRagAdminSecret(args.secret);

    return await ctx.runMutation(internal.ragChat.upsertRagChatDocumentInternal, {
      slug: args.slug,
      title: args.title,
      markdown: args.markdown,
      isActive: args.isActive,
      updatedByClerkId: "secret-admin",
    });
  },
});

export const seedProfileAssistantKnowledgeBySecret = action({
  args: { secret: v.string() },
  returns: v.object({
    guideId: v.id("ragChatDocuments"),
    fallbackId: v.id("ragChatDocuments"),
  }),
  handler: async (ctx, args): Promise<{
    guideId: Id<"ragChatDocuments">;
    fallbackId: Id<"ragChatDocuments">;
  }> => {
    requireRagAdminSecret(args.secret);

    const guideId = await ctx.runMutation(internal.ragChat.upsertRagChatDocumentInternal, {
      slug: PROFILE_ASSISTANT_GUIDE_SLUG,
      title: "Profile Assistant Guide",
      markdown: DEFAULT_PROFILE_ASSISTANT_GUIDE_MARKDOWN,
      isActive: true,
      updatedByClerkId: "seed-action",
    });

    const fallbackId = await ctx.runMutation(internal.ragChat.upsertRagChatDocumentInternal, {
      slug: PROFILE_ASSISTANT_FALLBACK_SLUG,
      title: "Profile Assistant Fallback",
      markdown: DEFAULT_PROFILE_ASSISTANT_FALLBACK_MARKDOWN,
      isActive: true,
      updatedByClerkId: "seed-action",
    });

    return { guideId, fallbackId };
  },
});

export const getRagChatDocumentMarkdownBySlug = internalQuery({
  args: { slug: v.string() },
  returns: v.union(v.null(), v.string()),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("ragChatDocuments")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.trim().toLowerCase()))
      .first();

    if (!doc || !doc.isActive) {
      return null;
    }

    return trimForContext(doc.markdown);
  },
});

export const getActiveRagChatContext = internalQuery({
  args: { maxChars: v.optional(v.number()), slugPrefix: v.optional(v.string()) },
  returns: v.string(),
  handler: async (ctx, args) => {
    const maxCharsRaw = args.maxChars ?? DEFAULT_MAX_CONTEXT_CHARS;
    const maxChars = Math.max(500, Math.min(maxCharsRaw, MAX_ALLOWED_CONTEXT_CHARS));
    const slugPrefix = args.slugPrefix?.trim().toLowerCase();

    const docs = await ctx.db
      .query("ragChatDocuments")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .collect();

    const scopedDocs = slugPrefix
      ? docs.filter((doc) => doc.slug.startsWith(slugPrefix))
      : docs;

    const sortedDocs = scopedDocs.sort((a, b) => b.updatedAt - a.updatedAt);
    return buildKnowledgeContext(sortedDocs, maxChars);
  },
});
