"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Upload, X } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { AnimatedUnderline } from "@/components/ui/tabs-animated";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input3 } from "@/components/input3";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileAssistantChat from "@/components/ProfileAssistantChat";
import { Input25 } from "@/components/input25";
import { Select14 } from "@/components/select14";
import { Input7 } from "@/components/input7";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

function parseCsv(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDateFromInput(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

async function hasExactImageDimensions(
  file: File,
  expectedWidth: number,
  expectedHeight: number,
): Promise<boolean> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        resolve({ width: image.width, height: image.height });
      };
      image.onerror = () => {
        reject(new Error("Unable to read image dimensions"));
      };
      image.src = objectUrl;
    });

    return dimensions.width === expectedWidth && dimensions.height === expectedHeight;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function isValidPhoneNumber(value: string): boolean {
  const normalized = value.replace(/[\s()-]/g, "");
  return /^\+[1-9]\d{7,14}$/.test(normalized);
}

const urlOrEmptySchema = z
  .string()
  .trim()
  .max(250)
  .refine((value) => value === "" || isValidUrl(value), "Enter a valid URL.");

const httpsUrlOrEmptySchema = z
  .string()
  .trim()
  .max(250)
  .refine(
    (value) => value === "" || (value.startsWith("https://") && isValidUrl(value)),
    "Norādi derīgu saiti ar https://",
  );

const phoneOrEmptySchema = z
  .string()
  .trim()
  .max(30)
  .refine(
    (value) => value === "" || isValidPhoneNumber(value),
    "Norādi derīgu numuru, piemēram, +37120000000.",
  );

const SECTOR_OPTIONS = [
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
].map((option) => ({
  label: option,
  value: option,
}));

