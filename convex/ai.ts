"use node";

import { ConvexError, v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalAction } from "./_generated/server";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const MIN_VECTOR_SCORE = 0.62;

type SearchProfileResult = {
  _id: Id<"profiles">;
  _score: number;
  slug?: string;
  displayName?: string;
  aboutMe?: string;
  bio?: string;
  sector?: string;
  searchTriggers?: string[];
  city?: string;
  phone?: string;
  email?: string;
  linktree?: string;
  etsy?: string;
  avatarKey?: string;
  accountType?: "b2c" | "b2b";
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
};

type HydratedSearchDoc = {
  _id: Id<"profiles">;
  slug?: string;
  displayName?: string;
  aboutMe?: string;
  bio?: string;
  sector?: string;
  searchTriggers?: string[];
  city?: string;
  phone?: string;
  email?: string;
  workingEnvironment?: string;
  seoTitle?: string;
  seoDescription?: string;
  profileVideoUrl?: string;
  linktree?: string;
  etsy?: string;
  paymentCash?: boolean;
  paymentBankTransfer?: boolean;
  paymentCard?: boolean;
  faqs?: Array<{ question: string; answer: string }>;
  avatarKey?: string;
  accountType?: "b2c" | "b2b";
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  threads?: string;
};

function stripHtmlTags(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSearchText(value: string): string {
  return stripHtmlTags(value).toLowerCase();
}

function extractSearchTokens(value: string): string[] {
  const words = normalizeSearchText(value).match(/[\p{L}\p{N}]+/gu) ?? [];
  return words.filter((word) => word.length >= 3);
}

function hasTokenOverlap(queryTokens: string[], candidateText: string): boolean {
  if (queryTokens.length === 0) {
    return true;
  }

  const normalizedCandidateText = normalizeSearchText(candidateText);
  return queryTokens.some((token) => normalizedCandidateText.includes(token));
}

function buildProfileEmbeddingInput(source: {
  displayName?: string;
  aboutMe?: string;
  bio?: string;
  sector?: string;
  searchTriggers?: string[];
  city?: string;
  phone?: string;
  email?: string;
  workingEnvironment?: string;
  seoTitle?: string;
  seoDescription?: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  threads?: string;
  linktree?: string;
  etsy?: string;
  profileVideoUrl?: string;
  paymentCash?: boolean;
  paymentBankTransfer?: boolean;
  paymentCard?: boolean;
  faqs?: Array<{ question: string; answer: string }>;
}): string {
  const faqText = source.faqs?.map((faq) => `${normalizeSearchText(faq.question)} ${normalizeSearchText(faq.answer)}`).join(" | ");
  const blocks = [
    source.displayName ? `Name: ${normalizeSearchText(source.displayName)}` : "",
    source.aboutMe ? `About: ${normalizeSearchText(source.aboutMe)}` : "",
    source.city ? `City: ${normalizeSearchText(source.city)}` : "",
    source.phone ? `Phone: ${normalizeSearchText(source.phone)}` : "",
    source.email ? `Email: ${normalizeSearchText(source.email)}` : "",
    source.workingEnvironment ? `Working environment: ${normalizeSearchText(source.workingEnvironment)}` : "",
    source.sector ? `Sector: ${normalizeSearchText(source.sector)}` : "",
    source.seoTitle ? `SEO title: ${normalizeSearchText(source.seoTitle)}` : "",
    source.seoDescription ? `SEO description: ${normalizeSearchText(source.seoDescription)}` : "",
    source.bio ? `Bio: ${normalizeSearchText(source.bio)}` : "",
    source.whatsapp ? `WhatsApp: ${normalizeSearchText(source.whatsapp)}` : "",
    source.telegram ? `Telegram: ${normalizeSearchText(source.telegram)}` : "",
    source.instagram ? `Instagram: ${normalizeSearchText(source.instagram)}` : "",
    source.tiktok ? `TikTok: ${normalizeSearchText(source.tiktok)}` : "",
    source.youtube ? `YouTube: ${normalizeSearchText(source.youtube)}` : "",
    source.facebook ? `Facebook: ${normalizeSearchText(source.facebook)}` : "",
    source.threads ? `Threads: ${normalizeSearchText(source.threads)}` : "",
    source.linktree ? `Linktree: ${normalizeSearchText(source.linktree)}` : "",
    source.etsy ? `Etsy: ${normalizeSearchText(source.etsy)}` : "",
    source.profileVideoUrl ? `Profile video: ${normalizeSearchText(source.profileVideoUrl)}` : "",
    source.paymentCash ? "Payment: cash" : "",
    source.paymentBankTransfer ? "Payment: bank transfer" : "",
    source.paymentCard ? "Payment: card" : "",
    faqText ? `FAQs: ${faqText}` : "",
    source.searchTriggers?.length
      ? `Search triggers: ${source.searchTriggers.map((term) => normalizeSearchText(term)).join(", ")}`
      : "",
  ].filter(Boolean);

  return blocks.join("\n");
}

function getEmbeddingClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ConvexError("Missing GEMINI_API_KEY environment variable");
  }

  return new GoogleGenAI({ apiKey });
}

