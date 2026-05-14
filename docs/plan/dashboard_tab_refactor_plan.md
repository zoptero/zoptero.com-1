# Dashboard Tab Refactor Plan — B2B / B2C Role-Based Rendering

## Goal
Refactor the Dashboard so tabs are rendered dynamically from a central configuration, with support for B2B-only / B2C-only / shared tabs. All existing Convex field names, form schema, tab components, and save logic remain untouched.

## ⚠️ Absolute Constraint: Design Must Remain Unchanged

This is a **pure technical refactor**. Visual design must be **100% identical** after implementation.

### What will NOT change (visual/design):
- **No CSS changes** — zero edits to any `.css` file or inline styles
- **No layout changes** — Tabs wrapper, ScrollArea, scroll shadows, padding, margins stay exactly as they are
- **No component structure changes** — each tab renders the exact same component with the exact same props
- **No className modifications** — `className="space-y-4"` and all other utility classes remain untouched
- **No shadcn/ui component swaps** — same `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`, `<ScrollArea>`, `<Button>` as today
- **The dashboard will look and function identically** — the only difference is that `<TabsTrigger>` and `<TabsContent>` are generated via `.map()` loops instead of being written out 15 times manually

### What WILL change (pure technical refactor):
1. Create `@/config/dashboard-tabs.ts` — a data array with `id`, `label`, `roles`
2. Edit `page-client.tsx` — only the rendered JSX sections (TabsTrigger and TabsContent blocks), keeping all imports, form logic, state, effects, and the submit button exactly as they are
3. Add `TabPartners` import and its case in the render switch
4. Add URL query sync (`?tab=`) as a technical enhancement for refresh persistence

---

## Phase 1: Audit & Mapping (Already Done)

### Current Tab → Component → Props Mapping

| # | Tab value     | Label          | Component        | Props passed                                                |
|---|---------------|----------------|------------------|-------------------------------------------------------------|
| 1 | `profile`     | Profils        | `TabProfile`     | form, previewUrl, previewFile, removeAvatar, profile, addFiles, removeFile, setRemoveAvatar, setFocusedField |
| 2 | `contact`     | Kontakti       | `TabContacts`    | form                                                         |
| 3 | `business`    | Pakalpojumi    | `TabServices`    | form, SECTOR_OPTIONS, parseDateFromInput, getTodayStart, format |
| 4 | `uzdevumi`    | Uzdevumi       | `TabTasks`       | (no props)                                                   |
| 5 | `foto`        | Foto           | `TabPhoto`       | form                                                         |
| 6 | `video`       | Video          | `TabVideo`       | form                                                         |
| 7 | `blogs`       | Blogs          | `TabBlog`        | (no props)                                                   |
| 8 | `veikals`     | Veikals        | `TabShop`        | (no props)                                                   |
| 9 | `sludinajumi` | Sludinājumi    | `TabClassfields` | (no props)                                                   |
| 10| `buj`         | BUJ            | `TabFaq`         | (no props)                                                   |
| 11| `seo`         | SEO            | `TabSeo`         | form, slugValue, slugCheckResult, profile, seoImagePreviewUrl, seoImagePreviewFile, removeSeoImage, setRemoveSeoImage, addSeoImageFiles, removeSeoImageFile, headerImagePreviewUrl, headerImagePreviewFile, removeHeaderImage, setRemoveHeaderImage, addHeaderImageFiles, removeHeaderImageFile |
| 12| `payments`    | Apmaksa        | `TabPayments`    | form                                                         |
| 13| `delivery`    | Piegāde        | `TabDelivery`    | form                                                         |
| 14| `atsauksmes`  | Atsauksmes     | `TabReviews`     | (no props)                                                   |
| 15| `qr`          | QR             | `TabQr`          | slugValue                                                    |
| — | `partners`    | (unused)       | `TabPartners`    | file exists but NOT imported/rendered                         |

All 37 Convex profile fields map 1:1 to form fields. No renames needed.

---

