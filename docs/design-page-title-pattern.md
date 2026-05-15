# Dashboard Page Title & Layout Pattern

This document defines the **global standard** for page layout within the authenticated dashboard (`/dashboard/*`). All new pages must follow this pattern for visual consistency.

## Title / Subtitle Section

Every dashboard page must begin with this exact structure as the first children of the page component's fragment (`<>`):

```tsx
<>
  <div className="mb-4 flex flex-row items-center justify-between space-y-2 lg:pl-2.5">
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight">Page Title</h1>
      <p className="text-muted-foreground text-sm">
        Page description / subtitle here.
      </p>
    </div>
  </div>

  {/* Page content goes here */}
</>
```

### Why this pattern

- **`mb-4`** — consistent bottom spacing between title and content.
- **`flex flex-row items-center justify-between`** — allows adding action items to the right of the title (e.g., buttons, toggles).
- **`lg:pl-2.5`** — provides 0.625rem left padding on `lg` screens, aligning the title vertically with the content below.
- **`space-y-1`** — 0.25rem gap between title and subtitle.
- **`text-2xl font-bold tracking-tight`** — standard dashboard heading size and weight.
- **`text-muted-foreground text-sm`** — standard subtitle styling.

### Implementation examples

**/dashboard** (profile page):
```tsx
<div className="mb-4 flex flex-row items-center justify-between space-y-2 lg:pl-2.5">
  <div className="space-y-1">
    <h1 className="text-2xl font-bold tracking-tight">Mana informācija</h1>
    <p className="text-muted-foreground text-sm">Pārvaldi savus datus un savu redzamību.</p>
  </div>
</div>
```

**/dashboard/privacy-policy**:
```tsx
<div className="mb-4 flex flex-row items-center justify-between space-y-2 lg:pl-2.5">
  <div className="space-y-1">
    <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
    <p className="text-muted-foreground text-sm">How we collect, use, and protect your personal data.</p>
  </div>
</div>
```

## Content Alignment

All page content below the title/subtitle must maintain the **same left padding axis** as the title by using `lg:pl-2.5`:

```tsx
<div className="mx-auto max-w-4xl space-y-4 lg:pl-2.5">
  {/* Page body content */}
</div>
```

> **Note**: Do **not** wrap the whole page inside `mx-auto max-w-4xl ...` — only the content section should use this wrapper if needed for max-width. The title/subtitle stays at the top-level fragment.

## Footer Reference

The `GlobalFooter` component is automatically rendered by the auth layout (`app/dashboard/(auth)/layout.tsx`) — no need to add it on individual pages.

## Key Rules

1. Title/subtitle is always the **first element** inside `<>`.
2. Use **`lg:pl-2.5`** on both the title div and the content wrapper to maintain the vertical axis.
3. Do **not** add extra top margin/padding (`xl:mt-8`, `pt-*`, etc.) to the title or content — spacing is handled by the layout.
4. If the page has no body content beyond the title, still keep the title structure the same.