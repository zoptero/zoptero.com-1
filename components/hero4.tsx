"use client";

import ThemeSwitch from "@/components/layout/header/theme-switch";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AlignJustify, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Image from "next/image";



const SUGGESTIONS = [
  "SaaS finance dashboard layout.",
  "Marketing site for an AI startup.",
  "Mobile UI for a fitness app.",
  "Dark mode landing for an agency.",
];

export default function HeroSection() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-between bg-[radial-gradient(125%_125%_at_50%_90%,#ffffff_40%,var(--color-purple-200)_100%)] bg-cover bg-center text-center text-sm max-md:px-4 dark:bg-[radial-gradient(125%_125%_at_50%_90%,var(--color-background)_40%,var(--color-purple-800)_100%)]">
      <nav className="flex w-full items-center justify-between py-4 md:px-16 lg:px-24 xl:px-32">
        {/* Logo removed as requested */}

        <NavigationMenu
          viewport={false}
          className="hidden max-w-none flex-1 justify-center md:flex"
        >
          {/* Navigation links removed as requested */}
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <Button variant="outline" className="rounded-full" size="lg" asChild>
            <Link href="/sign-in">Ienākt</Link>
          </Button>
        </div>
      </nav>

      <div className="flex w-full max-w-xl flex-1 flex-col items-center justify-center space-y-4">
        <Badge className="gap-1 mb-2" variant="outline">
          <svg aria-hidden="true" className="text-emerald-600" width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.00016 11.1998L2.80016 7.99984L1.86683 8.93317L6.00016 13.0665L15.0002 4.0665L14.0668 3.13317L6.00016 11.1998Z" fill="currentColor"/></svg>
          Informācijas platforma
        </Badge>
        <header className="space-y-3">
          <h1 className="text-3xl leading-tight font-bold lg:text-4xl">Expertu meklētājs.</h1>
          <p className="text-muted-foreground text-sm">
            Meklē uzticamu informāciju ar MI.
          </p>
        </header>
        <div className="bg-muted mt-4 w-full space-y-4 overflow-hidden rounded-xl focus-within:ring-2 focus-within:ring-white/40">
          <Textarea
            placeholder="Describe the interface you want to design"
            rows={3}
            className="min-h-16 resize-none border-0 bg-transparent! p-4 pb-0 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Add"
              className="rounded-full"
            >
              <Plus />
            </Button>
            <Button size="icon-sm" aria-label="Send" className="rounded-full">
              <Send />
            </Button>
          </div>
        </div>

      </div>

      <p className="text-muted-foreground pb-3 text-xs">
        By messaging us, you agree to our{" "}
        <Link href="#" className="hover:text-primary underline">
          Terms of Use
        </Link>{" "}
        and confirm you&apos;ve read our{" "}
        <Link href="#" className="hover:text-primary underline">
          Privacy Policy
        </Link>
        .
      </p>
    </section>
  );
}
