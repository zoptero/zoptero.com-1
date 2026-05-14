import { generateMeta } from "@/lib/utils";

import DashboardPageClient from "./page-client";

export async function generateMetadata() {
  return generateMeta({
    title: "Zoptero - vadības panelis",
    description:
      "Track tasks, deadlines, and team efficiency with interactive charts. A professional dashboard page built with React, TypeScript, Tailwind CSS, and shadcn/ui.",
    canonical: "/dashboard",
  });
}

export default function Page() {
  return <DashboardPageClient />;
}