async function createEmbedding(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"
): Promise<number[]> {
  const client = getEmbeddingClient();
  const response = await client.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
      taskType,
    },
  });
  const values = response.embeddings?.[0]?.values;

  if (!values || values.length === 0) {
    throw new ConvexError("Gemini returned an empty embedding");
  }

  if (values.length !== EMBEDDING_DIMENSIONS) {
    throw new ConvexError(
      `Gemini embedding dimension mismatch. Expected ${EMBEDDING_DIMENSIONS}, got ${values.length}`
    );
  }

  return values;
}

export const generateProfileEmbedding = internalAction({
  args: { profileId: v.id("profiles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const source = await ctx.runQuery(internal.profiles.getEmbeddingSource, {
      profileId: args.profileId,
    });

    if (!source) {
      return null;
    }

    const embeddingInput = buildProfileEmbeddingInput(source);
    if (!embeddingInput) {
      return null;
    }

    const embedding = await createEmbedding(embeddingInput, "RETRIEVAL_DOCUMENT");

    await ctx.runMutation(internal.profiles.updateEmbedding, {
      profileId: args.profileId,
      embedding,
      accountType: source.accountType,
    });

    return null;
  },
});

export const searchProfiles = action({
  args: {
    query: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("profiles"),
      _score: v.number(),
      slug: v.optional(v.string()),
      displayName: v.optional(v.string()),
      aboutMe: v.optional(v.string()),
      bio: v.optional(v.string()),
      sector: v.optional(v.string()),
      searchTriggers: v.optional(v.array(v.string())),
      city: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      linktree: v.optional(v.string()),
      etsy: v.optional(v.string()),
      avatarKey: v.optional(v.string()),
      accountType: v.optional(v.union(v.literal("b2c"), v.literal("b2b"))),
      whatsapp: v.optional(v.string()),
      telegram: v.optional(v.string()),
      instagram: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      youtube: v.optional(v.string()),
      facebook: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args): Promise<SearchProfileResult[]> => {
    const cleanedQuery = normalizeSearchText(args.query);
    if (!cleanedQuery) {
      return [];
    }
    const queryTokens = extractSearchTokens(cleanedQuery);

    let vectorHits: Array<{ _id: Id<"profiles">; _score: number }> = [];
    try {
      const queryEmbedding = await createEmbedding(cleanedQuery, "RETRIEVAL_QUERY");
      const rawVectorHits = await ctx.vectorSearch("profiles", "by_embedding", {
        vector: queryEmbedding,
        limit: 12,
      });
      vectorHits = rawVectorHits.map((hit) => ({ _id: hit._id, _score: hit._score }));
    } catch {
      // If embedding generation is unavailable, continue with lexical fallback.
      vectorHits = [];
    }

    const profileIds = vectorHits.map((hit) => hit._id);
    const docs: HydratedSearchDoc[] = profileIds.length
      ? await ctx.runQuery(internal.profiles.getProfilesByIdsForSearch, {
          profileIds,
        })
      : [];

    const docById = new Map(docs.map((doc) => [doc._id, doc]));

    const results: SearchProfileResult[] = [];

    for (const hit of vectorHits) {
      if (hit._score < MIN_VECTOR_SCORE) {
        continue;
      }

      const doc = docById.get(hit._id);
      if (!doc) {
        continue;
      }

      const faqText = doc.faqs?.map((faq) => `${faq.question} ${faq.answer}`).join(" ");
      const candidateText = [
        doc.displayName,
        doc.aboutMe,
        doc.bio,
        doc.sector,
        doc.city,
        doc.phone,
        doc.email,
        doc.workingEnvironment,
        doc.seoTitle,
        doc.seoDescription,
        doc.linktree,
        doc.etsy,
        doc.profileVideoUrl,
        doc.whatsapp,
        doc.telegram,
        doc.instagram,
        doc.tiktok,
        doc.youtube,
        doc.facebook,
        doc.threads,
        faqText,
        doc.paymentCash ? "cash payment" : "",
        doc.paymentBankTransfer ? "bank transfer payment" : "",
        doc.paymentCard ? "card payment" : "",
      ]
        .concat(doc.searchTriggers ?? [])
        .filter(Boolean)
        .join(" ");
      if (!hasTokenOverlap(queryTokens, candidateText)) {
        continue;
      }

      results.push({
        _id: doc._id,
        _score: hit._score,
        slug: doc.slug,
        displayName: doc.displayName,
        aboutMe: doc.aboutMe,
        bio: doc.bio,
        sector: doc.sector,
        searchTriggers: doc.searchTriggers,
        city: doc.city,
        phone: doc.phone,
        email: doc.email,
        linktree: doc.linktree,
        etsy: doc.etsy,
        avatarKey: doc.avatarKey,
        accountType: doc.accountType,
        whatsapp: doc.whatsapp,
        telegram: doc.telegram,
        instagram: doc.instagram,
        tiktok: doc.tiktok,
        youtube: doc.youtube,
        facebook: doc.facebook,
      });
    }

    if (results.length === 0) {
      const lexicalFallback: Array<SearchProfileResult> = await ctx.runQuery(
        internal.profiles.searchProfilesByText,
        {
          query: cleanedQuery,
          limit: 12,
        }
      );

      return lexicalFallback.map((entry) => ({
        _id: entry._id,
        _score: entry._score,
        slug: entry.slug,
        displayName: entry.displayName,
        aboutMe: entry.aboutMe,
        bio: entry.bio,
        sector: entry.sector,
        searchTriggers: entry.searchTriggers,
        city: entry.city,
        phone: entry.phone,
        email: entry.email,
        linktree: entry.linktree,
        etsy: entry.etsy,
        avatarKey: entry.avatarKey,
        accountType: entry.accountType,
        whatsapp: entry.whatsapp,
        telegram: entry.telegram,
        instagram: entry.instagram,
        tiktok: entry.tiktok,
        youtube: entry.youtube,
        facebook: entry.facebook,
      }));
    }

    return results;
  },
});

