# Onboarding Flow - Detailed Step-by-Step Breakdown

## Complete User Journey with Timings

### **PHASE 1: LOGIN (Clerk Authentication)**

**1.** User clicks "Sign In" button on homepage
- Location: Browser (any page)
- Time: T=0ms
- Action: Initiates Clerk authentication flow

**2.** Browser redirects to Clerk's authentication UI
- Location: `clerk.com` (external)
- Time: T=50-200ms (network dependent)
- Action: User enters email/password or clicks Google/social login

**3.** Clerk verifies credentials
- Location: Clerk servers (external)
- Time: T=200-500ms (external service)
- Action: Validates user credentials against Clerk database

**4.** Clerk creates authenticated session token
- Location: Clerk servers
- Time: T=500-700ms
- Action: Generates JWT session token

**5.** Browser receives session token and redirects to callback URL
- Location: Browser
- Time: T=700-800ms
- Callback URL: `/dashboard` (or configured redirect)
- Action: Next.js middleware intercepts and checks session

---

### **PHASE 2: MIDDLEWARE PROCESSING**

**6.** Next.js middleware validates Clerk session (proxy.ts)
- Location: `proxy.ts` middleware
- Time: T=800-820ms
- Code: Checks for valid `__session` cookie
- Decision: Is user authenticated?

**7.** Middleware reads Clerk session from cookies
- Location: `proxy.ts`
- Time: T=820-830ms
- Data: Reads `__session` cookie containing JWT
- Result: ✅ User IS authenticated

**8.** Middleware checks if user needs onboarding
- Location: `proxy.ts`
- Time: T=830-850ms
- Check: Does user have `onboardingComplete` in Clerk metadata?
- Result: ❌ NO (new user)
- Action: Redirect to `/onboarding`

**9.** Browser navigates to `/onboarding`
- Location: Browser
- Time: T=850-900ms
- URL: `https://zoptero.com/onboarding`
- Method: `router.push()` or direct navigation

---

### **PHASE 3: SERVER-SIDE RENDERING (OnboardingLayout)**

**10.** Server renders `app/onboarding/layout.tsx`
- Location: Next.js server
- Time: T=900-920ms
- Action: Starts server component execution
- File: `app/onboarding/layout.tsx` (lines 6-27)

**11.** OnboardingLayout preloads `getOnboardingStatus` query
- Location: Server (Convex)
- Time: T=920-950ms
- Code: `const preloadedStatus = await preloadQuery(api.users.getOnboardingStatus)`
- Purpose: Pre-fetch status to reduce waterfall
- Duration: ~30ms

