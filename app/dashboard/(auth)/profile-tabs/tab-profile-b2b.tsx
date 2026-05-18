// Profile tab content component — B2B (company)
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { Input3 } from "@/components/input3";
import React from "react";

export default function TabProfileB2B({ form, previewUrl, previewFile, removeAvatar, profile, addFiles, removeFile, setRemoveAvatar, setFocusedField }: any) {

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Uzņēmuma nosaukums</FormLabel>
              <FormControl>
                <Input3
                  helperText="Uzņēmuma nosaukums būs redzams profilā."
                  onFocus={() => setFocusedField("Uzņēmuma nosaukums")}
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
          name="regNr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reģistrācijas Nr.</FormLabel>
              <FormControl>
                <Input3
                  placeholder="Piem., 40123456789"
                  helperText="Uzņēmuma reģistrācijas numurs."
                  onFocus={() => setFocusedField("Reģistrācijas Nr.")}
                  {...field}
                  onBlur={() => { field.onBlur(); setFocusedField(undefined); }}
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
          name="vatNr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PVN Nr.</FormLabel>
              <FormControl>
                <Input3
                  placeholder="Piem., LV40123456789"
                  helperText="Pievienotās vērtības nodokļa numurs."
                  onFocus={() => setFocusedField("PVN Nr.")}
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
                <Input3 helperText="Norādi pilsētu, kurā piedāvā savus pakalpojumus." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="legalAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Juridiskā adrese</FormLabel>
            <FormControl>
              <Input3
                placeholder="Piem., Ielas iela 1, Rīga, LV-1001"
                helperText="Uzņēmuma juridiskā adrese."
                onFocus={() => setFocusedField("Juridiskā adrese")}
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
        name="actualAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Faktiskā adrese</FormLabel>
            <FormControl>
              <Input3
                placeholder="Piem., Ielas iela 1, Rīga, LV-1001"
                helperText="Uzņēmums faktiskā adrese."
                onFocus={() => setFocusedField("Faktiskā adrese")}
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
        name="bio"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Īss apraksts par uzņēmumu</FormLabel>
              <span className="text-muted-foreground text-xs">{(field.value ?? "").length}/140</span>
            </div>
            <FormControl>
              <Textarea
                placeholder="Dažos vārdos pastāsti par uzņēmumu..."
                className="min-h-24 resize-y"
                maxLength={140}
                onFocus={() => setFocusedField("Īss apraksts par uzņēmumu")}
                {...field}
                onBlur={() => { field.onBlur(); setFocusedField(undefined); }}
              />
            </FormControl>
            <div className="text-xs text-muted-foreground">Apraksts būs redzams profilā.</div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormItem>
        <FormLabel>Uzņēmuma logo</FormLabel>
        <FormControl>
          <div className="flex items-center gap-4">
            <Avatar className="size-20 shrink-0">
              <AvatarImage src={previewUrl} alt="Logo" />
              <AvatarFallback className="text-lg">
                {(form.watch("companyName")?.[0] ?? (form.watch("displayName")?.[0] ?? "?")).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent">
                <Upload className="size-4" />
                Pievienot logo
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
                  <X className="size-3" /> Noņemt jauno logo
                </button>
              ) : removeAvatar ? (
                <button
                  type="button"
                  onClick={() => setRemoveAvatar(false)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" /> Atcelt dzēšanu
                </button>
              ) : profile?.avatarKey || profile?.avatarUrl ? (
                <button
                  type="button"
                  onClick={() => setRemoveAvatar(true)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3" /> Dzēst logo
                </button>
              ) : null}
              <p className="text-xs text-muted-foreground">Izvēlies uzņēmuma logo līdz 5MB.</p>
            </div>
          </div>
        </FormControl>
      </FormItem>

    </>
  );
}