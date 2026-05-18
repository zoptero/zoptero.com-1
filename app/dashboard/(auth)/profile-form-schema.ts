// Profile form schema and types for dashboard/profile page
import { z } from "zod";

const httpsUrlOrEmptySchema = z
  .string()
  .trim()
  .max(250)
  .refine(
    (value) => value === "" || (value.startsWith("https://") && /^https:\/\/.+\..+/.test(value)),
    "Norādi derīgu saiti ar https://",
  );

export const profileFormSchema = z.object({
  displayName: z.string().trim().min(3, "Vārdam nepieciešams vismaz 3 simboli.").max(80),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  regNr: z.string().trim().max(50).optional().or(z.literal("")),
  vatNr: z.string().trim().max(50).optional().or(z.literal("")),
  legalAddress: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email.").or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(
      (value) => value === "" || /^\+[1-9]\d{7,14}$/.test(value.replace(/[\s()-]/g, "")),
      "Norādi derīgu numuru, piemēram, +37120000000."
    ),
  city: z.string().trim().max(80),
  aboutMe: z.string().trim().max(2000),
  bio: z.string().trim().max(140),
  accountType: z.union([z.literal(""), z.literal("b2b"), z.literal("b2c")]),
  sector: z.string().trim().max(120),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers, and hyphens only.")
    .refine((value) => value === "" || value.length >= 3, "Vismaz 3 simboli."),
  workingEnvironment: z.string().trim().max(120),
  onlineStatus: z.boolean(),
  strongKeywords: z.array(z.string().min(2, "Vismaz 2 simboli.").max(24, "Maksimāli 24 simboli.")).max(5, "Maksimāli 5 atslēgvārdi."),
  hourPrice: z
    .string()
    .trim()
    .max(3, "Maksimāli 3 cipari.")
    .refine((value) => /^\d*$/.test(value), "Atļauti tikai cipari."),
  myServicesText: z.string().trim().max(500),
  mediaUrl: httpsUrlOrEmptySchema,
  profileVideoUrl: z.string().trim().max(250),
  seoTitle: z.string().trim().max(120),
  seoDescription: z.string().trim().max(300),
  whatsapp: z.string().trim().max(30),
  instagram: z.string().trim().max(250),
  linkedin: z.string().trim().max(250),
  tiktok: z.string().trim().max(250),
  telegram: z.string().trim().max(120),
  facebook: z.string().trim().max(250),
  threads: z.string().trim().max(250),
  youtube: z.string().trim().max(250),
  linktree: z.string().trim().max(250),
  pinterest: z.string().trim().max(250),
  etsy: z.string().trim().max(250),
  paymentCash: z.boolean(),
  paymentBankTransfer: z.boolean(),
  paymentCard: z.boolean(),
  deliveryInfo: z.string().trim().max(1000),
  profileHeaderURL: z.string().trim().max(250).optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
