import { Metadata } from "next";
import { generateMeta } from "@/lib/utils";

import { SidebarNav } from "./components/sidebar-nav";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Settings Page",
    additionalTitle: true,
    description:
      "Manage account settings and preferences. A professional page built with React, TypeScript, Tailwind CSS, react-hook-form, and Zod.",
    canonical: "/pages/settings"
  });
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1">{children}</div>
  );
}