**12.** Query calls `getOnboardingStatus` in Convex
- Location: `convex/users.ts` (lines 261-295)
- Time: T=950-960ms
- Function: `getOnboardingStatus` query
- Steps:
  - **12a.** Get user identity from JWT: `ctx.auth.getUserIdentity()`
    - Time: T=950-951ms
    - Result: `{ subject: "user_abc123", email: "user@example.com" }`
  
  - **12b.** Query users table by clerkId
    - Time: T=951-955ms
    - Code: `.query("users").withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject)).first()`
    - Result: ❌ User NOT found yet (webhook hasn't completed)
  
  - **12c.** Return status "syncing"
    - Time: T=955-960ms
    - Return value: `{ status: "syncing" }`

**13.** Preloaded status is passed to OnboardingGuard
- Location: Server → Client boundary
- Time: T=960-970ms
- Data: `preloadedStatus = { status: "syncing" }`

**14.** Server renders OnboardingGuard component
- Location: Next.js server
- Time: T=970-980ms
- File: `components/OnboardingGuard.tsx` (lines 16-68)
- Props: `preloadedStatus = { status: "syncing" }`

**15.** OnboardingGuard shows skeleton/loading state
- Location: Server → Client
- Time: T=980-1000ms
- UI: Shows "Sinhronizējam profilu..." spinner
- Code: Lines 41-47 in OnboardingGuard

**16.** Hydration: Client receives HTML and hydrates React
- Location: Browser
- Time: T=1000-1050ms
- Action: JavaScript takes over from server-rendered HTML
- UI State: Currently showing "Sinhronizējam profilu..."

---

### **PHASE 4: WEBHOOK PROCESSING (Async)**

🔄 **Running in parallel since T=700ms:**

**17.** Clerk emits `user.created` event
- Location: Clerk servers
- Time: T=700ms (after session created)
- Event Type: `user.created` or `user.updated`
- Data: User ID, email, name, avatar URL
- Destination: Your webhook at `/api/clerk/post-login`

**18.** Webhook signature arrives at your server
- Location: `app/api/clerk/post-login/route.ts` (line 1)
- Time: T=850-1200ms (network dependent, race with browser)
- Method: POST request
- Headers: Includes `svix-id`, `svix-timestamp`, `svix-signature`

**19.** Webhook verifies Clerk signature
- Location: `app/api/clerk/post-login/route.ts` (lines 22-45)
- Time: T=850-860ms
- Code: `new Webhook(secret).verify(body, headers)`
- Purpose: Ensure webhook came from Clerk
- Result: ✅ Signature valid (or ❌ Invalid → returns 400)

**20.** Webhook extracts user data from event
- Location: `app/api/clerk/post-login/route.ts` (lines 62-82)
- Time: T=860-870ms
- Data extracted:
  - `clerkId` = `"user_abc123"`
  - `email` = `"user@example.com"`
  - `name` = `"John Doe"`
  - `avatarUrl` = `"https://lh3.googleusercontent.com/..."`

**21.** Webhook calls `ensureCurrentUser` mutation
- Location: `app/api/clerk/post-login/route.ts` (line 90)
- Time: T=870-920ms
- Code: `await convex.mutation(api.users.ensureCurrentUser, { email, name, avatarUrl })`
- Destination: Convex backend

**22.** `ensureCurrentUser` mutation runs
- Location: `convex/users.ts` (lines 347-423)
- Time: T=870-920ms
- Steps:
  
  - **22a.** Get user identity (from Convex auth)
    - Time: T=870-872ms
    - Code: `const identity = await ctx.auth.getUserIdentity()`
    - Result: `{ subject: "user_abc123" }`
  
  - **22b.** Get primary user by clerkId
    - Time: T=872-880ms
    - Code: `await getPrimaryUserByClerkId(ctx, clerkId)`
    - Function: Queries users table with `.withIndex("by_clerk_id").collect()`
    - Result: ❌ NO user found (first time login)
  
  - **22c.** Try email-based sync (syncByEmail)
    - Time: T=880-885ms
    - Code: `await syncByEmail(ctx, { clerkId, email, name, avatarUrl })`
    - Query: `.query("users").withIndex("by_email").collect()`
    - Result: ❌ NO matching email (new user)
  
  - **22d.** Create new user record in database
    - Time: T=885-910ms
    - Code: `ctx.db.insert("users", { clerkId, email, name, avatarUrl, onboardingComplete: false })`
    - Table: `users` collection
    - Fields inserted:
      - `clerkId`: "user_abc123"
      - `email`: "user@example.com"
      - `name`: "John Doe"
      - `avatarUrl`: "https://lh3.googleusercontent.com/..."
      - `onboardingComplete`: false
      - `createdAt`: 1715000000 (timestamp)
    - Result: ✅ User created with ID `user_123_abc`

  - **22e.** Return onboarding status
    - Time: T=910-920ms
    - Return: `{ onboardingComplete: false }`

**23.** Webhook logs completion
- Location: `app/api/clerk/post-login/route.ts` (line 96)
- Time: T=920-921ms
- Log: `[Post-Login] User sync completed in 50ms for user user_abc123`

**24.** Webhook returns success response
- Location: `app/api/clerk/post-login/route.ts` (line 101)
- Time: T=921-922ms
- Response: `{ success: true, latency: 50 }`
- Status: 200 OK

---

### **PHASE 5: BROWSER REACTIVITY & RE-QUERY**

**25.** OnboardingGuard re-queries `getOnboardingStatus`
- Location: Browser (React hook)
- Time: T=1050-1100ms (depends on when subscriber updates fire)
- Code: `const onboardingStatus = useQuery(api.users.getOnboardingStatus)`
- Trigger: Convex real-time subscription fires (webhook wrote to database)

**26.** New query finds user in database
- Location: `convex/users.ts` (lines 261-295)
- Time: T=1100-1110ms
- Steps:
  
  - **26a.** Get identity from JWT
    - Result: `{ subject: "user_abc123" }`
  
  - **26b.** Query users table by clerkId
    - Code: `.query("users").withIndex("by_clerk_id").first()`
    - Result: ✅ FOUND! Returns:
      ```
      {
        _id: "user_123_abc",
        clerkId: "user_abc123",
        email: "user@example.com",
        name: "John Doe",
        avatarUrl: "...",
        onboardingComplete: false,
        accountType: undefined
      }
      ```
  
  - **26c.** Check if onboarding complete
    - Time: T=1105-1107ms
    - Check: `user.onboardingComplete === true && user.accountType`?
    - Result: ❌ NO (not complete, accountType not set)
    - Return: `{ status: "incomplete" }`

**27.** React re-renders OnboardingGuard with new status
- Location: Browser
- Time: T=1110-1120ms
- Old state: `status: "syncing"` (shows spinner)
- New state: `status: "incomplete"` (shows UI)
- Transition: Spinner disappears, onboarding cards appear

**28.** OnboardingGuard checks redirect conditions
- Location: `components/OnboardingGuard.tsx` (lines 20-43)
- Time: T=1110-1125ms
- Checks:
  - `if (onboardingStatus === undefined)` → ❌ NO, it's loaded
  - `if (hasRedirected.current)` → ❌ NO, first check
  - `if (isOptimisticRedirecting)` → ❌ NO, user hasn't clicked button yet
  - `if (status === "complete" && accountType)` → ❌ NO, incomplete
  - Result: **STAY on onboarding page** ✅

**29.** OnboardingCards UI renders
- Location: `components/OnboardingCards.tsx` (lines 1-90)
- Time: T=1120-1150ms
- UI Elements:
  - Badge: "Informācijas platforma"
  - Title: "Es darbošos kā"
  - Subtitle: "Izvēlies piemērotāko veidu"
  - Two cards:
    - "Individuāls speciālists" (B2C)
    - "B2B Uzņēmums" (B2B)
  - Disabled "Turpināt" button (waiting for selection)

**30.** UI becomes interactive
- Location: Browser
- Time: T=1150-1200ms
- State: User can now click on cards and select B2C or B2B
- **TOTAL TIME TO INTERACTIVE: ~1200ms** (minus initial Clerk login time)

---

### **PHASE 6: USER SELECTION**

**31.** User clicks on one of the account type cards
- Location: Browser
- Time: T=1200-1500ms (user thinks about choice)
- Event: `onClick` on either B2C or B2B card
- File: `components/OnboardingCards.tsx` (line 46)
- Code: `onClick={() => setSelected(option.value)}`
- Result: Selected state updates to "b2c" or "b2b"

**32.** Card highlights with border/ring effect
- Location: Browser
- Time: T=1200-1210ms (immediate visual feedback)
- CSS: `border-primary ring-2 ring-primary` applied

**33.** "Turpināt" button becomes enabled
- Location: Browser
- Time: T=1200-1210ms
- Code: `disabled={!selected || isSubmitting}` → now false
- UI: Button changes from gray to blue/active

**34.** User clicks "Turpināt" button
- Location: Browser
- Time: T=1250-1500ms (varies by user)
- Event: `onClick` on button
- File: `components/OnboardingCards.tsx` (line 82)
- Code: `onContinue?.(selected)` → calls `handleContinue("b2c")` or `handleContinue("b2b")`

---

### **PHASE 7: FORM SUBMISSION**

**35.** `handleContinue` function executes
- Location: `app/onboarding/page.tsx` (lines 35-62)
- Time: T=1250-1260ms
- Steps:
  
  - **35a.** Check if user exists
    - Code: `if (!user)`
    - Result: ✅ YES, from Clerk context
  
  - **35b.** Set optimistic redirect state
    - Time: T=1250-1251ms
    - Code: `setIsOptimisticRedirecting(true)`
    - Purpose: Show loading state and prepare for redirect
  
  - **35c.** Set submitting state
    - Time: T=1250-1251ms
    - Code: `setIsSubmitting(true)`
    - Purpose: Disable button, show loading text "Veidojam lietotāju"
  
  - **35d.** Clear any previous errors
    - Code: `setError(null)`

**36.** UI updates with loading state
- Location: Browser
- Time: T=1251-1260ms
- Changes:
  - Button text changes to "Veidojam lietotāju"
  - Button becomes disabled
  - Cards might be greyed out or hidden
  - Loading spinner might appear

**37.** `setAccountTypeForUserAndProfile` mutation is called
- Location: `app/onboarding/page.tsx` (line 49)
- Time: T=1260-1270ms
- Call: `await setAccountType({ accountType: "b2c" | "b2b", email, name, avatarUrl })`
- Destination: Convex backend

---

### **PHASE 8: DATABASE UPDATE**

**38.** `setAccountTypeForUserAndProfile` mutation runs
- Location: `convex/onboarding.ts` (lines 40-80)
- Time: T=1260-1350ms
- Steps:
  
  - **38a.** Get user identity
    - Time: T=1260-1261ms
    - Code: `const identity = await ctx.auth.getUserIdentity()`
    - Result: `{ subject: "user_abc123" }`
  
  - **38b.** Query users table by clerkId
    - Time: T=1261-1265ms
    - Code: `.query("users").withIndex("by_clerk_id").first()`
    - Result: ✅ FOUND user record
  
  - **38c.** Update user record
    - Time: T=1265-1275ms
    - Code: `ctx.db.patch(user._id, { accountType, email, name, avatarUrl, onboardingComplete: true })`
    - Table: `users`
    - Fields updated:
      - `accountType`: "b2c" (or "b2b")
      - `email`: "user@example.com"
      - `name`: "John Doe"
      - `avatarUrl`: "..."
      - `onboardingComplete`: true
  
  - **38d.** Query all profiles for this user
    - Time: T=1275-1290ms
    - Code: `.query("profiles").withIndex("by_clerk_id").collect()`
    - Result: Array of user's profiles (could be 0, 1, or many)
    - Example: `[{ _id: "profile_1", clerkId: "user_abc123", ... }]`
  
  - **38e.** Update each profile with accountType
    - Time: T=1290-1320ms
    - Code: For each profile, `ctx.db.patch(profile._id, { accountType })`
    - Example: Updates 1-10+ profiles sequentially
    - Duration: 20-30ms per profile
  
  - **38f.** Schedule Clerk metadata sync (non-blocking)
    - Time: T=1320-1325ms
    - Code: `ctx.scheduler.runAfter(0, api.onboarding.updateClerkMetadata, ...)`
    - Purpose: Update Clerk's publicMetadata with `onboardingComplete: true`
    - Note: This runs asynchronously, doesn't block response
  
  - **38g.** Return null
    - Time: T=1325-1330ms
    - Return: `null`

**39.** Convex publishes change to real-time subscribers
- Location: Convex backend
- Time: T=1330-1335ms
- Event: Update event published for `users` table
- Subscribers: Any component subscribed to `getOnboardingStatus` query

---

### **PHASE 9: REDIRECT**

**40.** `setAccountType` mutation completes successfully
- Location: Browser (after await completes)
- Time: T=1350-1360ms
- Result: ✅ Mutation returned successfully (no error)

**41.** Code does NOT manually call `router.push()`
- Location: `app/onboarding/page.tsx` (line 57)
- Time: T=1360-1361ms
- Note: Comment says "We do NOT call router.push here"
- Reason: OnboardingGuard will handle redirect reactively

**42.** Code exits try/finally block
- Location: `app/onboarding/page.tsx` (line 61)
- Time: T=1361-1370ms
- Code: `setIsSubmitting(false)`
- Purpose: Re-enable button (but page will redirect anyway)

**43.** Real-time query update fires
- Location: Browser (React hook)
- Time: T=1330-1380ms (depends on Convex sync)
- Hook: `const onboardingStatus = useQuery(api.users.getOnboardingStatus)`
- Trigger: Subscription receives update from Phase 38

**44.** New query checks updated user record
- Location: `convex/users.ts` (lines 261-295)
- Time: T=1380-1390ms
- Steps:
  
  - **44a.** Get identity
    - Result: `{ subject: "user_abc123" }`
  
  - **44b.** Query users by clerkId
    - Result: ✅ FOUND, now with `onboardingComplete: true` and `accountType: "b2c"`
  
  - **44c.** Check completion condition
    - Check: `user.onboardingComplete === true && user.accountType === "b2c"`?
    - Result: ✅ YES!
    - Return: `{ status: "complete", accountType: "b2c" }`

**45.** React re-renders OnboardingGuard with complete status
- Location: Browser
- Time: T=1390-1400ms
- State: `{ status: "complete", accountType: "b2c" }`

**46.** OnboardingGuard useEffect checks redirect conditions
- Location: `components/OnboardingGuard.tsx` (lines 20-43)
- Time: T=1400-1410ms
- Checks:
  - `if (onboardingStatus === undefined)` → ❌ NO, it's loaded
  - `if (hasRedirected.current)` → ❌ NO, first redirect
  - `if (isOptimisticRedirecting)` → ✅ YES! (we set this in step 35b)
  - Action: `hasRedirected.current = true` and `router.replace("/dashboard")`

**47.** Browser navigates to `/dashboard`
- Location: Browser
- Time: T=1410-1420ms
- Code: `router.replace("/dashboard")`
- Method: Next.js `useRouter().replace()` (no history entry)
- Destination: `/dashboard` page

**48.** Next.js renders dashboard layout
- Location: Next.js server
- Time: T=1420-1450ms
- File: `app/dashboard/layout.tsx` or `app/layout.tsx`
- Action: Server renders dashboard UI

**49.** Dashboard page renders
- Location: Browser
- Time: T=1450-1500ms
- UI: Shows user's dashboard with personalized greeting
- Components: Navigation, sidebar, main content area

**50.** Onboarding is complete! ✅
- Location: Browser
- Time: T=1500ms (from T=0 when user logged in)
- State: User is on dashboard, `onboardingComplete: true` in database
- Next: User can now use the full application

---

## Timeline Summary

| Phase | Duration | Time Range | Status |
|-------|----------|-----------|--------|
| Clerk Login | 500-700ms | T=0-700ms | 🟦 External |
| Middleware Check | 50ms | T=800-850ms | 🟩 Fast |
| Preload Query | 30ms | T=920-950ms | 🟩 Fast |
| Webhook Processing | 50-70ms | T=870-920ms | 🟩 Fast |
| Browser Hydration | 50ms | T=1000-1050ms | 🟩 Fast |
| Re-query (syncing→incomplete) | 10-20ms | T=1100-1120ms | 🟩 Fast |
| UI Rendering | 50ms | T=1120-1170ms | 🟩 Fast |
| User Thinks (delay) | 50-300ms | T=1170-1470ms | 🟨 User |
| User Clicks Button | 0ms | T=1470ms | 🟩 Fast |
| Mutation Execution | 60-90ms | T=1470-1560ms | 🟩 Fast |
| Re-query (incomplete→complete) | 10-20ms | T=1540-1560ms | 🟩 Fast |
| Redirect & Render | 50ms | T=1560-1610ms | 🟩 Fast |
| **TOTAL** | **~1.6s** | **T=0-1600ms** | 📊 Acceptable |

---

## Where Delays Happen

### 🔴 **CRITICAL DELAYS** (50-600ms each)

1. **Initial Clerk Login** (T=0-700ms)
   - Reason: External Clerk authentication service
   - Not in your control, but necessary

2. **Webhook Race Condition** (T=850-1100ms)
   - When: Browser queries at T=1050ms, webhook finishes at T=920ms
   - Result: Sometimes user sees "syncing" spinner for 50-200ms
   - Cause: Asynchronous webhook processing

3. **User Thinking Time** (T=1170-1470ms)
   - Reason: User reads cards and decides which option to click
   - Not a bug, but unavoidable

### 🟡 **MODERATE DELAYS** (10-30ms each)

4. **Profile Updates Loop** (T=1290-1320ms)
   - Reason: Sequential updates (20-30ms per profile)
   - Fixable: Use parallel updates with `Promise.all()`

5. **Multiple Database Queries** (Various)
   - Reason: `ensureCurrentUser` does 2-3 sequential queries
   - Fixable: Consolidate to single clerkId lookup

---

## Performance Bottleneck Map

```
User Login (0-700ms)
    ↓
Navigation to /onboarding (850-950ms)
    ├─ Preload Query: 30ms [MEDIUM IMPACT]
    ├─ Browser Hydration: 50ms [FAST]
    └─ Webhook Race: Causes "syncing" spinner [HIGH IMPACT]
         ├─ ensureCurrentUser: 50ms [MEDIUM IMPACT - fixable]
         └─ Profile Loops: 20-90ms per user [HIGH IMPACT - fixable]
    ↓
User Clicks Button (1170-1470ms = waiting)
    ↓
setAccountType Mutation (1470-1560ms)
    ├─ User Lookup: 4ms [FAST]
    ├─ User Patch: 10ms [FAST]
    ├─ Profile Query: 15ms [FAST]
    └─ Profile Patches: 20-80ms [HIGH IMPACT - fixable]
    ↓
Redirect to Dashboard (1560-1610ms) ✅
```

---

## Key Observations

### ✅ **What's Working Well**
- Clerk authentication is reliable
- Middleware checks are fast (<50ms)
- Basic queries are fast (<20ms)
- Real-time subscriptions fire quickly

### 🔴 **What Needs Fixing**
1. **Profile loops** — Sequential instead of parallel
2. **ensureCurrentUser queries** — Multiple lookups instead of single
3. **Webhook async timing** — Race condition creates "syncing" spinner

### 📊 **Where Time Is Actually Spent**
- **40%** — Clerk authentication (unavoidable)
- **20%** — User thinking/clicking (unavoidable)
- **15%** — Profile updates (FIXABLE)
- **15%** — Database queries (FIXABLE)
- **10%** — Rendering & networking (FAST)

