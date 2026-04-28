# /home Visuals Archive

This file contains the exported visuals (JSX) and CSS for the /home page as of 2026-04-27.

## JSX (React)

See archive/home-page.tsx for the full JSX and component code.

---

## CSS

### app/globals.css (excerpt)

@import "tailwindcss";
@plugin "tailwindcss-animate";
@custom-variant dark (&:is(.dark *));
@import "./themes.css";

:root {
	--base-50: oklch(0.985 0.0013 286.84);
	--base-100: oklch(0.967 0.0027 286.38);
	--base-200: oklch(0.92 0.0053 286.32);
	--base-300: oklch(0.871 0.008 286.29);
	--base-400: oklch(0.705 0.012 286.07);
	--base-500: oklch(0.552 0.016 285.94);
	--base-600: oklch(0.442 0.0147 285.79);
	--base-700: oklch(0.37 0.012 285.81);
	--base-800: oklch(0.274 0.008 286.03);
	--base-900: oklch(0.21 0.0053 285.89);
	--base-950: oklch(0.141 0.004 285.83);
	--base-1000: oklch(0.096 0.0027 285.79);
	...
}

.dark {
	--background: var(--base-950);
	--foreground: var(--base-200);
	...
}

@layer base {
	* {
		@apply border-border outline-ring/50;
	}
	body {
		@apply bg-background text-foreground;
	}
	...
}

### app/themes.css (excerpt)

body {
		@apply overscroll-none bg-transparent antialiased;
		--text-family: var(--font-outfit), sans-serif;
}

/* Theme presets and color variables omitted for brevity */
