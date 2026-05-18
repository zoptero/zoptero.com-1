"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import FadeInSlide from "@/components/FadeInSlide";
import { Check, ArrowRight, UserCircle2, Building2 } from "lucide-react";

export default function PricingPage() {
  const { user } = useUser();
  const profile = useQuery(api.profiles.getMe);
  const [isYearly, setIsYearly] = useState(false);
  const accountType = profile?.accountType ?? "b2c";

  const pricingTiers = [
    {
      name: "Pamata",
      description: "Būtiskākās funkcijas individuālam darbam",
      monthlyPrice: 10,
      yearlyPrice: 100,
      features: ["1 lietotājs", "5GB krātuve", "E-pasta atbalsts", "Pamata integrācijas"]
    },
    {
      name: "Biznesa",
      description: "Universāls risinājums augošiem uzņēmumiem",
      monthlyPrice: 30,
      yearlyPrice: 300,
      features: [
        "Neierobežoti rēķini",
        "Swedbank API integrācija",
        "Automātiski atgādinājumi",
        "XML eksports",
        "Pielāgots logo"
      ]
    },
    {
      name: "Enterprise",
      description: "Pielāgota sistēma lielām komandām",
      monthlyPrice: 60,
      yearlyPrice: 600,
      features: [
        "Viss Biznesa plānā",
        "Vairāki uzņēmuma profili",
        "API piekļuve",
        "Personīgais menedžeris"
      ]
    }
  ];

  return (
    <div className="flex flex-col pb-10">
      {/* Virsraksts un Toggle */}
      <FadeInSlide delay={0}>
        <div className="mb-4 flex flex-row items-center justify-between lg:pl-2.5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Abonements</h1>
            <p className="text-muted-foreground text-sm">Izvēlies piemērotāko</p>
          </div>
          <div className="flex shrink-0 items-center space-x-2">
            <span className={`text-sm ${!isYearly ? "font-bold text-foreground" : "text-muted-foreground"}`}>Mēnesis</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm ${isYearly ? "font-bold text-foreground" : "text-muted-foreground"}`}>Gads</span>
          </div>
        </div>
      </FadeInSlide>

      {/* Cenu kartītes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:pl-2.5">
        {pricingTiers.map((tier, index) => {
          // Aprēķinām ietaupījumu procentos: (10*12 - 100) / 120 = 16.66% -> 17%
          const savingsPercent = Math.round(((tier.monthlyPrice * 12 - tier.yearlyPrice) / (tier.monthlyPrice * 12)) * 100);

          return (
            <FadeInSlide key={index} delay={0.1 + index * 0.1}>
            <Card className="relative flex flex-col transition-all duration-200">
              <CardHeader className="pb-0">
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription className="min-h-[32px] leading-tight text-xs">{tier.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="grow pt-1"> 
                {/* Cenu bloks: h-[45px] un justify-end novērš lēkāšanu un baiso atstarpi */}
                <div className="h-[45px] flex flex-col justify-end mb-4">
                  {isYearly ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 leading-none mb-1">
                      Ietaupi {savingsPercent}% gadā
                    </span>
                  ) : (
                    <div className="h-[14px]" /> 
                  )}
                  <div className="flex items-baseline gap-1">
                    <p className="font-display text-3xl font-bold leading-none">
                      €{isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                    </p>
                    <span className="text-xs font-normal text-muted-foreground">
                      /{isYearly ? "gadā" : "mēn"}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-2 border-t pt-4">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="mr-2 h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-xs text-muted-foreground leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button size="sm" className="w-full btn-cta" variant={index === 1 ? "default" : "outline"}>
                  Izvēlēties
                  <ArrowRight className="ms-2 h-4 w-4 inline" />
                </Button>
              </CardFooter>
            </Card>
            </FadeInSlide>
          );
        })}
      </div>

      {/* FAQ sadaļa */}
      <FadeInSlide delay={0.5}>
        <div className="mb-4 mt-8 flex flex-row items-center justify-between lg:pl-2.5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Biežāk uzdotie jautājumi</h2>
            <p className="text-muted-foreground text-sm">Atbildes uz biežāk uzdotajiem jautājumiem</p>
          </div>
        </div>
      </FadeInSlide>

      <FadeInSlide delay={0.6}>
        <div className="space-y-4 lg:pl-2.5">
          {/* Profila tips - maza info karte */}
          <div className="flex items-center justify-between rounded-lg border p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                {accountType === "b2b" ? (
                  <Building2 className="h-5 w-5 text-primary" />
                ) : (
                  <UserCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Mans profila tips</p>
                <p className="text-xs text-muted-foreground">
                  {accountType === "b2b" ? "B2B - Uzņēmuma profils" : "B2C - Personīgais profils"}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {accountType === "b2b" ? "B2B" : "B2C"}
            </span>
          </div>

        </div>
      </FadeInSlide>
    </div>
  );
}