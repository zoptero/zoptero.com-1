import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import React from "react";

export default function TabPayments({ form }: any) {
  return (
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
  );
}
