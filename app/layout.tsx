import React from "react";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import GoogleAnalyticsInit from "@/lib/ga";
import { fontVariables } from "@/lib/fonts";
import NextTopLoader from "nextjs-toploader";
// Providers are now imported from components/Providers
import { Providers } from "@/components/Providers";

import "./globals.css";

import { ActiveThemeProvider } from "@/components/active-theme";
import { DEFAULT_THEME } from "@/lib/themes";
import { Toaster } from "@/components/ui/sonner";


export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeSettings = {
    preset: (cookieStore.get("theme_preset")?.value ?? DEFAULT_THEME.preset) as any,
    scale: (cookieStore.get("theme_scale")?.value ?? DEFAULT_THEME.scale) as any,
    radius: (cookieStore.get("theme_radius")?.value ?? DEFAULT_THEME.radius) as any,
    contentLayout: (cookieStore.get("theme_content_layout")?.value ??
      DEFAULT_THEME.contentLayout) as any
  };

  const bodyAttributes = Object.fromEntries(
    Object.entries(themeSettings)
      .filter(([_, value]) => value)
      .map(([key, value]) => [`data-theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value])
  );

    const lvLV = {
      locale: 'lv-LV',
      translations: {
        'signIn.title': 'Ienākt Zoptero',
        'signIn.subtitle': 'Lai turpinātu, lūdzu, pierakstieties',
      }
    };

    return (
      <html lang='lv' suppressHydrationWarning>
        <head>
          <link rel="icon" type="image/svg+xml" href="https://media.zoptero.com/img/zoptero-logo-32x32.svg" />
        </head>
        <body
          suppressHydrationWarning
          className={cn("bg-background group/layout font-sans", fontVariables)}
          {...bodyAttributes}>
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange>
              <ActiveThemeProvider initialTheme={themeSettings}>
                {children}
                <Toaster position="top-center" richColors />
                <NextTopLoader color="var(--primary)" showSpinner={false} height={2} shadow-sm="none" />
                {process.env.NODE_ENV === "production" ? <GoogleAnalyticsInit /> : null}
              </ActiveThemeProvider>
            </ThemeProvider>
          </Providers>
        </body>
      </html>
    );
}