"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  ActivityIcon,
  ArchiveRestoreIcon,
  BadgeDollarSignIcon,
  BrainCircuitIcon,
  BrainIcon,
  Building2Icon,
  CalendarIcon,
  ChartBarDecreasingIcon,
  ChartPieIcon,
  ChevronRight,
  ClipboardCheckIcon,
  ClipboardMinusIcon,
  ComponentIcon,
  CookieIcon,
  FingerprintIcon,
  FolderDotIcon,
  FolderIcon,
  GaugeIcon,
  GraduationCapIcon,
  ImagesIcon,
  KeyIcon,
  MailIcon,
  MessageSquareIcon,
  ProportionsIcon,
  SettingsIcon,
  ShoppingBagIcon,
  SquareCheckIcon,
  SquareKanbanIcon,
  StickyNoteIcon,
  UserIcon,
  UsersIcon,
  WalletMinimalIcon,
  type LucideIcon,
  GithubIcon,
  RedoDotIcon,
  BrushCleaningIcon,
  CreditCardIcon,
  SpeechIcon,
  MessageSquareHeartIcon,
  BookAIcon,
  PuzzleIcon,
  BellIcon,
  LockIcon
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type NavGroup = {
  title: string;
  items: NavItem;
};

type NavItem = {
  title: string;
  href?: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  items?: NavItem;
  lock?: boolean;
}[];

export const navItems: NavGroup[] = [
  {
    title: "Vadības panelis",
    items: [
      {
        title: "Iestatījumi",
        href: "/dashboard/pages/settings",
        icon: SettingsIcon,
        items: [
          { title: "Profils", href: "/dashboard" },
          { title: "Publiskais profils", href: "/dashboard/pages/user-profile" },
          { title: "Paziņojumi", href: "/dashboard/pages/settings/notifications" },
          { title: "Abonements", href: "/dashboard/pages/pricing/column", icon: BadgeDollarSignIcon, isComing: true },
          { title: "Statistika", icon: GaugeIcon, lock: true }
        ]
      },
      {
        title: "Instrumenti",
        icon: ClipboardCheckIcon,
        items: [
          {
            title: "Rēķini",
            icon: ClipboardMinusIcon,
            lock: true,
            items: [
              { title: "POS App", href: "/dashboard/apps/pos-system", icon: CookieIcon }
            ]
          },
          {
            title: "Rezervācija",
            icon: CalendarIcon,
            lock: true
          },
          { title: "POS App", href: "/dashboard/apps/pos-system", icon: CookieIcon },
          {
            title: "Chat",
            icon: MessageSquareIcon,
            lock: true
          },
          {
            title: "Social",
            href: "/dashboard/apps/social-media",
            icon: MessageSquareHeartIcon,
            lock: true
          },
          { title: "Mail", href: "/dashboard/apps/mail", icon: MailIcon, lock: true },
          { title: "Calendar", href: "/dashboard/apps/calendar", icon: CalendarIcon, lock: true },
          { title: "Kursi", href: "/dashboard/apps/courses", icon: BookAIcon, lock: true },
          {
            title: "Attēlu veidotājs",
            href: "/dashboard/apps/ai-image-generator",
            icon: ImagesIcon,
            lock: true
          }
        ]
      }
    ]
  },
];

export function NavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  return (
    <>
      {navItems.map((nav) => (
        <SidebarGroup key={nav.title}>
          <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {nav.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {/* If lock property is set, show lock icon (with or without submenu) */}
                  {item.lock && (!Array.isArray(item.items) || item.items.length === 0) ? (
                    <SidebarMenuButton
                      className="opacity-60 cursor-not-allowed hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                      tooltip="Locked"
                    >
                      {item.icon && <item.icon />}
                      <span className="truncate">{item.title}</span>
                      <LockIcon className="ml-auto w-4 h-4 text-muted-foreground" />
                    </SidebarMenuButton>
                  ) : Array.isArray(item.items) && item.items.length > 0 ? (
                    <>
                      <div className="hidden group-data-[collapsible=icon]:block">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton tooltip={item.title}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side={isMobile ? "bottom" : "right"}
                            align={isMobile ? "end" : "start"}
                            className="min-w-48 rounded-lg">
                            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                            {item.items?.map((item) => (
                              <DropdownMenuItem
                                className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                                asChild
                                key={item.title}>
                                <a href={item.href}>{item.title}</a>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Collapsible
                        className="group/collapsible block group-data-[collapsible=icon]:hidden"
                        defaultOpen={!!item.items.find((s) => s.href === pathname)}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                            tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item?.items?.map((subItem, key) => (
                                <SidebarMenuSubItem key={key}>
                                  {subItem.lock ? (
                                    <SidebarMenuSubButton
                                      className="opacity-60 cursor-not-allowed hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                      isActive={pathname === subItem.href}
                                    >
                                      <span>{subItem.title}</span>
                                      <LockIcon className="ml-auto w-3 h-3 text-muted-foreground" />
                                    </SidebarMenuSubButton>
                                  ) : (
                                    <SidebarMenuSubButton
                                      className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                      isActive={pathname === subItem.href}
                                      asChild={!!subItem.href}>
                                      {subItem.href ? (
                                        <Link href={subItem.href} target={subItem.newTab ? "_blank" : ""}>
                                          <span>{subItem.title}</span>
                                        </Link>
                                      ) : (
                                        <span>
                                          <span>{subItem.title}</span>
                                        </span>
                                      )}
                                    </SidebarMenuSubButton>
                                  )}
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                      </Collapsible>
                    </>
                  ) : (
                    <SidebarMenuButton
                      className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      asChild={!!item.href}>
                      {item.href ? (
                        <Link href={item.href} target={item.newTab ? "_blank" : ""}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      ) : (
                        <span>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </span>
                      )}
                    </SidebarMenuButton>
                  )}
                  {!!item.isComing && (
                    <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
                      Coming
                    </SidebarMenuBadge>
                  )}
                  {!!item.isNew && (
                    <SidebarMenuBadge className="border border-green-400 text-green-600 peer-hover/menu-button:text-green-600">
                      New
                    </SidebarMenuBadge>
                  )}
                  {!!item.isDataBadge && (
                    <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
                      {item.isDataBadge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}