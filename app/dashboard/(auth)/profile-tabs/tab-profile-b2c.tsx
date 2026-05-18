// Profile tab content component — B2C (personal)
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { Input3 } from "@/components/input3";
import React from "react";

export default function TabProfileB2C({ form, previewUrl, previewFile, removeAvatar, profile, addFiles, removeFile, setRemoveAvatar, setFocusedField }: any) {

  return (
    <>
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
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pilsēta</FormLabel>
              <FormControl>
                <Input3 helperText="Norādi pilsētu, kurā piedāvā savus pakalpojumus. Neobligāti." {...field} />
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
            <div className="text-xs text-muted-foreground">Apraksts būs redzams profilā.</div>
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
    </>
  );
}