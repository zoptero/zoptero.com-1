"use client";

import { HeroUserMenu } from "@/components/HeroUserMenu";
import { GlobalFooter } from "@/components/layout/global-footer";
import { HeroTitleRotator } from "@/components/hero-title-rotator";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import FadeInSlide from "@/components/FadeInSlide";

export default function HeroSection() {
  return (
    <section className="flex min-h-screen flex-col bg-background text-center text-sm max-[1024px]:overflow-hidden">
      {/* Navigācija ar Login pogu augšējā labajā stūrī */}
      <nav className="relative flex w-full flex-none items-center justify-center" style={{ minHeight: '6vw' }}>
        <div
          style={{
            position: 'absolute',
            top: '1vw',      // Šeit bija 2vw, tagad ir 1vw (samazināts 2x)
            right: '2vw',    // Labo pusi atstājam 2vw, ja gribi saglabāt iepriekšējo attālumu no malas
            aspectRatio: '1 / 1',
          }}
        >
          <HeroUserMenu />
        </div>
      </nav>

      {/* Galvenā satura daļa */}
      <div className="flex w-full flex-1 items-center justify-center py-6 md:py-8 lg:py-12">
        <div className="flex w-full max-w-3xl flex-col items-center justify-center gap-4 md:gap-6">
          
          {/* Badge */}
          <FadeInSlide delay={0} className="flex w-full justify-center">
            <Badge className="gap-1" variant="outline">
              <svg aria-hidden="true" className="text-emerald-600" width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.00016 11.1998L2.80016 7.99984L1.86683 8.93317L6.00016 13.0665L15.0002 4.0665L14.0668 3.13317L6.00016 11.1998Z" fill="currentColor"/>
              </svg>
              Informācijas platforma
            </Badge>
          </FadeInSlide>

          {/* Virsraksts un apraksts */}
          <FadeInSlide delay={0.1} className="w-full">
            <header className="space-y-3 text-center px-4">
              <HeroTitleRotator />
              <p className="text-muted-foreground text-[12px] md:text-sm">
                Meklē uzticamu informāciju ar MI.
              </p>
            </header>
          </FadeInSlide>

          {/* Meklēšanas logs (Chat Box) */}
          <FadeInSlide delay={0.2} className="w-full">
            {/* Ārējais konteiners ar px-4 nodrošina, ka mobilajā skatālogs nepielīp malām */}
            <div className="w-full px-4 flex justify-center">
              <div className="bg-muted/50 mt-2 w-full max-w-2xl mx-auto space-y-3 overflow-hidden rounded-xl 
                              border border-input transition-all duration-200 
                              focus-within:border-muted-foreground/40 focus-within:ring-0 md:space-y-4">
                
                <Textarea
                  placeholder="Kas nepieciešams atrast?"
                  rows={1}
                  className="min-h-0 h-10 resize-none border-0 bg-transparent px-4 pt-2 pb-0 
                             shadow-none focus-visible:ring-0 text-sm 
                             placeholder:text-muted-foreground/60 max-md:min-h-0"
                />
                
                <div className="flex items-center justify-between px-3 pb-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Add"
                    className="rounded-full hover:bg-background/50 h-8 w-8"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    size="icon" 
                    aria-label="Send" 
                    className="rounded-full shadow-sm transition-transform hover:scale-105 h-8 w-8"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </FadeInSlide>

        </div>
      </div>

      <GlobalFooter />
    </section>
  );
}