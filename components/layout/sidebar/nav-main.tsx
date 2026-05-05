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
    title: "Dashboards",
    items: [
      // E-commerce removed
      // Payment Dashboard removed
      {
        title: "Profils",
        href: "/dashboard",
        icon: FolderDotIcon,
        items: [
          { title: "Dashboard", href: "/dashboard" },
          { title: "Project List", href: "/dashboard/project-list" }
        ]
      },
      // Real Estate removed
      // Sales removed
      // CRM removed
      // Crypto removed
      // Academy/School removed
      // Hospital Management removed
      // Finance Dashboard removed
    ]
  },
  {
    title: "Apps",
    items: [
      // Notes app removed
      { title: "POS App", href: "/dashboard/apps/pos-system", icon: CookieIcon },
      {
        title: "Chats",
        icon: MessageSquareIcon,
        lock: true // Custom property to indicate lock icon usage
      },
      {
        title: "Social",
        href: "/dashboard/apps/social-media",
        icon: MessageSquareHeartIcon,
        lock: true
      },
       { title: "Mail", href: "/dashboard/apps/mail", icon: MailIcon, lock: true },
       { title: "Calendar", href: "/dashboard/apps/calendar", icon: CalendarIcon, lock: true },
       { title: "Kursi", href: "/dashboard/apps/courses", icon: BookAIcon, lock: true }
    ]
  },
  {
    title: "AI Apps",
    items: [
      {
        title: "Attēlu veidotājs",
        href: "/dashboard/apps/ai-image-generator",
        icon: ImagesIcon,
        lock: true
      }
    ]
  },
  {
    title: "Pages",
    items: [
      {
        title: "Profile V2",
        href: "/dashboard/pages/user-profile",
        icon: UserIcon
      },
      // Empty States removed
      {
        title: "Settings",
        href: "/dashboard/pages/settings",
        icon: SettingsIcon,
        items: [
          { title: "Profile", href: "/dashboard/pages/settings" },
          { title: "Account", href: "/dashboard/pages/settings/account" },
          { title: "Billing", href: "/dashboard/pages/settings/billing" },
          { title: "Appearance", href: "/dashboard/pages/settings/appearance" },
          { title: "Notifications", href: "/dashboard/pages/settings/notifications" },
          { title: "Display", href: "/dashboard/pages/settings/display" },
          { title: "Pricing", href: "http://localhost:3000/dashboard/pages/pricing/column", icon: BadgeDollarSignIcon, isComing: true }
        ]
      },
      {
        title: "Statistika",
        href: "/dashboard/website-analytics",
        icon: GaugeIcon
      },
      // Authentication, Notifications Page, and Error Pages removed
    ]
  },
  // Others section removed
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
                  {/* If lock property is set, show lock icon instead of link or badge */}
                  {item.lock ? (
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
                                <SidebarMenuSubButton
                                  className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                  isActive={pathname === subItem.href}
                                  asChild={!!subItem.href}>
                                  {subItem.href ? (
                                    <Link href={subItem.href} target={subItem.newTab ? "_blank" : ""}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  ) : (
                                    <span>{subItem.title}</span>
                                  )}
                                </SidebarMenuSubButton>
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