const PROFILE_FIELD_GUIDE = `
Tu esi palīgs zoptero.com platformā — Latvijas profesionāļu un uzņēmumu direktoriā.
Tava loma: palīdzēt lietotājam aizpildīt sava profila laukus pēc iespējas labāk.
Atbildi latviski, kodolīgi un draudzīgi.

Profila lauki un to nozīme:
- **Vārds Uzvārds** (displayName): Pilnais vārds vai uzņēmuma nosaukums. Redzams publiski. Min 3, max 80 rakstzīmes.
- **Īss apraksts** (bio): 1–2 teikumi par to, ko tu dari. Redzams profilā un meklēšanā.
- **Par mani** (aboutMe): Garāks apraksts — pieredze, vērtības, ko piedāvā klientiem.
- **Pilsēta** (city): Kur tu strādā vai atrodas.
- **Tālrunis** (phone): Kontaktinformācija klientiem.
- **E-pasts** (email): Kontaktinformācija klientiem.
- **Nozare** (sector): Tava profesionālā joma vai nozare.
- **Darba vide** (workingEnvironment): Vai strādā attālināti, klātienē vai abējos.
- **URL identifikators** (slug): Tavs publiski redzamais profila links, piemēram: zoptero.com/maris-kalns.
- **Statuss tiešsaistē** (onlineStatus): Vai esi pieejams jauniem klientiem.
- **Atslēgas vārdi** (strongKeywords): Vissvarīgākie vārdi, pēc kuriem tevi var atrast.
- **Meklēšanas trigeris** (searchTriggers): Papildu frāzes, pēc kurām tevi var meklēt.
- **WhatsApp**: Tava WhatsApp numura. Formāts: +371 2XXXXXXX.
- **Instagram/TikTok/Telegram/Facebook/Threads**: Sociālo tīklu profilu saites vai lietotājvārdi.
- **YouTube**: Saite uz tavu YouTube kanālu.
- **Linktree/Etsy**: Saites uz citām platformām.
- **Profila video** (profileVideoUrl): Saite uz video, kas tevi iepazīstina.
- **Maksājumu veidi**: Cash (skaidra nauda), bankas pārskaitījums, karte.
- **SEO virsraksts** (seoTitle): Virsraksts meklētājprogrammām (max 60 rakstzīmes).
- **SEO apraksts** (seoDescription): Apraksts meklētājprogrammām (max 160 rakstzīmes).

Sniedz konkrētus piemērus, ja tas palīdz. Ja jautājums nav saistīts ar profila aizpildīšanu, pieklājīgi novirzini uz tēmu.
`.trim();

