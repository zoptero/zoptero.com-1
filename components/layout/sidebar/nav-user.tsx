"use client";

import { UserButton } from "@clerk/nextjs";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";

export function NavUser() {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 rounded-lg",
              userButton: "flex items-center gap-2",
              userButtonTrigger: "flex items-center gap-2",
              userButtonPopover: "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
              userMenuActions: "flex flex-col gap-1",
              userMenuItem: "flex items-center gap-2 px-2 py-1.5 text-sm",
              userMenuItemIcon: "h-4 w-4",
              userButtonName: "text-sm font-medium",
              userButtonEmail: "text-xs text-muted-foreground",
              userButtonLabel: "text-sm font-medium",
              userButtonLabelWrapper: "flex items-center gap-2"
            }
          }}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
