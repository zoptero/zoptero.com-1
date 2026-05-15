import type { Metadata } from "next";
import HeroSection from "@/components/hero4";

export const metadata: Metadata = {
  title: "Zoptero",
  description: "Moderna informācijas platforma ar MI",
  openGraph: {
    title: "Zoptero",
    description: "Moderna informācijas platforma ar MI",
    url: "https://zoptero.com",
    siteName: "Zoptero",
    images: [
      {
        url: "https://media.zoptero.com/img/zoptero-logo-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Zoptero — Moderna informācijas platforma ar MI",
      },
    ],
    locale: "lv_LV",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zoptero",
    description: "Moderna informācijas platforma ar MI",
    images: ["https://media.zoptero.com/img/zoptero-logo-1200x630.png"],
  },
};

export default function HomePage() {
  return <HeroSection />;
}