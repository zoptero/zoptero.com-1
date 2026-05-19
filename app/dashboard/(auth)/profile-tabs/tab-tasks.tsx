import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

export default function TabTasks({ form }: any) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="requestTask"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Uzdevumi</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Apraksti savu uzdevumu vai darba pieprasījumu..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Norādi uzdevumu vai pakalpojumu, kuru vēlies pieprasīt. Šī informācija būs redzama citiem lietotājiem.
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}