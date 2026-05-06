"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
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

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseCsv(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const urlOrEmptySchema = z
  .string()
  .trim()
  .max(250)
  .refine((value) => value === "" || isValidUrl(value), "Enter a valid URL.");

const profileFormSchema = z.object({
  displayName: z.string().trim().min(3, "Vārdam nepieciešams vismaz 3 simboli.").max(80),
  email: z.string().trim().email("Enter a valid email.").or(z.literal("")),
  phone: z.string().trim().max(30),
  city: z.string().trim().max(80),
  aboutMe: z.string().trim().max(2000),
  bio: z.string().trim().max(140),
  accountType: z.union([z.literal(""), z.literal("b2b"), z.literal("b2c")]),
  sector: z.string().trim().max(120),
  slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers, and hyphens only."),
  workingEnvironment: z.string().trim().max(120),
  onlineStatus: z.boolean(),
  strongKeywordsText: z.string().trim().max(500),
  searchTriggersText: z.string().trim().max(500),
  mediaUrl: urlOrEmptySchema,
  profileVideoUrl: urlOrEmptySchema,
  seoTitle: z.string().trim().max(120),
  seoDescription: z.string().trim().max(300),
  whatsapp: z.string().trim().max(120),
  instagram: z.string().trim().max(120),
  tiktok: z.string().trim().max(120),
  telegram: z.string().trim().max(120),
  facebook: z.string().trim().max(120),
  threads: z.string().trim().max(120),
  youtube: z.string().trim().max(120),
  linktree: urlOrEmptySchema,
  etsy: urlOrEmptySchema,
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
  onlineStatus: true,
  strongKeywordsText: "",
  searchTriggersText: "",
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

function DashboardProfileSkeleton() {
  return (
    <div className="w-full max-w-3xl">
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

          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-4">
              <Skeleton className="size-20 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-44" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Skeleton className="h-10 w-40" />
          </div>
        </CardContent>
      </Card>
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
  const lastResolvedAvatarKeyRef = useRef<string | null>(null);
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
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | undefined>(undefined);
  const [focusedField, setFocusedField] = useState<string | undefined>(undefined);
  const previewFile = files[0];
  const previewUrl = previewFile?.preview ?? (removeAvatar ? undefined : resolvedAvatarUrl);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      displayName: profile?.displayName ?? user?.fullName ?? "",
      email: profile?.email ?? user?.primaryEmailAddress?.emailAddress ?? "",
      phone: profile?.phone ?? "",
      city: profile?.city ?? "",
      aboutMe: profile?.aboutMe ?? "",
      bio: profile?.bio ?? "",
      accountType: profile?.accountType ?? "",
      sector: profile?.sector ?? "",
      slug: profile?.slug ?? "",
      workingEnvironment: profile?.workingEnvironment ?? "",
      onlineStatus: profile?.onlineStatus ?? true,
      strongKeywordsText: (profile?.strongKeywords ?? []).join(", "),
      searchTriggersText: (profile?.searchTriggers ?? []).join(", "),
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

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.id) {
      toast.error("You must be signed in to update your profile.");
      return;
    }

    let avatarKey: string | undefined;
    let avatarUrl: string | undefined;

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

    // If user explicitly removed existing avatar, pass empty string to trigger R2 cleanup
    const avatarDeletePayload =
      avatarKey !== undefined
        ? { avatarKey, avatarUrl }
        : removeAvatar
          ? { avatarKey: "", avatarUrl: "" }
          : {};

    await updateProfile({
      clerkId: user.id,
      ...avatarDeletePayload,
      displayName: values.displayName,
      email: values.email || undefined,
      phone: values.phone || undefined,
      city: values.city || undefined,
      aboutMe: values.aboutMe || undefined,
      bio: values.bio || undefined,
      accountType: values.accountType || undefined,
      sector: values.sector || undefined,
      slug: values.slug || undefined,
      workingEnvironment: values.workingEnvironment || undefined,
      onlineStatus: values.onlineStatus,
      strongKeywords: parseCsv(values.strongKeywordsText),
      searchTriggers: parseCsv(values.searchTriggersText),
      mediaUrl: values.mediaUrl || undefined,
      profileVideoUrl: values.profileVideoUrl || undefined,
      seoTitle: values.seoTitle || undefined,
      seoDescription: values.seoDescription || undefined,
      whatsapp: values.whatsapp || undefined,
      instagram: values.instagram || undefined,
      tiktok: values.tiktok || undefined,
      telegram: values.telegram || undefined,
      facebook: values.facebook || undefined,
      threads: values.threads || undefined,
      youtube: values.youtube || undefined,
      linktree: values.linktree || undefined,
      etsy: values.etsy || undefined,
      paymentCash: values.paymentCash,
      paymentBankTransfer: values.paymentBankTransfer,
      paymentCard: values.paymentCard,
    });

    setRemoveAvatar(false);
    toast.success("Profils saglabāts");
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

        <div className="w-full max-w-3xl">
          <DashboardProfileSkeleton />
        </div>
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
                <TabsTrigger value="uzdevumi">Uzdevumi</TabsTrigger>
                <TabsTrigger value="contact">Kontakti</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  </TabsContent>

                  <TabsContent value="social" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="@tavs_profils"
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
                                placeholder="facebook.com/tavslapa"
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
                                placeholder="@tavs_profils"
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
                                placeholder="@tavs_profils"
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
                                placeholder="youtube.com/@tavs_kanāls"
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
                                placeholder="https://linktr.ee/..."
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
                                placeholder="https://etsy.com/shop/..."
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="sector"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nozare</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="Piem., IT, Būvniecība, Tīrradne..."
                                helperText="Nozare, kurā darbojas vai piedāvā pakalpojumus."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="workingEnvironment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Darba vide</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="Attālināti, klātienē, hibrīds..."
                                helperText="Kā tu parasti strādā ar klientiem."
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
                      name="strongKeywordsText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Galvenās priekšrocības</FormLabel>
                          <FormControl>
                            <Textarea placeholder="dizains, foto, video, mārketings..." {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">Atslēgvārdi, kas labi raksturo tavu darbu. Ieraksti ar komatu atdalītus.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="searchTriggersText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meklēšanas trigerji</FormLabel>
                          <FormControl>
                            <Textarea placeholder="logotips, brand book, reklāma..." {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">Frāzes vai prasības, pēc kurām klienti var tevi atrast. Ieraksti ar komatu atdalītus.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="mediaUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Portfōlija saite</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="https://..."
                                helperText="Saite uz savu portfōliju vai galeriju."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="profileVideoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video prezentācija</FormLabel>
                            <FormControl>
                              <Input3
                                placeholder="https://..."
                                helperText="Saite uz video, kas prezentē tevi vai darbu."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="seoTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO nosaukums</FormLabel>
                          <FormControl>
                            <Input3
                              placeholder="Piem., Grāmatvedis Rīgā | Jānis Bērziņš"
                              helperText="Rādīsies meklēšanas rezultātos kā lapās nosaukums. Ieteicams līdz 60 rakstzīmēm."
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
                          <FormLabel>SEO apraksts</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Įss apraksts, ko redzēs Google meklēšanas rezultātos..." {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">Apraksts, kas rādīsies meklēšanas rezultātos zem nosaukuma. Ieteicams līdz 160 rakstzīmēm.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                    <Button type="submit" disabled={(!form.formState.isDirty && !previewFile && !removeAvatar) || form.formState.isSubmitting || uploadingAvatar}>
                      {uploadingAvatar ? "Augšupielādē attēlu..." : form.formState.isSubmitting ? "Saglabā..." : "Saglabāt"}
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
