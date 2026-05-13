"use client";
import { QRCodeSVG } from "qrcode.react";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { profileFormSchema, ProfileFormValues } from "./profile-form-schema";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  isValidUrl,
  normalizeSlug,
  parseCsv,
  parseDateFromInput,
  hasExactImageDimensions,
  getTodayStart,
  isValidPhoneNumber,
} from "./profile-utils";
import { CalendarIcon, Upload, X, ArrowRight } from "lucide-react";
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

import TabProfile from "./profile-tabs/tab-profile";
import TabContacts from "./profile-tabs/tab-contacts";
import TabServices from "./profile-tabs/tab-services";
import TabTasks from "./profile-tabs/tab-tasks";
import TabPhoto from "./profile-tabs/tab-photo";
import TabVideo from "./profile-tabs/tab-video";
import TabSeo from "./profile-tabs/tab-seo";
import TabQr from "./profile-tabs/tab-qr";
import TabPayments from "./profile-tabs/tab-payments";
import TabFaq from "./profile-tabs/tab-faq";
import TabReviews from "./profile-tabs/tab-reviews";
import TabClassfields from "./profile-tabs/tab-classfields";
import TabShop from "./profile-tabs/tab-shop";
import TabBlog from "./profile-tabs/tab-blog";
import TabDelivery from "./profile-tabs/tab-delivery";

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
  profileHeaderURL: "",
  whatsapp: "",
  instagram: "",
  tiktok: "",
  telegram: "",
  facebook: "",
  threads: "",
  youtube: "",
  linktree: "",
  linkedin: "",
  pinterest: "",
  etsy: "",
  paymentCash: false,
  paymentBankTransfer: false,
  paymentCard: false,
  deliveryInfo: "",
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
  delivery: ["deliveryInfo"],
};