const profileFormSchema = z.object({
  displayName: z.string().trim().min(3, "Vārdam nepieciešams vismaz 3 simboli.").max(80),
  email: z.string().trim().email("Enter a valid email.").or(z.literal("")),
  phone: phoneOrEmptySchema,
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
  startDate: z.string().optional(),
  onlineStatus: z.boolean(),
  strongKeywords: z.array(z.string().min(2, "Vismaz 2 simboli.").max(24, "Maksimāli 24 simboli.")).max(5, "Maksimāli 5 atslēgvārdi."),
  hourPrice: z
    .string()
    .trim()
    .max(3, "Maksimāli 3 cipari.")
    .refine((value) => /^\d*$/.test(value), "Atļauti tikai cipari."),
  myServicesText: z.string().trim().max(500),
  mediaUrl: httpsUrlOrEmptySchema,
  profileVideoUrl: httpsUrlOrEmptySchema,
  seoTitle: z.string().trim().max(120),
  seoDescription: z.string().trim().max(300),
  whatsapp: phoneOrEmptySchema,
  instagram: httpsUrlOrEmptySchema,
  tiktok: httpsUrlOrEmptySchema,
  telegram: z.string().trim().max(120),
  facebook: httpsUrlOrEmptySchema,
  threads: httpsUrlOrEmptySchema,
  youtube: httpsUrlOrEmptySchema,
  linktree: httpsUrlOrEmptySchema,
  etsy: httpsUrlOrEmptySchema,
  paymentCash: z.boolean(),
  paymentBankTransfer: z.boolean(),
  paymentCard: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: ProfileFormValues = {
  displayName: "",
  email: "",
  phone: "",
  city: "",
  aboutMe: "",
  bio: "",
  accountType: "",
  sector: "",
  slug: "",
  workingEnvironment: "",
  startDate: "",
  onlineStatus: true,
  strongKeywords: [],
  hourPrice: "",
  myServicesText: "",
  mediaUrl: "",
  profileVideoUrl: "",
  seoTitle: "",
  seoDescription: "",
  whatsapp: "",
  instagram: "",
  tiktok: "",
  telegram: "",
  facebook: "",
  threads: "",
  youtube: "",
  linktree: "",
  etsy: "",
  paymentCash: false,
  paymentBankTransfer: false,
  paymentCard: false,
};

const TAB_VALIDATION_FIELDS: Partial<Record<string, Array<keyof ProfileFormValues>>> = {
  profile: ["displayName", "bio"],
  business: ["myServicesText", "workingEnvironment", "startDate", "strongKeywords", "hourPrice", "sector"],
  contact: [
    "phone",
    "email",
    "mediaUrl",
    "city",
    "whatsapp",
    "instagram",
    "facebook",
    "tiktok",
    "telegram",
    "threads",
    "youtube",
    "linktree",
    "etsy",
  ],
  video: ["profileVideoUrl"],
  seo: ["seoTitle", "seoDescription"],
  payments: ["paymentCash", "paymentBankTransfer", "paymentCard"],
};

function DashboardProfileSkeleton() {
  return (
    <div className="space-y-4 lg:pl-2.5">
      <div className="mb-4">
        <div className="flex w-max items-center gap-2 rounded-lg border p-1">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-18" />
          <Skeleton className="h-8 w-14" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>

      <div className="flex w-full items-stretch gap-4">
        <div className="min-w-0 flex-1">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-72" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-3 w-80" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>

              <div className="flex justify-end">
                <Skeleton className="h-10 w-40" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="hidden shrink-0 xl:flex xl:w-80">
          <Card className="w-full">
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <div className="mt-auto pt-2">
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPageClient() {
  const { user } = useUser();
  const profile = useQuery(api.profiles.getMe);
  const updateProfile = useMutation(api.profiles.update);
  const generateUploadUrl = useAction(api.media.generateUploadUrl);
  const generateViewUrl = useAction(api.media.generateViewUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingSeoImage, setUploadingSeoImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const lastResolvedAvatarKeyRef = useRef<string | null>(null);
  const lastResolvedSeoImageKeyRef = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [underlinePosition, setUnderlinePosition] = useState({ left: 0, width: 0 });
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [profileCardHeight, setProfileCardHeight] = useState<number | null>(null);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const profileCardWrapRef = useRef<HTMLDivElement>(null);
  const [{ files }, { addFiles, removeFile }] = useFileUpload({
    accept: "image/jpeg,image/png,image/webp,image/avif",
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });
  const [{ files: seoImageFiles }, { addFiles: addSeoImageFiles, removeFile: removeSeoImageFile }] = useFileUpload({
    accept: "image/jpeg,image/png,image/webp,image/avif",
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeSeoImage, setRemoveSeoImage] = useState(false);
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | undefined>(undefined);
  const [resolvedSeoImageUrl, setResolvedSeoImageUrl] = useState<string | undefined>(undefined);
  const [focusedField, setFocusedField] = useState<string | undefined>(undefined);
  const [slugCheckResult, setSlugCheckResult] = useState<{ available: boolean; reserved?: boolean; normalizedSlug: string } | null>(null);
  const previewFile = files[0];
  const previewUrl = previewFile?.preview ?? (removeAvatar ? undefined : resolvedAvatarUrl);
  const seoImagePreviewFile = seoImageFiles[0];
  const seoImagePreviewUrl = seoImagePreviewFile?.preview ?? (removeSeoImage ? undefined : resolvedSeoImageUrl);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const slugValue = form.watch("slug");

  useEffect(() => {
    form.reset({
      displayName: profile?.displayName ?? user?.fullName ?? "",
      email: profile?.email || user?.primaryEmailAddress?.emailAddress || "",
      phone: profile?.phone ?? "",
      city: profile?.city ?? "",
      aboutMe: profile?.aboutMe ?? "",
      bio: profile?.bio ?? "",
      accountType: profile?.accountType ?? "",
      sector: profile?.sector ?? "",
      slug: profile?.slug ?? "",
      workingEnvironment: profile?.workingEnvironment ?? "",
      startDate: profile?.startDate ?? "",
      onlineStatus: profile?.onlineStatus ?? true,
      strongKeywords: profile?.strongKeywords ?? [],
      hourPrice: profile?.hourPrice ?? "",
      myServicesText: (
        profile?.MyServices ??
        ((profile as unknown as { searchTriggers?: string[] })?.searchTriggers ?? [])
      ).join(", "),
      mediaUrl: profile?.mediaUrl ?? "",
      profileVideoUrl: profile?.profileVideoUrl ?? "",
      seoTitle: profile?.seoTitle ?? "",
      seoDescription: profile?.seoDescription ?? "",
      whatsapp: profile?.whatsapp ?? "",
      instagram: profile?.instagram ?? "",
      tiktok: profile?.tiktok ?? "",
      telegram: profile?.telegram ?? "",
      facebook: profile?.facebook ?? "",
      threads: profile?.threads ?? "",
      youtube: profile?.youtube ?? "",
      linktree: profile?.linktree ?? "",
      etsy: profile?.etsy ?? "",
      paymentCash: profile?.paymentCash ?? false,
      paymentBankTransfer: profile?.paymentBankTransfer ?? false,
      paymentCard: profile?.paymentCard ?? false,
    });
  }, [profile, user, form]);

  useEffect(() => {
    let cancelled = false;

    const resolveAvatarUrl = async () => {
      if (previewFile || removeAvatar) {
        setResolvedAvatarUrl(undefined);
        lastResolvedAvatarKeyRef.current = null;
        return;
      }

      if (!profile?.avatarKey || !user?.id) {
        setResolvedAvatarUrl(profile?.avatarUrl || undefined);
        lastResolvedAvatarKeyRef.current = null;
        return;
      }

      // Avoid re-requesting signed URLs for the same key on every re-render.
      if (lastResolvedAvatarKeyRef.current === profile.avatarKey && resolvedAvatarUrl) {
        return;
      }

      // Show any stored URL immediately while we resolve a guaranteed signed URL.
      if (!resolvedAvatarUrl && profile.avatarUrl) {
        setResolvedAvatarUrl(profile.avatarUrl);
      }

      try {
        const { viewUrl } = await generateViewUrl({
          clerkId: user.id,
          key: profile.avatarKey,
        });
        if (!cancelled) {
          setResolvedAvatarUrl(viewUrl);
          lastResolvedAvatarKeyRef.current = profile.avatarKey;
        }
      } catch (error) {
        if (!cancelled) {
          if (!profile.avatarUrl) {
            setResolvedAvatarUrl(undefined);
          }
          lastResolvedAvatarKeyRef.current = null;
        }
        console.error("Failed to resolve avatar view URL", error);
      }
    };

    void resolveAvatarUrl();
    return () => {
      cancelled = true;
    };
  }, [previewFile, removeAvatar, profile?.avatarUrl, profile?.avatarKey, user?.id, resolvedAvatarUrl, generateViewUrl]);

  useEffect(() => {
    let cancelled = false;

    const resolveSeoImageUrl = async () => {
      if (seoImagePreviewFile || removeSeoImage) {
        setResolvedSeoImageUrl(undefined);
        lastResolvedSeoImageKeyRef.current = null;
        return;
      }

      if (!profile?.seoImageKey || !user?.id) {
        setResolvedSeoImageUrl(undefined);
        lastResolvedSeoImageKeyRef.current = null;
        return;
      }

      if (lastResolvedSeoImageKeyRef.current === profile.seoImageKey && resolvedSeoImageUrl) {
        return;
      }

      try {
        const { viewUrl } = await generateViewUrl({
          clerkId: user.id,
          key: profile.seoImageKey,
        });
        if (!cancelled) {
          setResolvedSeoImageUrl(viewUrl);
          lastResolvedSeoImageKeyRef.current = profile.seoImageKey;
        }
      } catch (error) {
        if (!cancelled) {
          setResolvedSeoImageUrl(undefined);
          lastResolvedSeoImageKeyRef.current = null;
        }
        console.error("Failed to resolve SEO image view URL", error);
      }
    };

    void resolveSeoImageUrl();
    return () => {
      cancelled = true;
    };
  }, [seoImagePreviewFile, removeSeoImage, profile?.seoImageKey, user?.id, resolvedSeoImageUrl, generateViewUrl]);

  useEffect(() => {
    const updateUnderlineAndScroll = () => {
      if (!tabsListRef.current) return;

      const activeTrigger = tabsListRef.current.querySelector(
        `[data-state="active"]`
      ) as HTMLElement | null;

      if (!activeTrigger) return;

      setUnderlinePosition({
        left: activeTrigger.offsetLeft,
        width: activeTrigger.offsetWidth,
      });

      if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        const scrollTo =
          activeTrigger.offsetLeft - el.clientWidth / 2 + activeTrigger.offsetWidth / 2;
        el.scrollTo({ left: Math.max(0, scrollTo), behavior: "smooth" });
      }
    };

    updateUnderlineAndScroll();
    window.addEventListener("resize", updateUnderlineAndScroll);

    return () => {
      window.removeEventListener("resize", updateUnderlineAndScroll);
    };
  }, [activeTab]);

  useEffect(() => {
    const element = profileCardWrapRef.current;
    if (!element) {
      return;
    }

    const updateHeight = () => {
      const nextHeight = Math.ceil(element.getBoundingClientRect().height);
      setProfileCardHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [activeTab, profile, uploadingAvatar, removeAvatar, files.length]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const updateShadows = () => {
      setShowLeftShadow(el.scrollLeft > 0);
      setShowRightShadow(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };

    updateShadows();
    el.addEventListener("scroll", updateShadows);
    window.addEventListener("resize", updateShadows);

    return () => {
      el.removeEventListener("scroll", updateShadows);
      window.removeEventListener("resize", updateShadows);
    };
  }, []);

  const saveProfile = async (values: ProfileFormValues) => {
    if (!user?.id) {
      toast.error("You must be signed in to update your profile.");
      return;
    }

    // Check slug availability only on save (not on every keystroke)
    if (values.slug && values.slug.length >= 3 && values.slug !== profile?.slug) {
      try {
        const response = await fetch("/api/check-slug", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: values.slug, clerkId: user.id }),
        });

        if (!response.ok) {
          throw new Error(`Check failed: ${response.statusText}`);
        }

        const result = await response.json();
        setSlugCheckResult(result);

        if (!result.available) {
          toast.error("Šī saite jau tiek izmantota. Lūdzu, izvēlieties citu.");
          return;
        }
      } catch (error) {
        console.error("Failed to check slug availability", error);
        toast.error("Neizdevās pārbaudīt saites pieejamību.");
        return;
      }
    } else if (!values.slug) {
      setSlugCheckResult(null);
    }

    let avatarKey: string | undefined;
    let avatarUrl: string | undefined;
    let seoImageKey: string | undefined;
    let seoImageUrl: string | undefined;

    // Upload new avatar to R2 if a file was selected
    if (previewFile && previewFile.file instanceof File) {
      const file = previewFile.file;
      if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
        toast.error("Neatbalstīts attēla formāts. Izmantojiet JPG, PNG, WebP vai AVIF.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Attēls ir pārāk liels. Maksimālais izmērs ir 5 MB.");
        return;
      }
      try {
        setUploadingAvatar(true);
        const { fileKey, uploadUrl, publicUrl } = await generateUploadUrl({
          clerkId: user.id,
          fileType: file.type,
          fileSize: file.size,
          displayName: values.displayName,
          usage: "avatar",
        });
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!uploadResponse.ok) {
          throw new Error(`Upload failed with status ${uploadResponse.status}`);
        }
        avatarKey = fileKey;
        avatarUrl = publicUrl;
      } catch (err) {
        console.error("Avatar upload failed", err);
        toast.error("Neizdevās augšupielādēt attēlu. Lūdzu, mēģiniet vēlreiz.");
        return;
      } finally {
        setUploadingAvatar(false);
      }
    }

    if (seoImagePreviewFile && seoImagePreviewFile.file instanceof File) {
      const file = seoImagePreviewFile.file;
      if (![
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
      ].includes(file.type)) {
        toast.error("Neatbalstīts SEO attēla formāts. Izmantojiet JPG, PNG, WebP vai AVIF.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("SEO attēls ir pārāk liels. Maksimālais izmērs ir 5 MB.");
        return;
      }

      const hasRequiredDimensions = await hasExactImageDimensions(file, 1200, 600);
      if (!hasRequiredDimensions) {
        toast.error("SEO attēlam jābūt tieši 1200 x 600 px.");
        return;
      }

      try {
        setUploadingSeoImage(true);
        const { fileKey, uploadUrl, publicUrl } = await generateUploadUrl({
          clerkId: user.id,
          fileType: file.type,
          fileSize: file.size,
          displayName: values.displayName,
          title: "seo-image",
          usage: "seo",
        });

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed with status ${uploadResponse.status}`);
        }

        seoImageKey = fileKey;
        seoImageUrl = publicUrl;
      } catch (error) {
        console.error("SEO image upload failed", error);
        toast.error("Neizdevās augšupielādēt SEO attēlu. Lūdzu, mēģiniet vēlreiz.");
        return;
      } finally {
        setUploadingSeoImage(false);
      }
    }

    // If user explicitly removed existing avatar, pass empty string to trigger R2 cleanup
    const avatarDeletePayload =
      avatarKey !== undefined
        ? { avatarKey, avatarUrl }
        : removeAvatar
          ? { avatarKey: "", avatarUrl: "" }
          : {};

    const seoImagePayload =
      seoImageKey !== undefined
        ? { seoImageKey }
        : removeSeoImage
          ? { seoImageKey: "" }
          : {};

    const currentStartDate = profile?.startDate ?? "";
    const currentWorkingEnvironment = profile?.workingEnvironment ?? "";
    const currentBio = profile?.bio ?? "";
    const currentCity = profile?.city ?? "";
    const clerkEmail = user.primaryEmailAddress?.emailAddress ?? "";
    const currentEmail = profile?.email || clerkEmail;
    const currentMediaUrl = profile?.mediaUrl ?? "";
    const currentHourPrice = profile?.hourPrice ?? "";
    const currentProfileVideoUrl = profile?.profileVideoUrl ?? "";
    const currentSeoTitle = profile?.seoTitle ?? "";
    const currentSeoDescription = profile?.seoDescription ?? "";
    const currentYoutube = profile?.youtube ?? "";
    const currentWhatsapp = profile?.whatsapp ?? "";
    const currentInstagram = profile?.instagram ?? "";
    const currentFacebook = profile?.facebook ?? "";
    const currentTiktok = profile?.tiktok ?? "";
    const currentTelegram = profile?.telegram ?? "";
    const currentThreads = profile?.threads ?? "";
    const currentLinktree = profile?.linktree ?? "";
    const currentEtsy = profile?.etsy ?? "";

    const payload = {
      clerkId: user.id,
      ...avatarDeletePayload,
      ...seoImagePayload,
      displayName: values.displayName,
      ...(values.email !== currentEmail ? { email: values.email || clerkEmail } : {}),
      phone: values.phone || undefined,
      ...(values.city !== currentCity ? { city: values.city || "" } : {}),
      aboutMe: values.aboutMe || undefined,
      ...(values.bio !== currentBio ? { bio: values.bio || "" } : {}),
      accountType: values.accountType || undefined,
      sector: values.sector || undefined,
      slug: values.slug ? normalizeSlug(values.slug) : undefined,
      ...(values.workingEnvironment !== currentWorkingEnvironment
        ? { workingEnvironment: values.workingEnvironment || "" }
        : {}),
      ...(values.startDate !== currentStartDate ? { startDate: values.startDate || "" } : {}),
      onlineStatus: values.onlineStatus,
      strongKeywords: values.strongKeywords,
      ...(values.hourPrice !== currentHourPrice ? { hourPrice: values.hourPrice || "" } : {}),
      MyServices: parseCsv(values.myServicesText),
      ...(values.mediaUrl !== currentMediaUrl ? { mediaUrl: values.mediaUrl || "" } : {}),
      ...(values.profileVideoUrl !== currentProfileVideoUrl
        ? { profileVideoUrl: values.profileVideoUrl || "" }
        : {}),
      ...(values.seoTitle !== currentSeoTitle ? { seoTitle: values.seoTitle || "" } : {}),
      ...(values.seoDescription !== currentSeoDescription
        ? { seoDescription: values.seoDescription || "" }
        : {}),
      ...(values.whatsapp !== currentWhatsapp ? { whatsapp: values.whatsapp || "" } : {}),
      ...(values.instagram !== currentInstagram ? { instagram: values.instagram || "" } : {}),
      ...(values.tiktok !== currentTiktok ? { tiktok: values.tiktok || "" } : {}),
      ...(values.telegram !== currentTelegram ? { telegram: values.telegram || "" } : {}),
      ...(values.facebook !== currentFacebook ? { facebook: values.facebook || "" } : {}),
      ...(values.threads !== currentThreads ? { threads: values.threads || "" } : {}),
      ...(values.youtube !== currentYoutube ? { youtube: values.youtube || "" } : {}),
      ...(values.linktree !== currentLinktree ? { linktree: values.linktree || "" } : {}),
      ...(values.etsy !== currentEtsy ? { etsy: values.etsy || "" } : {}),
      paymentCash: values.paymentCash,
      paymentBankTransfer: values.paymentBankTransfer,
      paymentCard: values.paymentCard,
    };

    try {
      setSavingProfile(true);
      await updateProfile(payload);

      // Clear local upload queue so later saves (e.g. bio only) don't re-upload avatar.
      if (previewFile) {
        removeFile(previewFile.id);
      }
      if (seoImagePreviewFile) {
        removeSeoImageFile(seoImagePreviewFile.id);
      }

      if (avatarUrl) {
        setResolvedAvatarUrl(avatarUrl);
      }
      if (seoImageUrl) {
        setResolvedSeoImageUrl(seoImageUrl);
      }

      setRemoveAvatar(false);
      setRemoveSeoImage(false);
      toast.success("Izmaiņas saglabātas");
    } catch (error) {
      console.error("Profile update failed", error);
      const errorMessage = error instanceof Error ? error.message : "Neizdevās saglabāt izmaiņas.";
      toast.error(errorMessage);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveCurrentTab = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fieldsToValidate = TAB_VALIDATION_FIELDS[activeTab] ?? [];
    const isValid = fieldsToValidate.length === 0 ? true : await form.trigger(fieldsToValidate);

    if (!isValid) {
      toast.error("Pārbaudi laukus aktīvajā sadaļā.");
      return;
    }

    await saveProfile(form.getValues());
  };

  if (profile === undefined) {
    return (
      <>
        <div className="mb-4 flex flex-row items-center justify-between space-y-2 lg:pl-2.5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Mana informācija</h1>
            <p className="text-muted-foreground text-sm">Pārvaldi savus datus un savu redzamību.</p>
          </div>
        </div>

        <DashboardProfileSkeleton />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-row items-center justify-between space-y-2 lg:pl-2.5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Mana informācija</h1>
          <p className="text-muted-foreground text-sm">Pārvaldi savus datus un savu redzamību.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:pl-2.5">
        <div className="relative mb-4">
          {/* Left shadow mask */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent transition-opacity duration-200"
            style={{ opacity: showLeftShadow ? 1 : 0 }}
          />
          {/* Right shadow mask */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent transition-opacity duration-200"
            style={{ opacity: showRightShadow ? 1 : 0 }}
          />
          {/* Scroll container */}
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide overflow-x-auto"
          >
            <div ref={tabsListRef} className="relative w-max">
              <TabsList className="z-10">
                <TabsTrigger value="profile">Profils</TabsTrigger>
                <TabsTrigger value="business">Pakalpojumi</TabsTrigger>
                <TabsTrigger value="contact">Kontakti</TabsTrigger>
                <TabsTrigger value="uzdevumi">Uzdevumi</TabsTrigger>
                <TabsTrigger value="foto">Foto</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="blogs">Blogs</TabsTrigger>
                <TabsTrigger value="veikals">Veikals</TabsTrigger>
                <TabsTrigger value="sludinajumi">Sludinājumi</TabsTrigger>
                <TabsTrigger value="qr">QR</TabsTrigger>
                <TabsTrigger value="buj">BUJ</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="payments">Apmaksa</TabsTrigger>
                <TabsTrigger value="atsauksmes">Atsauksmes</TabsTrigger>
              </TabsList>
              <AnimatedUnderline
                orientation="horizontal"
                style={{
                  left: underlinePosition.left,
                  width: underlinePosition.width,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex w-full items-stretch gap-4">
          <div ref={profileCardWrapRef} className="min-w-0 flex-1">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={handleSaveCurrentTab} className="space-y-6">
                  <TabsContent value="profile" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vārds Uzvārds</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="Piem., Jānis Bērziņš"
                                helperText="Vārds būs redzams profilā."
                                onFocus={() => setFocusedField("Vārds Uzvārds")}
                                {...field}
                                onBlur={() => { field.onBlur(); setFocusedField(undefined); }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Īss apraksts par mani</FormLabel>
                            <span className="text-muted-foreground text-xs">{(field.value ?? "").length}/140</span>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="Dažos vārdos pastāsti par sevi..."
                              className="min-h-24 resize-y"
                              maxLength={140}
                              onFocus={() => setFocusedField("Īss apraksts par mani")}
                              {...field}
                              onBlur={() => { field.onBlur(); setFocusedField(undefined); }}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">Apraksts būs redzams profilā.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aboutMe"
                      render={() => (
                        <FormItem>
                          <FormLabel>Profila attēls</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Avatar className="size-20 shrink-0">
                                <AvatarImage src={previewUrl} alt="Profila attēls" />
                                <AvatarFallback className="text-lg">
                                  {(form.watch("displayName")?.[0] ?? "?").toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col gap-2">
                                <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent">
                                  <Upload className="size-4" />
                                  Pievienot attēlu
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    className="sr-only"
                                    onChange={(e) => {
                                      if (e.target.files) addFiles(e.target.files);
                                    }}
                                  />
                                </label>
                                {previewFile ? (
                                  <button
                                    type="button"
                                    onClick={() => removeFile(previewFile.id)}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="size-3" /> Noņemt jauno attēlu
                                  </button>
                                ) : removeAvatar ? (
                                  <button
                                    type="button"
                                    onClick={() => setRemoveAvatar(false)}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                  >
                                    <X className="size-3" /> Atcelt dzēšanu
                                  </button>
                                ) : profile?.avatarKey ? (
                                  <button
                                    type="button"
                                    onClick={() => setRemoveAvatar(true)}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="size-3" /> Dzēst attēlu
                                  </button>
                                ) : null}
                                <p className="text-xs text-muted-foreground">Izvēlies savu attēlu vai logo līdz 5MB.</p>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="contact" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tālrunis</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="+371 ..."
                                helperText="Pēc izvēles, lai klienti var ar tevi sazināties ātrāk."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-pasts</FormLabel>
                            <FormControl>
                              <Input3
                                type="email"
                                placeholder="you@example.com"
                                helperText="Izmantosim saziņai un svarīgiem paziņojumiem."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mediaUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mājas lapa</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="https://..."
                                helperText="Norādi saiti uz mājas lapu."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pilsēta</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="Rīga"
                                helperText="Norādi pilsētu, kurā strādā vai esi pieejams."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="+371 ..."
                                helperText="Numurs, uz kuru klienti var rakstīt WhatsApp."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="https://"
                                helperText="Tavs Instagram lietotājvārds."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="https://"
                                helperText="Saite uz Facebook lapu vai profilu."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="tiktok"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TikTok</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="https://"
                                helperText="Tavs TikTok lietotājvārds."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="telegram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telegram</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="@tavs_profils"
                                helperText="Tavs Telegram lietotājvārds."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="threads"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Threads</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="https://"
                                helperText="Tavs Threads lietotājvārds."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="youtube"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="https://"
                                helperText="Saite uz savu YouTube kanālu."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="linktree"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Linktree</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="https://"
                                helperText="Saite uz savu Linktree lapu."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="etsy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Etsy</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="https://"
                                helperText="Saite uz savu Etsy veikalu."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="business" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="myServicesText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pakalpojumu veidi</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Norādi galvenos darbu veidus un specializāciju." {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">Pievieno aprakstu brīvā formā, kādus pakalpojumus piedāvā un ko klients var sagaidīt</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="workingEnvironment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pakalpojumu specifika</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="Attālināti, klātienē, hibrīds..."
                                helperText="Kāds šobrīd ir vēlamais veicamo pakalpojumu formāts."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pakalpojumu sniegšanas datums</FormLabel>
                            <FormControl>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-between text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    {field.value ? format(parseDateFromInput(field.value) ?? new Date(field.value), "PPP") : "Izvēlies datumu"}
                                    <CalendarIcon className="ml-2 size-4 opacity-60" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2" align="start">
                                  {(() => {
                                    const todayStart = getTodayStart();
                                    return (
                                  <Calendar
                                    mode="single"
                                    selected={parseDateFromInput(field.value)}
                                    onSelect={(date) => {
                                      if (!date) {
                                        form.setValue("startDate", "", {
                                          shouldDirty: true,
                                          shouldTouch: true,
                                          shouldValidate: true,
                                        });
                                        return;
                                      }

                                      if (date < todayStart) {
                                        return;
                                      }

                                      form.setValue("startDate", format(date, "yyyy-MM-dd"), {
                                        shouldDirty: true,
                                        shouldTouch: true,
                                        shouldValidate: true,
                                      });
                                    }}
                                    disabled={(date) => date < todayStart}
                                    captionLayout="dropdown"
                                  />
                                    );
                                  })()}
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormDescription className="text-xs">No kura datuma varat sniegt pakalpojumus. Neobligāti.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="strongKeywords"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Atslēgvārdi</FormLabel>
                              <span className={`text-xs tabular-nums ${field.value.length >= 5 ? "text-destructive font-medium" : "text-muted-foreground"}`}>{field.value.length}/5</span>
                            </div>
                            <FormControl>
                              <Input25
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Piem., elektriķis, seo, galdnieks"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">Norādi atslēgvārdus, kuri palīdzētu MI atrast profilu. Spied Enter vai komatu, lai pievienotu piecus svarīgākos.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hourPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stundas likme</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="Piem., 35"
                                helperText="Norādiet stundas likmi. Neobligāti."
                                inputMode="numeric"
                                maxLength={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="sector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nozare</FormLabel>
                          <FormControl>
                            <Select14
                              options={SECTOR_OPTIONS}
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              placeholder="Izvēlies nozari"
                              searchPlaceholder="Meklē nozari..."
                              emptyLabel="Nozare nav atrasta"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">Norādi pakalpojumu nozari, lai vieglāk MI būtu atrast informāciju.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </TabsContent>

                  <TabsContent value="video" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="profileVideoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video</FormLabel>
                          <FormControl>
                            <Input3
                              placeholder="https://..."
                                helperText="Norādi saiti uz video resursu."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Saite uz profilu</FormLabel>
                          <FormControl>
                            <Input7
                              value={field.value ?? ""}
                              onChange={(nextValue) => {
                                const normalized = nextValue
                                  .replace(/^https?:\/\/zoptero\.com\//i, "")
                                  .trim();
                                field.onChange(normalized);
                              }}
                              placeholder="mans-profils"
                              baseUrl="https://zoptero.com/"
                            />
                          </FormControl>
                          <FormDescription
                            className={cn(
                              "text-xs",
                              fieldState.error?.message && "text-destructive",
                              !fieldState.error?.message && slugValue && slugValue.length >= 3 && slugCheckResult && !slugCheckResult.available && "text-destructive",
                              !fieldState.error?.message && slugValue && slugValue.length >= 3 && slugCheckResult?.available && "text-emerald-600",
                            )}
                          >
                            {fieldState.error?.message
                              ? fieldState.error.message
                              : slugValue && slugValue.length >= 3 && slugCheckResult
                                ? slugCheckResult.available
                                  ? "Saite saglabāta un varat to lietot."
                                  : "Nevarat izmantot šo saiti. Izvēlies citu."
                                : "Izvēlies savu publiskā profila adresi platformā."}
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seoTitle"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>SEO virsraksts</FormLabel>
                            <span className="text-muted-foreground text-xs">{(field.value ?? "").length}/60</span>
                          </div>
                          <FormControl>
                            <Input3
                              placeholder="Piem., Grāmatvedis Rīgā | Jānis Bērziņš"
                              helperText="Virsraksts būs redzams meklēšanas rezultātos. Ieteicams līdz 60 simboliem."
                              helperTextClassName={(field.value ?? "").length > 60 ? "text-destructive" : undefined}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="seoDescription"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>SEO apraksts</FormLabel>
                            <span className="text-muted-foreground text-xs">{(field.value ?? "").length}/160</span>
                          </div>
                          <FormControl>
                            <Textarea placeholder="Įss apraksts, ko redzēs Google meklēšanas rezultātos..." {...field} />
                          </FormControl>
                          <FormDescription className={cn("text-xs", (field.value ?? "").length > 160 && "text-destructive")}>Apraksts būs redzams meklēšanas rezultātos. Ieteicams līdz 160 simboliem.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>SEO attēls</FormLabel>
                      <div className="flex flex-col gap-3 rounded-md md:max-w-[360px]">
                        <div className="w-full max-w-[280px]">
                          <div className="bg-muted flex aspect-[2/1] w-full items-center justify-center overflow-hidden rounded-md border">
                            {seoImagePreviewUrl ? (
                              <img
                                src={seoImagePreviewUrl}
                                alt="SEO attēla priekšskatījums"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-muted-foreground px-3 text-xs w-full flex items-center justify-center h-full">
                                1200 x 630 px
                              </span>
                            )}
                          </div>
                        </div>
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent w-full max-w-[280px] text-center" style={{ width: '100%' }}>
                          <Upload className="size-4" />
                          Pievienot
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            className="sr-only"
                            onChange={(event) => {
                              if (!event.target.files) {
                                return;
                              }
                              setRemoveSeoImage(false);
                              addSeoImageFiles(event.target.files);
                            }}
                          />
                        </label>
                        {seoImagePreviewFile ? (
                          <button
                            type="button"
                            onClick={() => removeSeoImageFile(seoImagePreviewFile.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive w-full max-w-[280px]"
                          >
                            <X className="size-3" /> Noņemt jauno SEO attēlu
                          </button>
                        ) : removeSeoImage ? (
                          <button
                            type="button"
                            onClick={() => setRemoveSeoImage(false)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full max-w-[280px]"
                          >
                            <X className="size-3" /> Atcelt SEO attēla dzēšanu
                          </button>
                        ) : profile?.seoImageKey ? (
                          <button
                            type="button"
                            onClick={() => setRemoveSeoImage(true)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive w-full max-w-[280px]"
                          >
                            <X className="size-3" /> Dzēst SEO attēlu
                          </button>
                        ) : null}
                        <FormDescription className="text-xs">
                          Profila saites priekšskatījuma attēls līdz 5 MB.
                        </FormDescription>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="payments" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="paymentCash"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-md border p-3">
                            <FormLabel>Skaidra nauda</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentBankTransfer"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-md border p-3">
                            <FormLabel>Bankas pārskaitījums</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentCard"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-md border p-3">
                            <FormLabel>Bankas karte</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={(!form.formState.isDirty && !previewFile && !removeAvatar && !seoImagePreviewFile && !removeSeoImage) || savingProfile || uploadingAvatar || uploadingSeoImage}>
                      {uploadingAvatar || uploadingSeoImage ? "Augšupielādē attēlu..." : savingProfile ? "Saglabā..." : "Saglabāt"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          </div>
          <div
            className="hidden shrink-0 xl:flex xl:w-80"
            style={profileCardHeight ? { height: `${profileCardHeight}px` } : undefined}
          >
            <ProfileAssistantChat focusedField={focusedField} />
          </div>
        </div>
      </Tabs>
    </>
  );
}
