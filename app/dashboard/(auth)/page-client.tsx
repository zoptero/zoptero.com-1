"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { AnimatedUnderline } from "@/components/ui/tabs-animated";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  displayName: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z.string().trim().email("Enter a valid email.").or(z.literal("")),
  phone: z.string().trim().max(30),
  city: z.string().trim().max(80),
  aboutMe: z.string().trim().max(2000),
  bio: z.string().trim().max(500),
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

export default function DashboardPageClient() {
  const { user } = useUser();
  const profile = useQuery(api.profiles.getMe);
  const updateProfile = useMutation(api.profiles.update);
  const [activeTab, setActiveTab] = useState("profile");
  const [underlinePosition, setUnderlinePosition] = useState({ left: 0, width: 0 });
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    await updateProfile({
      clerkId: user.id,
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

    toast.success("Profile updated");
  };

  if (profile === undefined) {
    return (
      <>
        <div className="mb-4 flex flex-row items-center justify-between space-y-2 lg:pl-2.5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Mans profils</h1>
            <p className="text-muted-foreground text-sm">Pārvaldi savu publisko profilu un iestatījumus</p>
          </div>
        </div>

        <div className="w-full max-w-3xl">
          <Card>
            <CardContent className="py-6">Loading your profile data...</CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-row items-center justify-between space-y-2 lg:pl-2.5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Mans profils</h1>
          <p className="text-muted-foreground text-sm">Pārvaldi savu publisko profilu un iestatījumus</p>
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
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
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

        <div className="w-full max-w-3xl">
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
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="b2c">B2C</SelectItem>
                                <SelectItem value="b2b">B2B</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Public slug</FormLabel>
                            <FormControl>
                              <Input placeholder="your-public-slug" {...field} />
                            </FormControl>
                            <FormDescription>Used in your public profile URL.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="onlineStatus"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-md border p-3">
                            <div>
                              <FormLabel>Online status</FormLabel>
                              <FormDescription>Show as available on your profile.</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write a short introduction about yourself"
                              className="min-h-24 resize-y"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Max 500 characters.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aboutMe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About me</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Detailed information about your profile"
                              className="min-h-28 resize-y"
                              {...field}
                            />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} />
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
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+371 ..." {...field} />
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
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Riga" {...field} />
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
                              <Input placeholder="WhatsApp username or number" {...field} />
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
                              <Input placeholder="@yourhandle" {...field} />
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
                              <Input placeholder="facebook.com/yourpage" {...field} />
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
                              <Input placeholder="TikTok profile" {...field} />
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
                              <Input placeholder="Telegram username" {...field} />
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
                              <Input placeholder="Threads profile" {...field} />
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
                              <Input placeholder="YouTube channel" {...field} />
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
                            <FormLabel>Linktree URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linktr.ee/..." {...field} />
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
                            <FormLabel>Etsy URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://etsy.com/shop/..." {...field} />
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
                            <FormLabel>Sector</FormLabel>
                            <FormControl>
                              <Input placeholder="Business sector" {...field} />
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
                            <FormLabel>Working environment</FormLabel>
                            <FormControl>
                              <Input placeholder="Remote, on-site, hybrid..." {...field} />
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
                          <FormLabel>Strong keywords</FormLabel>
                          <FormControl>
                            <Textarea placeholder="keyword1, keyword2, keyword3" {...field} />
                          </FormControl>
                          <FormDescription>Comma-separated list.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="searchTriggersText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Search triggers</FormLabel>
                          <FormControl>
                            <Textarea placeholder="trigger1, trigger2" {...field} />
                          </FormControl>
                          <FormDescription>Comma-separated list.</FormDescription>
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
                            <FormLabel>Media URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
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
                            <FormLabel>Profile video URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://..." {...field} />
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
                          <FormLabel>SEO title</FormLabel>
                          <FormControl>
                            <Input placeholder="Search result title" {...field} />
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
                          <FormLabel>SEO description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Search result description" {...field} />
                          </FormControl>
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
                            <FormLabel>Cash</FormLabel>
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
                            <FormLabel>Bank transfer</FormLabel>
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
                            <FormLabel>Card</FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </>
  );
}
