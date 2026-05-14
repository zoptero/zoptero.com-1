# Task: Phase 1 - Discovery & Infrastructure Refactoring

## 1. MANDATORY: Discovery & Field Mapping (The "Audit" Phase)
Before making any changes, you must perform a full audit of the current data structure.
- **Action:** Open and analyze `convex/schema.ts` and the current `DashboardPageClient`.
- **Requirement:** Create a mapping of all current UI fields in the 16 tabs to their corresponding fields in the Convex schema.
- **Constraint:** DO NOT RENAME any fields. If `company_name` is in the database, it must stay `company_name` in the tab components.
- **Verification:** List all discovered fields and their types to me before proceeding with code generation.

## 2. Infrastructure: Dynamic Tab Configuration
Create `@/config/dashboard-tabs.ts` based on the audit.
- Define a `TabItem` interface: `id`, `label`, `component`, `roles: ("b2b" | "b2c")[]`.
- Map the existing 16 blocks of JSX from `page-client.tsx` into this config.
- For now, keep all tabs visible for both roles: `roles: ["b2b", "b2c"]` to ensure zero breaking changes.

## 3. Backend: Atomic Updates with Convex
- **Mutation:** Refactor the profile update mutation in `convex/profiles.ts`.
- **Logic:** Use `ctx.db.patch(id, { ...args })` instead of `replace`.
- **Flexibility:** Ensure the mutation accepts a partial set of fields. Since we are saving data per tab, we must only update the fields provided in that specific save action without deleting others.

## 4. Frontend: Form Context & Dynamic Rendering
- **Context:** In `page-client.tsx`, use the `form` object from `react-hook-form`.
- **Props:** Pass the `form` object as a prop to every dynamically rendered tab component.
- **UI:** Implement a loop to render `TabsTrigger` and `TabsContent` based on the `@/config/dashboard-tabs.ts` file.
- **Mobile UX:** Add `overflow-x-auto` to the `TabsList` to ensure 16 tabs are scrollable on small screens.

## 5. Success Criteria
- [ ] No fields are renamed or lost during the move.
- [ ] Saving one tab (e.g., "Contact") does not overwrite data in another tab (e.g., "SEO").
- [ ] The `DashboardPageClient` file size is reduced significantly.
- [ ] All 16 tabs render and function exactly as they do now.
