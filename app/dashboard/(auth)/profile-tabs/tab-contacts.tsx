// Contacts tab content component
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input3 } from "@/components/input3";
import { WebsiteInput } from "@/components/website-input";
import React from "react";

export default function TabContacts({ form }: any) {
  return (
    <>
      {/* First row: Tālrunis & E-pasts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tālrunis</FormLabel>
              <FormControl>
                <Input3 placeholder="371..." helperText="Tālruņa numurs saziņai." {...field} />
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
                <Input3 type="email" placeholder="you@example.com" helperText="E-pasta adrese saziņai ar cilvēkiem." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Second row: Mājas lapa & WhatsApp */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="mediaUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mājas lapa</FormLabel>
              <FormControl>
                <WebsiteInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="yourwebsite.com"
                  id="_r_12_-website"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">Saite uz mājas lapu.</p>
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
                <WebsiteInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="371..."
                  id="_r_12_-whatsapp"
                  prefix="https://wa.me/"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">Saite uz WhatsApp.</p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* LinkedIn & TikTok in the same row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Linkedin</FormLabel>
              <FormControl>
                <WebsiteInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="linkedin.com/in/lietotajvards"
                  id="_r_12_-linkedin"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">Saite uz Linkedin.</p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tiktok"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TikTok</FormLabel>
              <FormControl>
                <WebsiteInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="tiktok.com/@lietotajvards"
                  id="_r_12_-tiktok"
                  prefix="https://"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">Saite uz TikTok.</p>
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
                <WebsiteInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="instagram.com/lietotajvards"
                  id="_r_12_-instagram"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">Saite uz Instagram.</p>
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
                <WebsiteInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="facebook.com/lapa-vai-profils"
                  id="_r_12_-facebook"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">Saite uz Facebook.</p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="pinterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pinterest</FormLabel>
              <FormControl>
                <WebsiteInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="pinterest.com/lietotajvards"
                  id="_r_12_-pinterest"
                  prefix="https://"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">Saite uz Pinterest.</p>
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
                <WebsiteInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="tavs_profils"
                  id="_r_12_-telegram"
                  prefix="https://t.me/"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">Saite uz Telegram.</p>
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
                <WebsiteInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="threads.net/lietotajvards"
                  id="_r_12_-threads"
                  prefix="https://"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">Saite uz Threads.</p>
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
                <WebsiteInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="youtube.com/@lietotajvards"
                  id="_r_12_-youtube"
                  prefix="https://"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">Saite uz YouTube.</p>
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
                <WebsiteInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="linktr.ee/lietotajvards"
                  id="_r_12_-linktree"
                  prefix="https://"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">Saite uz Linktree.</p>
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
                <WebsiteInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="etsy.com/shop/lietotajvards"
                  id="_r_12_-etsy"
                  prefix="https://"
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">Saite uz Etsy.</p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