function isQuotaExceededError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("resource_exhausted") ||
    normalized.includes("quota") ||
    normalized.includes("429")
  );
}

function isRetryableProviderError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    isQuotaExceededError(message) ||
    normalized.includes("no endpoints found") ||
    normalized.includes("temporarily unavailable") ||
    normalized.includes("rate limit") ||
    normalized.includes("provider returned error") ||
    normalized.includes("service unavailable") ||
    normalized.includes("model is not available")
  );
}

function localProfileAssistantFallback(message: string, fieldContext?: string): string {
  const lower = `${fieldContext ?? ""} ${message}`.toLowerCase();

  if (lower.includes("vārds") || lower.includes("uzvārds") || lower.includes("displayname")) {
    return "AI limits īslaicīgi sasniegti, bet varu palīdzēt uzreiz. Vārds Uzvārds laukā raksti pilnu vārdu vai uzņēmuma nosaukumu. Piemēri: 'Jānis Bērziņš', 'SIA Zoptero Studio'. Izvairies no emoji un liekām frāzēm.";
  }

  if (lower.includes("bio") || lower.includes("īss apraksts")) {
    return "AI limits īslaicīgi sasniegti, tāpēc dodu gatavu šablonu: 'Palīdzu [kam?] sasniegt [rezultāts], specializējos [niša].' Piemērs: 'Palīdzu mazajiem uzņēmumiem izveidot modernu mājaslapu, specializējos Next.js un SEO.'";
  }

  if (lower.includes("slug") || lower.includes("url")) {
    return "URL identifikatoram lieto mazos burtus, ciparus un defises. Piemēri: 'janis-berzins', 'zoptero-studio'. Nelieto atstarpes un garumzīmes.";
  }

  if (lower.includes("whatsapp") || lower.includes("tālrun") || lower.includes("phone")) {
    return "Kontaktam izmanto starptautisko formātu ar +371. Piemērs: '+371 2XXXXXXX'. Tas palīdz klientiem uzreiz saprast, kā sazināties.";
  }

  if (lower.includes("seo")) {
    return "SEO virsraksts: līdz 60 rakstzīmēm, ar pakalpojumu + pilsētu. SEO apraksts: līdz 160 rakstzīmēm ar skaidru ieguvumu un aicinājumu sazināties.";
  }

  return "AI limits īslaicīgi sasniegti. Vari jautāt par konkrētu lauku, piemēram: Vārds Uzvārds, Īss apraksts, URL identifikators, Kontakti vai SEO, un es došu precīzu piemēru.";
}

type AssistantTurn = {
  role: "user" | "model";
  content: string;
};

async function generateWithCloudflare(args: {
  message: string;
  systemInstruction: string;
  history: AssistantTurn[];
}): Promise<string> {
  const apiKey = process.env.CLOUDFLARE_AI_API_KEY ?? process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!apiKey || !accountId) {
    throw new Error("Missing CLOUDFLARE_AI_API_KEY (or CLOUDFLARE_API_TOKEN) or CLOUDFLARE_ACCOUNT_ID");
  }

  const model = process.env.CLOUDFLARE_MODEL ?? "@cf/meta/llama-3.1-8b-instruct";
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: args.systemInstruction },
          ...args.history.map((msg) => ({
            role: msg.role === "model" ? "assistant" : "user",
            content: msg.content,
          })),
          { role: "user", content: args.message },
        ],
        temperature: 0.4,
        max_tokens: 1024,
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    const errMsg = data?.errors?.[0]?.message ?? data?.error?.message ?? `Cloudflare AI failed with status ${response.status}`;
    throw new Error(errMsg);
  }

  const content = data?.result?.response ?? data?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }

  throw new Error("Cloudflare AI returned an empty response");
}

