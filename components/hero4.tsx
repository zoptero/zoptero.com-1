"use client";

import { HeroUserMenu } from "@/components/HeroUserMenu";
import { GlobalFooter } from "@/components/layout/global-footer";
import { HeroTitleRotator } from "@/components/hero-title-rotator";
import { Badge } from "@/components/ui/badge";
import { Locate, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FadeInSlide from "@/components/FadeInSlide";
import RequestsFeed from "@/components/requests-feed";

export default function HeroSection() {
  return (
    <section className="flex min-h-screen flex-col bg-background text-center text-sm max-[1024px]:overflow-hidden">
      
      {/* Navigācijas josla */}
      <nav className="relative flex w-full flex-none items-center justify-center min-h-[60px] md:min-h-[6vw]">
        {/* User menu konteiners ar precīzām atkāpēm */}
        <div className="absolute top-5 right-5 md:top-[1vw] md:right-[2vw]">
          <HeroUserMenu />
        </div>
      </nav>

      {/* Galvenais saturs */}
      <div className="flex w-full flex-1 items-center justify-center py-6">
        <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-4 md:gap-6">
          
          <FadeInSlide delay={0} className="flex w-full justify-center">
            <Badge className="gap-1" variant="outline">
              <svg aria-hidden="true" className="text-emerald-600" width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M6.00016 11.1998L2.80016 7.99984L1.86683 8.93317L6.00016 13.0665L15.0002 4.0665L14.0668 3.13317L6.00016 11.1998Z" fill="currentColor"/>
              </svg>
              Informācijas platforma
            </Badge>
          </FadeInSlide>

          <FadeInSlide delay={0.1} className="w-full px-4">
            <header className="space-y-3">
              <HeroTitleRotator />
              <p className="text-muted-foreground text-[12px] md:text-sm">
                Meklē uzticamu informāciju ar MI.
              </p>
            </header>
          </FadeInSlide>

          {/* Meklētājs */}
          <FadeInSlide delay={0.2} className="w-full">
            <div className="w-full px-4 flex justify-center">
              <div className="bg-muted w-full max-w-2xl mx-auto space-y-3 overflow-hidden rounded-xl 
                              border border-input transition-colors duration-200
                              focus-within:border-muted-foreground/40 focus-within:ring-0">
                <Textarea
                  placeholder="Kas nepieciešams atrast?"
                  rows={3}
                  className="min-h-24 resize-none border-0 bg-transparent px-4 pt-4 pb-0 shadow-none focus-visible:ring-0 text-sm"
                />
                <div className="flex items-center justify-between px-3 pb-3">
                  <Button variant="outline" size="icon-sm" className="rounded-full h-8 w-8">
                    <Locate className="h-4 w-4" />
                  </Button>
                  <Button size="icon-sm" className="rounded-full h-8 w-8">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </FadeInSlide>

          {/* Jaunākie pieprasījumi */}
          <RequestsFeed />

        </div>
      </div>

      <GlobalFooter />
    </section>
  );
}