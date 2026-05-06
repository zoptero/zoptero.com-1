"use client";

import ThemeSwitch from "@/components/layout/header/theme-switch";
import { HeroTitleRotator } from "@/components/hero-title-rotator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
// import { Tooltip8 } from "@/components/ui/tooltip8";
// import Footer1 from "@/components/footer1";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NavigationMenu } from "@/components/ui/navigation-menu";

export default function HeroSection() {
  return (
    <section className="flex min-h-screen min-h-[100svh] min-h-[100dvh] flex-col bg-[radial-gradient(125%_125%_at_50%_90%,#ffffff_40%,var(--color-purple-200)_100%)] bg-cover bg-center px-4 text-center text-sm dark:bg-[radial-gradient(125%_125%_at_50%_90%,var(--color-background)_40%,var(--color-purple-800)_100%)] md:px-8 lg:px-12 xl:px-16 max-[1024px]:overflow-hidden">
      <nav className="flex w-full flex-none items-center justify-between py-2.5 md:px-8 md:py-3 lg:px-12 xl:px-16">
        {/* Logo removed as requested */}

        <NavigationMenu
          viewport={false}
          className="hidden max-w-none flex-1 justify-center md:flex"
        >
          {/* Navigation links removed as requested */}
        </NavigationMenu>

        <div className="flex items-center gap-2 w-full justify-end md:w-auto md:justify-start">
          <ThemeSwitch />
          <Button variant="outline" className="rounded-full" size="sm" asChild>
            <Link href="/sign-in">Ienākt</Link>
          </Button>
        </div>
      </nav>

      <div className="flex w-full flex-1 items-center justify-center py-3 md:py-4 lg:py-6">
        <div className="flex w-full max-w-xl flex-col items-center justify-center gap-3 md:gap-4 lg:gap-5">
        <Badge className="mb-1.5 gap-1 md:mb-2" variant="outline">
          <svg aria-hidden="true" className="text-emerald-600" width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.00016 11.1998L2.80016 7.99984L1.86683 8.93317L6.00016 13.0665L15.0002 4.0665L14.0668 3.13317L6.00016 11.1998Z" fill="currentColor"/></svg>
          Informācijas platforma
        </Badge>
        <header className="space-y-2.5 md:space-y-3">
          <HeroTitleRotator />
          <p className="text-muted-foreground text-sm max-md:text-xs">
            Šeit var atrast uzticamu informāciju ar MI.
          </p>
        </header>
        <div className="bg-muted mt-2.5 w-full space-y-3 overflow-hidden rounded-xl focus-within:ring-2 focus-within:ring-white/40 md:mt-3 md:space-y-4">
          <Textarea
            placeholder="Kas nepieciešams atrast?"
            rows={3}
            className="min-h-14 resize-none border-0 bg-transparent! px-4 pt-3 pb-0 shadow-none focus-visible:ring-0 text-sm placeholder:text-sm max-md:min-h-12 max-md:px-3.5 max-md:pt-2.5 max-md:text-xs max-md:placeholder:text-xs md:min-h-16 md:p-4 md:pb-0"
          />
          <div className="flex items-center justify-between px-3 pb-2.5 md:pb-3">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Add"
              className="rounded-full"
            >
              <Plus />
            </Button>
            <Button size="icon-sm" aria-label="Send" className="rounded-full">
              <ArrowRight />
            </Button>
          </div>
        </div>
        </div>
      </div>

      <footer
        className="flex w-full flex-none flex-col items-center justify-center pt-2 pb-2 text-center text-xs text-muted-foreground md:pt-2 md:pb-4"
      >
        <div className="flex w-full flex-col items-center justify-center gap-1.5 text-center md:gap-2">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>&copy; {new Date().getFullYear()} Zoptero</span>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:text-primary no-underline">Par mums</Link>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:text-primary no-underline">Kontakti</Link>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:text-primary no-underline">Privātuma politika</Link>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:text-primary no-underline">Sīkdatņu politika</Link>
          </div>
        </div>
      </footer>
    </section>
  );
}
