// Contacts tab content component
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input3 } from "@/components/input3";
import React from "react";

export default function TabContacts({ form }: any) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tālrunis</FormLabel>
              <FormControl>
                <Input3 placeholder="+371 ..." helperText="Pēc izvēles, lai klienti var ar tevi sazināties ātrāk." {...field} />
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
                <Input3 type="email" placeholder="you@example.com" helperText="Izmantosim saziņai un svarīgiem paziņojumiem." {...field} />
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
                <Input3 placeholder="https://..." helperText="Norādi saiti uz mājas lapu." {...field} />
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
                <Input3 placeholder="Rīga" helperText="Norādi pilsētu, kurā strādā vai esi pieejams." {...field} />
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
                <Input3 placeholder="+371 ..." helperText="Numurs, uz kuru klienti var rakstīt WhatsApp." {...field} />
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
                <Input3 placeholder="https://" helperText="Tavs Instagram lietotājvārds." {...field} />
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
                <Input3 placeholder="https://" helperText="Saite uz Facebook lapu vai profilu." {...field} />
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
                <Input3 placeholder="https://" helperText="Tavs TikTok lietotājvārds." {...field} />
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
                <Input3 placeholder="@tavs_profils" helperText="Tavs Telegram lietotājvārds." {...field} />
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
                <Input3 placeholder="https://" helperText="Tavs Threads lietotājvārds." {...field} />
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
                <Input3 placeholder="https://" helperText="Saite uz savu YouTube kanālu." {...field} />
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
                <Input3 placeholder="https://" helperText="Saite uz savu Linktree lapu." {...field} />
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
                <Input3 placeholder="https://" helperText="Saite uz savu Etsy veikalu." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