## Phase 2: Create Config File

**File to create:** `@/config/dashboard-tabs.ts`

### Structure

```ts
export interface TabItem {
  id: string;           // matches TabsTrigger/TabsContent value
  label: string;        // display label
  roles: ("b2b" | "b2c")[];  // which account types see this tab
  // component and props are handled separately in page-client.tsx
}

export const DASHBOARD_TABS: TabItem[] = [
  { id: "profile",     label: "Profils",       roles: ["b2b", "b2c"] },
  { id: "business",    label: "Pakalpojumi",   roles: ["b2b", "b2c"] },
  { id: "contact",     label: "Kontakti",      roles: ["b2b", "b2c"] },
  { id: "uzdevumi",    label: "Uzdevumi",      roles: ["b2b", "b2c"] },
  { id: "foto",        label: "Foto",          roles: ["b2b", "b2c"] },
  { id: "video",       label: "Video",         roles: ["b2b", "b2c"] },
  { id: "blogs",       label: "Blogs",         roles: ["b2b", "b2c"] },
  { id: "veikals",     label: "Veikals",       roles: ["b2b", "b2c"] },
  { id: "sludinajumi", label: "Sludinājumi",   roles: ["b2b", "b2c"] },
  { id: "buj",         label: "BUJ",           roles: ["b2b", "b2c"] },
  { id: "seo",         label: "SEO",           roles: ["b2b", "b2c"] },
  { id: "payments",    label: "Apmaksa",       roles: ["b2b", "b2c"] },
  { id: "delivery",    label: "Piegāde",       roles: ["b2b", "b2c"] },
  { id: "atsauksmes",  label: "Atsauksmes",    roles: ["b2b", "b2c"] },
  { id: "qr",          label: "QR",            roles: ["b2b", "b2c"] },
  { id: "partners",    label: "Partneri",      roles: ["b2b", "b2c"] },
];
```

**Note:** All tabs initially set to `["b2b", "b2c"]` — identical fields for both types. Later, roles can be changed to restrict tabs per type.

---

## Phase 3: Update page-client.tsx

**File to edit:** `app/dashboard/(auth)/page-client.tsx`

### 3a. Add TabPartners import (line 75)
```ts
import TabPartners from "./profile-tabs/tab-partners";
```

### 3b. Import the config
```ts
import { DASHBOARD_TABS } from "@/config/dashboard-tabs";
```

### 3c. Filter tabs by accountType

After the `profile` query result, compute a filtered list:
```ts
const accountType = profile?.accountType;
const visibleTabs = React.useMemo(() => {
  if (!accountType || accountType === "") return DASHBOARD_TABS; // fallback: show all
  return DASHBOARD_TABS.filter(tab => tab.roles.includes(accountType));
}, [accountType]);
```

### 3d. Replace hardcoded TabsTrigger blocks (lines 888-903)

**Replace this:**
```tsx
<TabsTrigger value="profile">Profils</TabsTrigger>
<TabsTrigger value="business">Pakalpojumi</TabsTrigger>
...
```

**With this:**
```tsx
{visibleTabs.map(tab => (
  <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
))}
```

### 3e. Replace hardcoded TabsContent blocks (lines 925-1002)

**Replace the 15 `<TabsContent>` blocks** with a dynamic render function:

