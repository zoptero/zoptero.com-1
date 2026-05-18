
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input3 } from "@/components/input3";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { WebsiteInput } from "@/components/website-input";

export default function TabSeo({ form, slugValue, slugCheckResult, profile, seoImagePreviewUrl, seoImagePreviewFile, removeSeoImage, setRemoveSeoImage, addSeoImageFiles, removeSeoImageFile, headerImagePreviewUrl, headerImagePreviewFile, removeHeaderImage, setRemoveHeaderImage, addHeaderImageFiles, removeHeaderImageFile }: any) {
  return (
    <>
      <FormField
        control={form.control}
        name="slug"
        render={({ field, fieldState }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Saite uz profilu</FormLabel>
              <span className={cn("text-xs", (field.value ?? "").length >= 30 ? "text-destructive font-semibold" : "text-muted-foreground")}>{(field.value ?? "").length}/30</span>
            </div>
            <FormControl>
              <WebsiteInput
                value={field.value ?? ""}
                onChange={(url) => {
                  const slug = url
                    .replace(/^https?:\/\/zoptero\.com\//i, "")
                    .replace(/[^a-z0-9]/g, "")
                    .trim()
                    .slice(0, 30);
                  field.onChange(slug);
                }}
                placeholder="mansprofils"
                prefix="https://zoptero.com/"
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
              <Textarea {...field} />
            </FormControl>
            <FormDescription className={cn("text-xs", (field.value ?? "").length > 160 && "text-destructive")}>Apraksts būs redzams meklēšanas rezultātos. Ieteicams līdz 160 simboliem.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <FormLabel>SEO attēls</FormLabel>
        <div className="flex flex-col gap-3 rounded-md md:max-w-[360px]">
          <div className="relative aspect-[3/1] w-full rounded-t-md bg-cover bg-center border max-h-[160px] md:max-h-[240px]">
            {seoImagePreviewUrl ? (
              <img
                src={seoImagePreviewUrl}
                alt="SEO attēla priekšskatījums"
                className="h-full w-full object-cover rounded-t-md"
              />
            ) : (
              <span className="text-muted-foreground px-3 text-xs w-full flex items-center justify-center h-full">
                Vēlamais izmērs 1200 x 630 px
              </span>
            )}
          </div>
          <FormDescription className="text-xs">
            Attēls līdz 5 MB.
          </FormDescription>
          <label className="mx-auto md:mx-0 flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent w-full max-w-[280px] text-center" style={{ width: '100%' }}>
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
        </div>
      </div>
      {/* Profila galvene */}
      <div className="space-y-2">
        <FormLabel>Profila galvene</FormLabel>
        <div className="flex flex-col gap-3 rounded-md md:max-w-[360px]">
          <div className="relative aspect-[3/1] w-full rounded-t-md bg-cover bg-center border md:max-h-[240px]">
            {headerImagePreviewUrl ? (
              <img
                src={headerImagePreviewUrl}
                alt="Profila galvenes priekšskatījums"
                className="h-full w-full object-cover rounded-t-md"
              />
            ) : (
              <span className="text-muted-foreground px-3 text-xs w-full flex items-center justify-center h-full">
                Vēlamais izmērs 1600 x 350 px
              </span>
            )}
          </div>
          <FormDescription className="text-xs">
            Attēls līdz 5 MB.
          </FormDescription>
          <label className="mx-auto md:mx-0 flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent w-full max-w-[280px] text-center">
            <Upload className="size-4" />
            Pievienot
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(event) => {
                if (!event.target.files) return;
                setRemoveHeaderImage(false);
                addHeaderImageFiles(event.target.files);
              }}
            />
          </label>
          <FormField
            control={form.control}
            name="profileHeaderURL"
            render={({ field }) => (
              <>
                {headerImagePreviewFile ? (
                  <button
                    type="button"
                    onClick={() => removeHeaderImageFile(headerImagePreviewFile.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive w-full max-w-[280px]"
                  >
                    <X className="size-3" /> Noņemt jauno galvenes attēlu
                  </button>
                ) : removeHeaderImage ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRemoveHeaderImage(false);
                      field.onChange(profile?.profileHeaderURL ?? "");
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full max-w-[280px]"
                  >
                    <X className="size-3" /> Atcelt galvenes attēla dzēšanu
                  </button>
                ) : field.value ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRemoveHeaderImage(true);
                      field.onChange("");
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive w-full max-w-[280px]"
                  >
                    <X className="size-3" /> Noņemt galvenes attēlu
                  </button>
                ) : null}
                <FormMessage />
              </>
            )}
          />
        </div>
      </div>
    </>
  );
}
