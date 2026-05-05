"use client"

import { useState, useEffect, useRef } from "react";
import { generateMeta } from "@/lib/utils";

import CalendarDateRangePicker from "@/components/custom-date-range-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FolderUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedUnderline } from "@/components/ui/tabs-animated";

import {
  SummaryCards,
  AchievementByYear,
  ChartProjectOverview,
  ChartProjectEfficiency,
  TableRecentProjects,
  Reminders,
  SuccessMetrics,
  Reports
} from "./components";

export async function generateMetadata() {
  return generateMeta({
    title: "Dashboard",
    description:
      "Track tasks, deadlines, and team efficiency with interactive charts. A professional dashboard page built with React, TypeScript, Tailwind CSS, and shadcn/ui.",
    canonical: "/dashboard"
  });
}

export default function Page() {
  const [activeTab, setActiveTab] = useState("overview");
  const [underlinePosition, setUnderlinePosition] = useState({ left: 0, width: 0 });
  const tabsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateUnderlinePosition = () => {
      if (tabsListRef.current) {
        const activeTrigger = tabsListRef.current.querySelector(
          `[data-state="active"]`
        ) as HTMLElement;
        if (activeTrigger) {
          setUnderlinePosition({
            left: activeTrigger.offsetLeft,
            width: activeTrigger.offsetWidth,
          });
        }
      }
    };

    updateUnderlinePosition();
    window.addEventListener("resize", updateUnderlinePosition);
    return () => window.removeEventListener("resize", updateUnderlinePosition);
  }, [activeTab]);

  return (
    <>
      <div className="mb-4 flex flex-row items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Project Dashboard</h1>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FolderUp /> <span className="hidden lg:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Excel</DropdownMenuItem>
              <DropdownMenuItem>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div ref={tabsListRef} className="relative">
          <TabsList className="z-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="activities" disabled>
              Activities
            </TabsTrigger>
          </TabsList>
          <AnimatedUnderline
            orientation="horizontal"
            style={{
              left: underlinePosition.left,
              width: underlinePosition.width,
            }}
          />
        </div>
        <TabsContent value="overview" className="space-y-4">
          <SummaryCards />
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartProjectOverview />
            </div>
            <SuccessMetrics />
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2 2xl:grid-cols-4">
            <Reminders />
            <AchievementByYear />
            <ChartProjectEfficiency />
          </div>
          <TableRecentProjects />
        </TabsContent>
        <TabsContent value="reports">
          <Reports />
        </TabsContent>
        <TabsContent value="activities">...</TabsContent>
      </Tabs>
    </>
  );
}