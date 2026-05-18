"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

const notificationsFormSchema = z.object({
  mobile: z.boolean().default(false).optional(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<NotificationsFormValues> = {
  mobile: false,
};

export default function Page() {
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues
  });

  function onSubmit(data: NotificationsFormValues) {
    toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      )
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-row items-center justify-between space-y-2 lg:pl-2.5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Paziņojumi</h1>
          <p className="text-muted-foreground text-sm">
            Pārvaldi savus paziņojumus.
          </p>
        </div>
      </div>
      <div className="lg:pl-2.5">
        <Card>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Mobilie paziņojumi</FormLabel>
                          <FormDescription>
                            Saņem paziņojumus mobilajā ierīcē.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit">Atjaunināt paziņojumus</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}