"use client";

import * as React from "react";
import { useEffect } from "react";
import { ChevronsUpDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useIsTablet } from "@/hooks/use-mobile";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const isTablet = useIsTablet();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname]);

  useEffect(() => {
    setOpen(!isTablet);
  }, [isTablet]);

  return (
    <Sidebar collapsible="icon" {...props}>
       <SidebarHeader>
         <SidebarMenu>
           <SidebarMenuItem>
              <SidebarMenuButton asChild className="hover:text-foreground h-10 group-data-[collapsible=icon]:px-0!">
                <Link href="/dashboard">
                  <img src="https://media.zoptero.com/img/zoptero-logo-32x32.svg" alt="Zoptero Logo" width={32} height={32} className="mr-2" />
                  <span className="text-foreground font-semibold">Zaptero</span>
                  <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                </Link>
              </SidebarMenuButton>
           </SidebarMenuItem>
         </SidebarMenu>
       </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain />
        </ScrollArea>
      </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
    </Sidebar>
  );
}
