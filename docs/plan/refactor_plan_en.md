# Task: Implement Conditional Dashboard Tabs & Public Profile Structure

## Context
Refactor the Dashboard to support two distinct user types: **B2B** (Business) and **B2C** (Individual). The UI should dynamically render tabs based on `accountType`. Additionally, prepare the foundation for a modern "Bento Grid" style Public Profile.

## Step 1: Define Tab Configurations
Create a configuration file to manage which tabs are visible for each role.
- File: `@/config/dashboard-tabs.ts`
- Implementation:
    - Define a `TabItem` interface.
    - Create a constant `DASHBOARD_TABS` that maps `B2B` and `B2C` roles to their respective tab lists.
    - Shared tabs (e.g., Settings) should be defined once and reused.

## Step 2: Implement Dynamic Tab Switcher
Update the `DashboardPageClient` to use the new configuration.
- Fetch `accountType` from the user profile.
- Filter the `TabsList` based on the configuration.
- Ensure the `TabsContent` correctly maps to the selected configuration.

## Step 3: B2B vs B2C Component Separation
Create specialized components for role-specific data.
- `@/components/dashboard/tabs/b2b-company-info.tsx` (Company details, VAT, etc.)
- `@/components/dashboard/tabs/b2c-individual-info.tsx` (Skills, Portfolio, etc.)
- Ensure these components use shared UI primitives for visual consistency.

## Step 4: Public Profile URL & Layout Setup
Prepare for the public-facing side.
- Implement a catch-all route: `/app/[username]/page.tsx`.
- Add logic to handle the "Bento Grid" layout:
    - Header: Avatar + Bio (Large card).
    - Grid: Social links (Small cards), Featured Work (Medium cards), Contact (Small card).
- Use `framer-motion` for subtle entry animations.

## Step 5: URL State Management
- Sync the active tab with the URL query string (e.g., `/dashboard?tab=business`).
- This ensures that if a user refreshes the page, they return to the exact same tab.

## Acceptance Criteria
- [ ] B2B users see "Company Information" while B2C users see "My Portfolio".
- [ ] Common tabs (Security, Profile) are visible to both.
- [ ] No "empty state" errors when switching between account types.
- [ ] URL reflects the active tab.
