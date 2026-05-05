"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut, User, Settings } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function NavUser() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk(); // Pievienojam openUserProfile

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <img src={user.imageUrl} className="h-8 w-8 rounded-lg" alt="Avatar" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="font-semibold truncate">{user.fullName}</span>
            <span className="text-xs truncate">{user.primaryEmailAddress?.emailAddress}</span>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="top">
        {/* Šī funkcija atver Clerk Native Modal */}
        <DropdownMenuItem onClick={() => openUserProfile()}>
          <Settings className="mr-2 h-4 w-4" />
          Manage Account
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
