import { generateMeta } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import CalendarDateRangePicker from "@/components/custom-date-range-picker";

import {
  AverageDailySalesCard,
  WebsiteAnalyticsCard,
  SaleOverviewCard,
  EarningReportsCard,
  TicketsCard,
  SalesByCountriesCard,
  TotalEarningCard,
  MonthlyCampaignStateCard
} from "@/app/dashboard/(auth)/website-analytics/components";
import StatCards from "@/app/dashboard/(auth)/website-analytics/components/stat-cards";

export async function generateMetadata() {
  return generateMeta({
    title: "Website Analytics Admin Dashboard",
    description:
      "Analyze website analytics, earnings, and user data with real-time reports. A professional admin page built with React, TypeScript, Tailwind CSS.",
    canonical: "/website-analytics"
  });
}

export default function Page() {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex flex-row items-center justify-between space-y-2 lg:pl-2.5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Statistika</h1>
          <p className="text-muted-foreground text-sm">Profila apmeklējumu un aktivitāšu pārskats</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="grow">
            <CalendarDateRangePicker />
          </div>
          <Button>Download</Button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <StatCards />
        </div>
        <div className="lg:col-span-12 xl:col-span-8">
          <EarningReportsCard />
        </div>
        <div className="lg:col-span-12 xl:col-span-4">
          <TicketsCard />
        </div>
        <div className="lg:col-span-4">
          <WebsiteAnalyticsCard />
        </div>
        <div className="lg:col-span-4">
          <AverageDailySalesCard />
        </div>
        <div className="lg:col-span-4">
          <SaleOverviewCard />
        </div>
        <div className="lg:col-span-4">
          <SalesByCountriesCard />
        </div>
        <div className="lg:col-span-4">
          <TotalEarningCard />
        </div>
        <div className="lg:col-span-4">
          <MonthlyCampaignStateCard />
        </div>
      </div>
    </div>
  );
}