Create a helper that maps `tab.id` to its component render:
```tsx
function renderTabContent(tabId: string) {
  switch (tabId) {
    case "profile":
      return <TabProfile form={form} previewUrl={previewUrl} previewFile={previewFile} removeAvatar={removeAvatar} profile={profile} addFiles={addFiles} removeFile={removeFile} setRemoveAvatar={setRemoveAvatar} setFocusedField={setFocusedField} />;
    case "contact":
      return <TabContacts form={form} />;
    case "business":
      return <TabServices form={form} SECTOR_OPTIONS={SECTOR_OPTIONS} parseDateFromInput={parseDateFromInput} getTodayStart={getTodayStart} format={format} />;
    case "uzdevumi":
      return <TabTasks />;
    case "foto":
      return <TabPhoto form={form} />;
    case "video":
      return <TabVideo form={form} />;
    case "blogs":
      return <TabBlog />;
    case "veikals":
      return <TabShop />;
    case "sludinajumi":
      return <TabClassfields />;
    case "buj":
      return <TabFaq />;
    case "seo":
      return <TabSeo form={form} slugValue={slugValue} slugCheckResult={slugCheckResult} profile={profile} seoImagePreviewUrl={seoImagePreviewUrl} seoImagePreviewFile={seoImagePreviewFile} removeSeoImage={removeSeoImage} setRemoveSeoImage={setRemoveSeoImage} addSeoImageFiles={addSeoImageFiles} removeSeoImageFile={removeSeoImageFile} headerImagePreviewUrl={headerImagePreviewUrl} headerImagePreviewFile={headerImagePreviewFile} removeHeaderImage={removeHeaderImage} setRemoveHeaderImage={setRemoveHeaderImage} addHeaderImageFiles={addHeaderImageFiles} removeHeaderImageFile={removeHeaderImageFile} />;
    case "payments":
      return <TabPayments form={form} />;
    case "delivery":
      return <TabDelivery form={form} />;
    case "atsauksmes":
      return <TabReviews />;
    case "qr":
      return <TabQr slugValue={slugValue} />;
    case "partners":
      return <TabPartners />;
    default:
      return null;
  }
}
```

Then render inside the `<form>` tag:
```tsx
{visibleTabs.map(tab => (
  <TabsContent key={tab.id} value={tab.id} className="space-y-4">
    {renderTabContent(tab.id)}
  </TabsContent>
))}
```

---

## Phase 4: What Stays the Same

| Aspect | Status |
|--------|--------|
| `convex/schema.ts` — all 37 profile fields | Unchanged |
| `convex/profiles.ts` — save mutation | Unchanged |
| `app/dashboard/(auth)/profile-form-schema.ts` | Unchanged |
| `app/dashboard/(auth)/page-client.tsx` — imports (except new ones), form hook, state variables, effects, submit handler, save button, Tabs wrapper, scroll shadows | Unchanged |
| `app/dashboard/(auth)/profile-tabs/tab-*.tsx` — all 16 tab components | Unchanged |
| All existing Convex field names (`displayName`, `aboutMe`, `phone`, `city`, `hourPrice`, `seoTitle`, `slug`, etc.) | Unchanged |
| Form behavior — save per tab does not overwrite other tabs | Already works |

---

## Phase 5: Verification Steps

1. Run `pnpm dev` — app should start without errors
2. Open dashboard — all 16 tabs render as before
3. Switch between tabs — content loads correctly
4. Save a tab — mutation works, fields persist
5. If `accountType` is undefined/null — all tabs still show (fallback)
6. Later: change a tab's `roles` array to test filtering (e.g., make "Veikals" B2B-only)

---

## Phase 6: Future Customization (After Core Works)

Once the dynamic rendering is verified, individual tabs can be restricted:

```ts
// Example: B2B-only tabs
{ id: "veikals",     label: "Veikals",       roles: ["b2b"] },
{ id: "sludinajumi", label: "Sludinājumi",   roles: ["b2b"] },
{ id: "delivery",    label: "Piegāde",       roles: ["b2b"] },
{ id: "partners",    label: "Partneri",      roles: ["b2b"] },

// Example: B2C-only tabs
{ id: "foto",        label: "Foto",          roles: ["b2c"] },
```

If B2B and B2C need completely different field arrangements within a tab, create new tab components (e.g., `tab-profile-b2b.tsx`, `tab-profile-b2c.tsx`) and update the `renderTabContent` switch to use different components based on `accountType`.

---

## Files Changed Summary

| Action | File |
|--------|------|
| **CREATE** | `@/config/dashboard-tabs.ts` |
| **EDIT**  | `app/dashboard/(auth)/page-client.tsx` |

No other files are touched.