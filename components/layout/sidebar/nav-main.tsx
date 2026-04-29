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
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  items?: NavItem;
}[];

export const navItems: NavGroup[] = [
  {
    title: "Dashboards",
    items: [
      {
        title: "Classic Dashboard",
        href: "/dashboard",
        icon: ChartPieIcon
      },
      // E-commerce removed
      // Payment Dashboard removed
      {
        title: "Project Management",
        href: "/dashboard/project-management",
        icon: FolderDotIcon,
        items: [
          { title: "Dashboard", href: "/dashboard/project-management" },
          { title: "Project List", href: "/dashboard/project-list" }
        ]
      },
      // Real Estate removed
      // Sales removed
      // CRM removed
      {
        title: "Statistika",
        href: "/dashboard/website-analytics",
        icon: GaugeIcon
      },
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
      {
        title: "Chats",
        icon: MessageSquareIcon,
        lock: true // Custom property to indicate lock icon usage
      },
      {
        title: "Social Media",
        href: "/dashboard/apps/social-media",
        icon: MessageSquareHeartIcon,
        isNew: true
      },
      { title: "Mail", href: "/dashboard/apps/mail", icon: MailIcon },
      {
        title: "Todo List App",
        href: "/dashboard/apps/todo-list-app",
        icon: SquareCheckIcon
      },
      { title: "Calendar", href: "/dashboard/apps/calendar", icon: CalendarIcon },
      { title: "POS App", href: "/dashboard/apps/pos-system", icon: CookieIcon },
      { title: "Courses", href: "/dashboard/apps/courses", icon: BookAIcon, isNew: true }
    ]
  },
  {
    title: "AI Apps",
    items: [
      {
        title: "Image Generator",
        href: "/dashboard/apps/ai-image-generator",
        icon: ImagesIcon
      },
      {
        title: "Text to Speech",
        href: "/dashboard/apps/text-to-speech",
        icon: SpeechIcon,
        isComing: true
      }
    ]
  },
  {
    title: "Pages",
    items: [
      {
        title: "Users List",
        href: "/dashboard/pages/users",
        icon: UsersIcon
      },
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
                    <SidebarMenuButton className="opacity-60 cursor-not-allowed" tooltip="Locked" asChild>
                      <div className="flex items-center gap-2">
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <LockIcon className="ml-2 text-gray-400 w-4 h-4" />
                      </div>
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
                                  asChild>
                                  <Link href={subItem.href} target={subItem.newTab ? "_blank" : ""}>
                                    <span>{subItem.title}</span>
                                  </Link>
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
                      asChild>
                      <Link href={item.href} target={item.newTab ? "_blank" : ""}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
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
