"use client";

import { UserButton } from "@clerk/nextjs";
import {
  SidebarMenu,
  SidebarMenuItem
} from "@/components/ui/sidebar";

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem 
        className="px-2"
        onClick={(e) => e.stopPropagation()} // Stop bubbling here
      >
        <div className="flex items-center w-full">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-lg",
                userButtonTrigger: "flex items-center gap-2 w-full",
                // Force high z-index to overlay on top of mobile sheet
                userButtonPopover: "z-[9999] min-w-56",
              }
            }}
          />
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
