import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import React from "react";

export default function TabTasks({ form }: any) {
  const titleValue = form.watch("requestTaskTitle") ?? "";
  const titleLength = titleValue.length;
  const titleMax = 60;
  const descValue = form.watch("requestTask") ?? "";
  const descLength = descValue.length;
  const descMax = 500;

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="requestTaskTitle"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Virsraksts</FormLabel>
              <span className={`text-xs tabular-nums ${titleLength >= titleMax ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                {titleLength}/{titleMax}
              </span>
            </div>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder="Īss uzdevuma virsraksts..."
                  maxLength={titleMax}
                  {...field}
                />
              </div>
            </FormControl>
            <FormDescription className="text-xs">
              Uzraksti īsu uzdevuma virsrakstu, lai citi lietotāji ātri saprastu, ko meklē.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requestLocation"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Atrašanās vieta</FormLabel>
            </div>
            <FormControl>
              <Input
                placeholder="Pilsēta, novads vai cita atrašanās vieta..."
                maxLength={100}
                {...field}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Norādi, kur darbu vēlies veikt vai kur tas ir nepieciešams.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requestTask"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Apraksts</FormLabel>
              <span className={`text-xs tabular-nums ${descLength >= descMax ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                {descLength}/{descMax}
              </span>
            </div>
            <FormControl>
              <Textarea
                placeholder="Apraksti savu uzdevumu vai darba pieprasījumu sīkāk..."
                className="min-h-[120px]"
                maxLength={descMax}
                {...field}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Norādi uzdevumu vai pakalpojumu, kuru vēlies pieprasīt. Šī informācija būs redzama citiem lietotājiem.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}