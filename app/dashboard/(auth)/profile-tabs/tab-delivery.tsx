import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

export default function TabDelivery({ form }: any) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="deliveryInfo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Piegādes informācija</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Norādi piegādes noteikumus, termiņus, cenas un citus nosacījumus..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Pievieno informāciju par piegādi, kas būs redzama klientiem.
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}