async function generateWithNvidia(args: {
  message: string;
  systemInstruction: string;
  history: AssistantTurn[];
}): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NVIDIA_API_KEY");
  }

  const model = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-8b-instruct";
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: args.systemInstruction },
        ...args.history.map((msg) => ({
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.content,
        })),
        { role: "user", content: args.message },
      ],
      temperature: 0.4,
      max_tokens: 1024,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail ?? data?.error?.message ?? `NVIDIA request failed with status ${response.status}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }

  throw new Error("NVIDIA returned an empty response");
}

async function generateWithOpenRouter(args: {
  message: string;
  systemInstruction: string;
  history: AssistantTurn[];
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new ConvexError("Missing OPENROUTER_API_KEY environment variable");
  }

  const configuredModel = process.env.OPENROUTER_MODEL;
  const candidateModels = [
    configuredModel,
    "google/gemma-4-31b-it:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "google/gemma-2-9b-it:free",
    "mistralai/mistral-7b-instruct:free",
  ].filter((model): model is string => Boolean(model));

  let lastError: Error | null = null;

  for (const model of candidateModels) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://zoptero.com",
        "X-Title": "Zoptero Profile Assistant",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: args.systemInstruction },
          ...args.history.map((msg) => ({
            role: msg.role === "model" ? "assistant" : "user",
            content: msg.content,
          })),
          { role: "user", content: args.message },
        ],
        temperature: 0.4,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data?.error?.message ?? `OpenRouter request failed with status ${response.status}`;
      lastError = new Error(errorMessage);
      const isAuthError = response.status === 401 || response.status === 403;
      if (!isAuthError) {
        continue;
      }
      throw lastError;
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) {
      return content.trim();
    }

    lastError = new Error("OpenRouter returned an empty response");
  }

  throw lastError ?? new Error("OpenRouter has no available endpoints for configured models");
}

export const profileAssistantChat = action({
  args: {
    message: v.string(),
    fieldContext: v.optional(v.string()),
    history: v.optional(
      v.array(v.object({ role: v.string(), content: v.string() }))
    ),
  },
  returns: v.string(),
  handler: async (_ctx, args) => {
    const systemInstruction = args.fieldContext
      ? `${PROFILE_FIELD_GUIDE}\n\nLietotājs pašlaik aizpilda lauku: ${args.fieldContext}.`
      : PROFILE_FIELD_GUIDE;

    const history = (args.history ?? [])
      .filter((msg) => msg.role === "user" || msg.role === "model")
      .map((msg) => ({
        role: msg.role as "user" | "model",
        content: msg.content,
      }));

    if (process.env.CLOUDFLARE_AI_API_KEY || process.env.CLOUDFLARE_API_TOKEN) {
      try {
        return await generateWithCloudflare({ message: args.message, systemInstruction, history });
      } catch (error) {
        return `⚠️ Cloudflare kļūda: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    if (process.env.NVIDIA_API_KEY) {
      try {
        return await generateWithNvidia({ message: args.message, systemInstruction, history });
      } catch (error) {
        return `⚠️ NVIDIA kļūda: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    if (process.env.OPENROUTER_API_KEY) {
      try {
        return await generateWithOpenRouter({
          message: args.message,
          systemInstruction,
          history,
        });
      } catch (error) {
        return `⚠️ OpenRouter kļūda: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    try {
      const client = getEmbeddingClient();
      const contents = [
        ...history
          .map((msg) => ({
            role: msg.role as "user" | "model",
            parts: [{ text: msg.content }],
          })),
        {
          role: "user" as const,
          parts: [{ text: args.message }],
        },
      ];

      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        config: { systemInstruction },
      });

      const text = response.text?.trim();
      if (!text) {
        return localProfileAssistantFallback(args.message, args.fieldContext);
      }
      return text;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return localProfileAssistantFallback(args.message, args.fieldContext);
    }
  },
});

export const backfillProfileEmbeddings = action({
  args: {
    limit: v.optional(v.number()),
    onlyMissingEmbedding: v.optional(v.boolean()),
  },
  returns: v.object({
    scheduled: v.number(),
    scanned: v.number(),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    scheduled: number;
    scanned: number;
  }> => {
    return await ctx.runMutation(internal.profiles.scheduleEmbeddingBackfill, {
      limit: args.limit,
      onlyMissingEmbedding: args.onlyMissingEmbedding,
    });
  },
});
