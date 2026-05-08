// Photo tab content component
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input3 } from "@/components/input3";
import React from "react";

export default function TabPhoto({ form }: any) {
  return (
    <FormField
      control={form.control}
      name="profileVideoUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Video</FormLabel>
          <FormControl>
            <Input3 placeholder="https://..." helperText="Norādi saiti uz video resursu." {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
