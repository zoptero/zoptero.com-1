"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { LogOutIcon, UserCircle2Icon } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user } = useUser();
  
  // Use actual Clerk user data or fallback to default
  const displayName = user?.fullName || "User";
  const userEmail = user?.emailAddresses[0]?.emailAddress || "user@example.com";
  const userAvatar = user?.imageUrl || "/images/avatars/01.png";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{displayName}</span>
            <span className="text-muted-foreground truncate text-xs">{userEmail}</span>
          </div>
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={userAvatar} alt={displayName} />
            <AvatarFallback className="rounded-lg">U</AvatarFallback>
          </Avatar>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
