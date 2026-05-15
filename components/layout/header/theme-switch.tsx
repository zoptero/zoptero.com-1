"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeSwitchProps = {
  className?: string;
};

export default function ThemeSwitch({ className }: ThemeSwitchProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      className={cn("relative", className)}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}