function DashboardProfileSkeleton() {
  return (
    <div className="space-y-4 lg:pl-2.5">
      <div className="mb-4">
        <div className="flex w-max items-center gap-2 rounded-lg border p-1">
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <div className="flex w-full items-stretch gap-4">
        <div className="min-w-0 flex-1">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-3 w-80" />
              </div>
              <div className="flex items-center gap-4 mt-4">
                <Skeleton className="size-20 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <div className="flex justify-end mt-6">
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

  // Header image upload state
  const [{ files: headerImageFiles }, { addFiles: addHeaderImageFiles, removeFile: removeHeaderImageFile }] = useFileUpload({
    accept: "image/jpeg,image/png,image/webp,image/avif",
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });
  const [removeHeaderImage, setRemoveHeaderImage] = useState(false);
  const headerImagePreviewFile = headerImageFiles[0];
  // form is not defined yet, so headerImagePreviewUrl must be assigned after form is declared

  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeSeoImage, setRemoveSeoImage] = useState(false);
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | undefined>(undefined);

  const [resolvedSeoImageUrl, setResolvedSeoImageUrl] = useState<string | undefined>(undefined);
  const [resolvedHeaderUrl, setResolvedHeaderUrl] = useState<string | undefined>(undefined);
  const lastResolvedHeaderKeyRef = useRef<string | null>(null);
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
  // Now form is defined, so we can safely assign headerImagePreviewUrl
  const headerImagePreviewUrl = headerImagePreviewFile?.preview ?? (removeHeaderImage ? undefined : resolvedHeaderUrl || form.watch("profileHeaderURL") || profile?.profileHeaderURL);

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
      profileHeaderURL: profile?.profileHeaderURL ?? "",
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
      deliveryInfo: profile?.deliveryInfo ?? "",
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
    let cancelled = false;

    const resolveHeaderUrl = async () => {
      if (headerImagePreviewFile || removeHeaderImage) {
        setResolvedHeaderUrl(undefined);
        lastResolvedHeaderKeyRef.current = null;
        return;
      }

      const rawUrl = form.watch("profileHeaderURL") || profile?.profileHeaderURL;
      if (!rawUrl || !user?.id) {
        setResolvedHeaderUrl(undefined);
        lastResolvedHeaderKeyRef.current = null;
        return;
      }

      // If it's not an R2 URL, use it directly
      if (!rawUrl.includes("r2") && !rawUrl.includes("cloudflare")) {
        setResolvedHeaderUrl(rawUrl);
        return;
      }

      // Extract key from the full URL (similar to extractR2Key in profile-header.tsx)
      const idx = rawUrl.indexOf("uploads/");
      if (idx === -1) {
        setResolvedHeaderUrl(rawUrl);
        return;
      }
      const key = rawUrl.slice(idx);

      if (lastResolvedHeaderKeyRef.current === key && resolvedHeaderUrl) return;

      try {
        const { viewUrl } = await generateViewUrl({ clerkId: user.id, key });
        if (!cancelled) {
          setResolvedHeaderUrl(viewUrl);
          lastResolvedHeaderKeyRef.current = key;
        }
      } catch {
        if (!cancelled) setResolvedHeaderUrl(rawUrl);
      }
    };

    void resolveHeaderUrl();
    return () => { cancelled = true; };
  }, [headerImagePreviewFile, removeHeaderImage, form.watch("profileHeaderURL"), profile?.profileHeaderURL, user?.id, resolvedHeaderUrl, generateViewUrl]);

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
    let profileHeaderURL: string | undefined;
    // Upload new header image to R2 if a file was selected
    if (headerImagePreviewFile && headerImagePreviewFile.file instanceof File) {
      const file = headerImagePreviewFile.file;
      if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
        toast.error("Neatbalstīts galvenes attēla formāts. Izmantojiet JPG, PNG, WebP vai AVIF.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Galvenes attēls ir pārāk liels. Maksimālais izmērs ir 5 MB.");
        return;
      }
      try {
        const { uploadUrl, publicUrl } = await generateUploadUrl({
          clerkId: user.id,
          fileType: file.type,
          fileSize: file.size,
          displayName: values.displayName,
          usage: "header",
        });
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!uploadResponse.ok) {
          throw new Error(`Upload failed with status ${uploadResponse.status}`);
        }
        profileHeaderURL = publicUrl;
      } catch (err) {
        console.error("Header image upload failed", err);
        toast.error("Neizdevās augšupielādēt galvenes attēlu. Lūdzu, mēģiniet vēlreiz.");
        return;
      }
    }

    // If user explicitly removed existing header image, pass empty string to trigger R2 cleanup
    const headerImagePayload =
      profileHeaderURL !== undefined
        ? { profileHeaderURL }
        : removeHeaderImage
          ? { profileHeaderURL: "" }
          : {};

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
      ...headerImagePayload,
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
      ...(values.linkedin !== profile?.linkedin ? { linkedin: values.linkedin || "" } : {}),
      ...(values.youtube !== currentYoutube ? { youtube: values.youtube || "" } : {}),
      ...(values.pinterest !== profile?.pinterest ? { pinterest: values.pinterest || "" } : {}),
      ...(values.linktree !== currentLinktree ? { linktree: values.linktree || "" } : {}),
      ...(values.etsy !== currentEtsy ? { etsy: values.etsy || "" } : {}),
      paymentCash: values.paymentCash,
      paymentBankTransfer: values.paymentBankTransfer,
      paymentCard: values.paymentCard,
      deliveryInfo: values.deliveryInfo,
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
      if (headerImagePreviewFile) {
        removeHeaderImageFile(headerImagePreviewFile.id);
      }
      setRemoveAvatar(false);
      setRemoveSeoImage(false);
      setRemoveHeaderImage(false);
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
                <TabsTrigger value="buj">BUJ</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="payments">Apmaksa</TabsTrigger>
                <TabsTrigger value="delivery">Piegāde</TabsTrigger>
                <TabsTrigger value="atsauksmes">Atsauksmes</TabsTrigger>
                <TabsTrigger value="qr">QR</TabsTrigger>
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

        <div className="w-full">
          <div ref={profileCardWrapRef} className="flex w-full items-stretch gap-4">
            <div className="min-w-0 flex-1">
              <Card>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={handleSaveCurrentTab} className="space-y-6">
                      <TabsContent value="profile" className="space-y-4">
                        <TabProfile
                          form={form}
                          previewUrl={previewUrl}
                          previewFile={previewFile}
                          removeAvatar={removeAvatar}
                          profile={profile}
                          addFiles={addFiles}
                          removeFile={removeFile}
                          setRemoveAvatar={setRemoveAvatar}
                          setFocusedField={setFocusedField}
                        />
                      </TabsContent>
                      <TabsContent value="contact" className="space-y-4">
                        <TabContacts form={form} />
                      </TabsContent>
                      <TabsContent value="business" className="space-y-4">
                        <TabServices
                          form={form}
                          SECTOR_OPTIONS={SECTOR_OPTIONS}
                          parseDateFromInput={parseDateFromInput}
                          getTodayStart={getTodayStart}
                          format={format}
                        />
                      </TabsContent>
                      <TabsContent value="uzdevumi" className="space-y-4">
                        <TabTasks />
                      </TabsContent>
                      <TabsContent value="foto" className="space-y-4">
                        <TabPhoto form={form} />
                      </TabsContent>
                      <TabsContent value="video" className="space-y-4">
                        <TabVideo form={form} />
                      </TabsContent>
                      <TabsContent value="blogs" className="space-y-4">
                        <TabBlog />
                      </TabsContent>
                      <TabsContent value="veikals" className="space-y-4">
                        <TabShop />
                      </TabsContent>
                      <TabsContent value="sludinajumi" className="space-y-4">
                        <TabClassfields />
                      </TabsContent>
                      <TabsContent value="buj" className="space-y-4">
                        <TabFaq />
                      </TabsContent>
                      <TabsContent value="seo" className="space-y-4">
                        <TabSeo
                          form={form}
                          slugValue={slugValue}
                          slugCheckResult={slugCheckResult}
                          profile={profile}
                          seoImagePreviewUrl={seoImagePreviewUrl}
                          seoImagePreviewFile={seoImagePreviewFile}
                          removeSeoImage={removeSeoImage}
                          setRemoveSeoImage={setRemoveSeoImage}
                          addSeoImageFiles={addSeoImageFiles}
                          removeSeoImageFile={removeSeoImageFile}
                          headerImagePreviewUrl={headerImagePreviewUrl}
                          headerImagePreviewFile={headerImagePreviewFile}
                          removeHeaderImage={removeHeaderImage}
                          setRemoveHeaderImage={setRemoveHeaderImage}
                          addHeaderImageFiles={addHeaderImageFiles}
                          removeHeaderImageFile={removeHeaderImageFile}
                        />
                      </TabsContent>
                      <TabsContent value="payments" className="space-y-4">
                        <TabPayments form={form} />
                      </TabsContent>
                      <TabsContent value="delivery" className="space-y-4">
                        <TabDelivery form={form} />
                      </TabsContent>
                      <TabsContent value="atsauksmes" className="space-y-4">
                        <TabReviews />
                      </TabsContent>
                      <TabsContent value="qr" className="space-y-4">
                        <TabQr slugValue={slugValue} />
                      </TabsContent>
                      <div className="flex justify-center md:justify-end mt-6">
                        <Button
                          type="submit"
                          size="sm"
                          className="btn-cta"
                          disabled={
                            (!form.formState.isDirty && !previewFile && !removeAvatar && !seoImagePreviewFile && !removeSeoImage && !headerImagePreviewFile && !removeHeaderImage) || savingProfile || uploadingAvatar || uploadingSeoImage
                          }
                        >
                          {uploadingAvatar || uploadingSeoImage
                            ? "Augšupielādē attēlu..."
                            : savingProfile
                            ? "Saglabā..."
                            : (
                                <>
                                  Saglabāt
                                  <ArrowRight className="ms-2 h-4 w-4 inline" />
                                </>
                              )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            <div className="hidden shrink-0 xl:flex xl:w-80">
              <div className="sticky top-24 h-[calc(100vh-12rem)] w-full">
                <ProfileAssistantChat focusedField={focusedField} />
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </>
  );
}
