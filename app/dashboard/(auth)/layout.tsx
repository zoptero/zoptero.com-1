import React from "react";
import { cookies } from "next/headers";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { GlobalFooter } from "@/components/layout/global-footer";
import { SiteHeader } from "@/components/layout/header";

export default async function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen =
    cookieStore.get("sidebar_state")?.value === "true" ||
    cookieStore.get("sidebar_state") === undefined;

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={{
        "--sidebar-width": "calc(var(--spacing) * 64)",
        "--header-height": "calc(var(--spacing) * 14)",
        "--content-padding": "calc(var(--spacing) * 4)",
        "--content-margin": "calc(var(--spacing) * 1.5)",
        "--content-full-height":
          "calc(100vh - var(--header-height) - (var(--content-padding) * 2) - (var(--content-margin) * 2))"
      } as React.CSSProperties}
    >
      <div className="flex flex-row min-h-screen w-full bg-neutral-100">
        <AppSidebar variant="inset" />
        <SidebarInset className="flex-1 flex flex-col min-h-screen bg-white">
          <SiteHeader />
          <div className="flex flex-1 flex-col min-h-screen">
            <div className="@container/main flex flex-1 flex-col min-h-screen p-(--content-padding) pb-0 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
              <div className="flex-1 pb-(--content-padding)">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
