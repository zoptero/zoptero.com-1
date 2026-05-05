"use client";

import { UserButton } from "@clerk/nextjs";
import {
  SidebarMenu,
  SidebarMenuItem
} from "@/components/ui/sidebar";

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="px-2">
        <div 
          className="flex items-center w-full"
          // Mēs izmantojam "onPointerDownOutside" novēršanu (netieši)
          // Pārliecināmies, ka klikšķis netiek nodots Sheet
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-lg",
                // Z-index palīdz, bet galvenais ir portāla atrašanās vieta
                userButtonPopover: "z-[9999] pointer-events-auto",
              }
            }}
          />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
