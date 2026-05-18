// Services tab content component

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input3 } from "@/components/input3";
import { Input25 } from "@/components/input25";
import { Select14 } from "@/components/select14";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

export default function TabServices({ form, SECTOR_OPTIONS }: any) {
  return (
    <>
      <FormField
        control={form.control}
        name="myServicesText"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Pakalpojumu veidi</FormLabel>
              <span className="text-muted-foreground text-xs">{(field.value ?? "").length}/1000</span>
            </div>
            <FormControl>
              <Textarea placeholder="Norādi galvenos darbu veidus un specializāciju." maxLength={1000} {...field} />
            </FormControl>
            <FormDescription className="text-xs">Pievieno aprakstu brīvā formā, kādus pakalpojumus piedāvā un ko klients var sagaidīt.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2">
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
                  placeholder=""
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
        <FormField
          control={form.control}
          name="workingEnvironment"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Pakalpojumu specifika</FormLabel>
                <span className="text-muted-foreground text-xs">{(field.value ?? "").length}/120</span>
              </div>
              <FormControl>
                <Input3
                  placeholder="Piem., biroja darbi, remonts, u.tml."
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">Norādi, kāda ir pakalpojumu specifika un kurā vidē tie tiek veikti.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
