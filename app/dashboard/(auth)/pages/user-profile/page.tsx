"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Share2, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedUnderline } from "@/components/ui/tabs-animated";

// Komponentes
import { ProfileHeader } from "./components/profile-header";
import { ProfileSidebar } from "./components/profile-sidebar";
import { ActivityStream } from "./components/activity-stream";
import { ConnectionsTeams } from "./components/connections-teams";
import { ProjectsTable } from "./components/projects-table";

export default function Page() {
  const [activeTab, setActiveTab] = useState("profile");
  const [underlinePosition, setUnderlinePosition] = useState({ left: 0, width: 0 });
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const tabsListRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Tabu un līnijas loģika
  useEffect(() => {
    const updateUnderlineAndScroll = () => {
      if (!tabsListRef.current) return;
      const activeTrigger = tabsListRef.current.querySelector(
        '[data-state="active"]'
      ) as HTMLElement | null;
      if (!activeTrigger) return;

      setUnderlinePosition({
        left: activeTrigger.offsetLeft,
        width: activeTrigger.offsetWidth,
      });

      if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        const scrollTo =
          activeTrigger.offsetLeft - el.clientWidth / 2 + activeTrigger.offsetWidth / 2;
        el.scrollTo({ left: Math.max(0, scrollTo), behavior: "smooth" });
      }
    };

    updateUnderlineAndScroll();
    window.addEventListener("resize", updateUnderlineAndScroll);
    return () => window.removeEventListener("resize", updateUnderlineAndScroll);
  }, [activeTab]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowLeftShadow(el.scrollLeft > 0);
    setShowRightShadow(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, []);

  return (
    <div className="min-h-full w-full space-y-4 lg:pl-2.5">
      
      {/* --- VIRSRAKSTS UN APAKŠVIRSRAKSTS --- */}
      <div className="mb-4 flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground text-sm">
          Manage detailed user profiles, activity streams, and projects.
        </p>
      </div>

      <div className="flex w-full flex-col gap-4">
        {/* Galvenā kārts */}
        <div className="bg-card w-full overflow-hidden rounded-md border shadow-sm">
          <ProfileHeader />

          {/* Identisks horizontālais menu */}
          <div className="border-t">
            <div className="flex items-center justify-between px-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 min-w-0"
              >
                <div className="relative">
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-card to-transparent transition-opacity duration-200"
                    style={{ opacity: showLeftShadow ? 1 : 0 }}
                  />
                  <div
                    className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-card to-transparent transition-opacity duration-200"
                    style={{ opacity: showRightShadow ? 1 : 0 }}
                  />
                  
                  <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="scrollbar-hide overflow-x-auto overflow-y-hidden"
                  >
                    <div ref={tabsListRef} className="relative w-max">
                      <TabsList className="h-auto! gap-8 border-none bg-transparent p-0">
                        <TabsTrigger
                          value="profile"
                          className="data-[state=active]:text-foreground text-muted-foreground relative h-14 rounded-none border-0 bg-transparent! px-0 py-4 text-sm font-medium shadow-none! transition-none"
                        >
                          Profile
                        </TabsTrigger>
                        <TabsTrigger
                          value="teams"
                          className="data-[state=active]:text-foreground text-muted-foreground relative h-14 rounded-none border-0 bg-transparent! px-0 py-4 text-sm font-medium shadow-none! transition-none"
                        >
                          Teams
                        </TabsTrigger>
                        <TabsTrigger
                          value="projects"
                          className="data-[state=active]:text-foreground text-muted-foreground relative h-14 rounded-none border-0 bg-transparent! px-0 py-4 text-sm font-medium shadow-none! transition-none flex items-center gap-2"
                        >
                          Projects
                          <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[10px] font-bold">
                            3
                          </Badge>
                        </TabsTrigger>
                      </TabsList>

                      <AnimatedUnderline
                        orientation="horizontal"
                        className="bg-primary absolute bottom-0"
                        style={{
                          left: underlinePosition.left,
                          width: underlinePosition.width,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Tabs>

              {/* Labās puses pogas */}
              <div className="flex items-center gap-2 ml-4">
                <Button size="sm" className="h-8">
                  <UserPlus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Connect</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon-sm" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" /> Edit profile</DropdownMenuItem>
                    <DropdownMenuItem><Share2 className="h-4 w-4 mr-2" /> Share</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Saturs zemāk */}
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
          <aside className="w-full">
            <ProfileSidebar />
          </aside>
          <main className="min-w-0 w-full space-y-4">
            <ActivityStream />
            <ConnectionsTeams />
            <ProjectsTable />
          </main>
        </div>
      </div>
    </div>
  );
}