"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Plus, ArrowUp, MoonIcon, SunIcon, CheckIcon } from "lucide-react";

// UI Components (Assuming standard Shadcn structure)
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";

// --- Sub-components ---

export function Badge6() {
    return (
        <Badge className="gap-1" variant="outline">
            <CheckIcon aria-hidden="true" className="text-emerald-600" size={12} />
            Informācijas platforma
        </Badge>
    );
}

export function ThemeSwitch() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-9 w-9" />;

    return (
        <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
            {theme === "light" ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}

// --- Main Hero Component ---

const NAV_LINKS: { label: string; href: string }[] = [];
const SUGGESTIONS = [
    "Vajag labu kāzu fotogrāfu Valmierā",
    "Meklēju labu mājas lapu izstrādātāju",
    "Meklēju gudru grāmatvedi",
    "Kas šī ir par platformu",
];

export function HeroSection() {
    return (
        <section className="flex min-h-screen flex-col items-center justify-between bg-[radial-gradient(125%_125%_at_50%_90%,#ffffff_40%,#f4f4f5_100%)] bg-cover bg-center text-center text-sm max-md:px-4 dark:bg-[radial-gradient(125%_125%_at_50%_90%,#09090b_40%,#27272a_100%)]">
            <nav className="flex w-full items-center justify-between py-4 md:px-16 lg:px-24 xl:px-32">
                <Link href="/" className="shrink-0">
                    <Image
                        src="https://media.zoptero.com/img/zoptero-logo-32x32.svg"
                        alt="zoptero.com logo"
                        width={40}
                        height={40}
                        className="size-7"
                    />
                    <span className="sr-only">Zoptero</span>
                </Link>

                <NavigationMenu className="hidden max-w-none flex-1 justify-center md:flex">
                    <NavigationMenuList className="gap-6 text-sm font-medium">
                        {NAV_LINKS.map(({ label, href }) => (
                            <NavigationMenuItem key={label}>
                                <NavigationMenuLink asChild>
                                    <Link href={href}>{label}</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-full" size="sm" asChild>
                        <Link href="/sign-in">Ienākt</Link>
                    </Button>
                    <ThemeSwitch />
                </div>
            </nav>

            <div className="flex w-full max-w-xl flex-1 flex-col items-center justify-center space-y-4">
                <Badge6 />
                <header className="space-y-3">
                    <h1 className="text-3xl font-bold leading-tight lg:text-4xl">Ekspertu meklētājs.</h1>
                    <p className="text-muted-foreground text-sm">Tu meklē. Mēs atrodam. Ar MI.</p>
                </header>

                <div className="bg-muted focus-within:ring-white/40 mt-4 w-full space-y-4 overflow-hidden rounded-xl focus-within:ring-2">
                    <Textarea
                        placeholder="Un ko vēlies atrast Tu?"
                        rows={3}
                        className="min-h-16 border-0 bg-transparent p-4 pb-0 shadow-none focus-visible:ring-0"
                    />
                    <div className="flex items-center justify-between px-3 pb-3">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                            <Plus className="size-4" />
                            <span className="sr-only">Add</span>
                        </Button>
                        <Button size="icon" className="h-8 w-8 rounded-full">
                            <ArrowUp className="size-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </div>

                <div className="grid w-full gap-2 md:mt-4 md:grid-cols-2 md:gap-3">
                    {SUGGESTIONS.map((text, i) => (
                        <Link
                            key={i}
                            href="#"
                            className="hover:text-primary hover:bg-accent/50 block rounded-full border p-2 text-sm transition-colors"
                        >
                            {text}
                        </Link>
                    ))}
                </div>
            </div>

            <p className="text-muted-foreground pb-6 text-xs">
                By messaging us, you agree to our{" "}
                <Link href="#" className="hover:text-primary underline">Terms of Use</Link>{" "}
                and confirm you&apos;ve read our{" "}
                <Link href="#" className="hover:text-primary underline">Privacy Policy</Link>.
            </p>
        </section>
    );
}

// --- Page Export ---

// If this is all in one file, use the default export for the page
export default function HomePage() {
    return <HeroSection />;
}