# ⚡ Quick Testing Checklist - Onboarding Optimization

## Pre-Deployment: 15-Minute Verification

Copy and paste each test as you verify it. ✅ = Pass, ❌ = Fail

---

## Test 1: Performance Logging Setup (3 min)

### Step 1: Check Performance Utility Exists
```bash
# Terminal
ls -la convex/utils.ts
# Expected: File exists with measure() functions
```
**Status:** ✅ ❌

### Step 2: Verify Imports in Files
```bash
# Terminal
grep -n "import.*measure" convex/users.ts convex/onboarding.ts
# Expected: 2 matches (one in each file)
```
**Status:** ✅ ❌

### Step 3: Start Convex Dev & Check Console
```bash
# Terminal
npx convex dev
# Open browser console (F12 → Console tab)
# You should be ready to see [PERF] logs
```
**Status:** ✅ ❌

---

## Test 2: Database Query Optimization (3 min)

### Step 1: Complete a Login
1. Open your app
2. Click "Sign In"
3. Complete OAuth flow
4. Navigate to onboarding page

### Step 2: Check Console for [PERF] Logs
```javascript
// Browser Console - Filter for PERF
// You should see logs like:
[PERF] [ensureCurrentUser] clerkId lookup: 12ms
[PERF] [ensureCurrentUser] full operation: 18ms
```

**Expected Times:**
- clerkId lookup: **<15ms** ✅
- email sync: **<10ms** ✅
- full operation: **<30ms** ✅

**Status:** ✅ ❌

### Step 3: Verify No Multiple Queries
```bash
# Terminal - Check convex/users.ts
grep -c "\.collect()" convex/users.ts
# Expected: Should be minimal (for batch operations only, not ensureCurrentUser)
```
**Status:** ✅ ❌

---

## Test 3: Profile Batch Parallelization (3 min)

### Step 1: Create Test User with Multiple Profiles

**Option A: If you have an admin panel:**
1. Create a test user
2. Manually create 5-10 profiles for that user

**Option B: Direct database:**
```javascript
// Convex dashboard console
// Create 5 profiles for a test user
```

### Step 2: Complete Onboarding
1. Login as test user
2. Go to `/onboarding`
3. Select B2C or B2B
4. Click "Turpināt"

### Step 3: Check Console Logs
```javascript
// Look for batch operation log:
[PERF] [setAccountType] query profiles: 5ms
[PERF] [setAccountType] patch profiles (5 items): 40ms (8.00ms/item)
[PERF] [setAccountType] full operation: 50ms
```

**Expected:**
- Average per-item patch: **<10ms** ✅ (was 20-30ms before)
- Total batch time: **<100ms** ✅ (was 150-300ms before)

**Status:** ✅ ❌

---

## Test 4: Webhook Race Condition Fixed (3 min)

### Step 1: Check Webhook Code
```bash
# Terminal
grep -A 5 "synchronous:" app/api/clerk/post-login/route.ts
# Expected: Should see `await convex.mutation(...)`
```
**Status:** ✅ ❌

### Step 2: Sign In Again and Monitor Timeline
1. Open DevTools → Console
2. Filter for: `[WEBHOOK]`
3. Click "Sign In"
4. Complete OAuth

### Step 3: Verify No "Syncing" Spinner
✅ Did you see loading spinner? **NO** (good!)
❌ Did you see "Sinhronizējam profilu..." spinner? **YES** (bad - race condition still exists)

**Expected:**
- Status goes: "not_logged_in" → "incomplete" (direct, no syncing)
- Webhook log shows: `[WEBHOOK] ✅ User sync completed in XXms`
- Latency: **<150ms**

**Status:** ✅ ❌

---

## Test 5: Complete Onboarding Flow (3 min)

### Step 1: Fresh Login → Complete Onboarding

**Timeline:**
```
T=0s:    Click Sign In
T=2-5s:  Complete OAuth (external)
T=5-6s:  Redirects to /onboarding (no spinner!)
T=6-8s:  Onboarding cards visible (instant, not loading)
T=8-10s: User clicks B2C/B2B button
T=10-12s: User clicks "Turpināt"
T=12-13s: Redirects to /dashboard (loaded!)
```

### Step 2: Monitor Browser Logs
```javascript
// Browser Console - should see:
[WEBHOOK] ✅ User sync completed in 85ms
[PERF] [ensureCurrentUser] full operation: 18ms
[PERF] [setAccountType] full operation: 45ms
```

### Step 3: Verify Flow (Check All)
- ✅ No spinner or <100ms spinner
- ✅ Onboarding cards load instantly
- ✅ Selecting option is responsive
- ✅ Dashboard loads after clicking Turpināt
- ✅ No errors in console
- ✅ All [PERF] logs <50ms

**Overall Status:** ✅ ❌

---

## Test 6: Load Test (2 min)

### Step 1: Multiple Concurrent Signups
Use your browser's Network tab or K6:

```bash
# Quick browser test - open 5 tabs simultaneously
# Sign up in each tab at same time
# Monitor Convex logs for conflicts
```

### Step 2: Check Convex Dashboard
1. Go to **Convex Dashboard** → **Logs**
2. Filter by `[WEBHOOK]`
3. Look for success rate

**Expected:**
- ✅ All webhooks succeed
- ✅ No "OCC conflict" errors
- ✅ Average latency <100ms
- ✅ P95 latency <150ms
- ✅ Success rate >99%

**Status:** ✅ ❌

---

## Test 7: Regression - Nothing Broke (1 min)

### Critical User Flows Still Work?
- [ ] ✅ User can sign in normally
- [ ] ✅ User can complete onboarding
- [ ] ✅ User redirects to dashboard
- [ ] ✅ Profile data saves correctly
- [ ] ✅ No console errors

### Database Data Integrity?
- [ ] ✅ Users table has correct data
- [ ] ✅ All user profiles updated with accountType
- [ ] ✅ onboardingComplete = true
- [ ] ✅ Clerk metadata synced

**Status:** ✅ ❌

---

## Final Score Card

```
Test 1 - Performance Logging:       [_]
Test 2 - Database Optimization:     [_]
Test 3 - Batch Parallelization:     [_]
Test 4 - Webhook Race Condition:    [_]
Test 5 - Complete Flow:             [_]
Test 6 - Load Test:                 [_]
Test 7 - Regression:                [_]
────────────────────────────────────────
TOTAL:                              [_]/7
```

**Passing Score:** 7/7 ✅ Ready for Production!
**Failing:** Any ❌ - Review logs and troubleshoot before deploying

---

## Quick Troubleshooting

### ❌ Still seeing high latency (>30ms)
```bash
# Check if .first() is being used
grep "\.collect()" convex/users.ts | grep ensureCurrentUser
# If found: Replace with .first()
```

### ❌ Syncing spinner still appears
```bash
# Check webhook is awaiting mutation
grep -B2 -A2 "convex.mutation" app/api/clerk/post-login/route.ts
# Should see: `await convex.mutation(...)`
```

### ❌ Profile updates slow for 10+ profiles
```bash
# Check Promise.all() is used
grep "Promise.all" convex/onboarding.ts
# Should be there, wrapping patch operations
```

### ❌ Logs show no [PERF] entries
```bash
# Check imports exist
grep "import.*measure" convex/users.ts
# If missing: Add import { measure, measureBatch } from "./utils";
```

---

## Console Commands to Debug

Paste these into your browser console while testing:

```javascript
// Check all PERF logs since page load
console.log(
  'PERF Logs:',
  Array.from(performance.getEntriesByType('measure'))
    .filter(e => e.name.includes('PERF'))
);

// Measure your custom timing
performance.mark('onboarding-start');
// ... do something ...
performance.mark('onboarding-end');
performance.measure('onboarding', 'onboarding-start', 'onboarding-end');
console.log(performance.getEntriesByName('onboarding')[0].duration);

// Check all network requests timing
performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd
```

---

## Acceptance Criteria (Final)

| Criteria | Target | Status |
|----------|--------|--------|
| ensureCurrentUser latency | <30ms | ✅ ❌ |
| Profile batch latency (10 items) | <100ms | ✅ ❌ |
| Webhook latency | <150ms | ✅ ❌ |
| "Syncing" spinner | Never visible | ✅ ❌ |
| Onboarding completion time | <500ms | ✅ ❌ |
| Load test success rate | >99% | ✅ ❌ |
| Zero regressions | All flows work | ✅ ❌ |

**PASS:** All ✅
**FAIL:** Any ❌ - Do not deploy yet

---

## Deployment Checklist

Only proceed if all tests pass ✅

```bash
# 1. Commit changes
git add -A
git commit -m "Optimize onboarding: 80% faster, fix race condition"

# 2. Build
npm run build

# 3. Deploy
npm run deploy

# 4. Monitor (first hour)
# - Watch Convex Logs for errors
# - Monitor webhook latency
# - Track user signups
# - Check error rate

# 5. If all good after 1 hour
# - Deploy to more users
# - Continue monitoring

# 6. If issues found
# - git revert HEAD
# - npm run deploy
# - Investigate in logs
```

---

## Support Resources

- 📖 Full docs: `TESTING_MONITORING_GUIDE.md`
- 🔍 Detailed flow: `ONBOARDING_FLOW_NUMBERED.md`
- ⚙️ Audit details: `ONBOARDING_PERFORMANCE_AUDIT.md`
- ✅ Implementation: `IMPLEMENTATION_COMPLETE.md`

---

## Time Estimate

| Phase | Time | Status |
|-------|------|--------|
| Run this checklist | 15 min | ⏱️ |
| Fix any issues | 15-30 min | ⏱️ |
| Deploy | 5 min | ⏱️ |
| Monitor (1 hour) | 60 min | ⏱️ |
| **Total** | **~2 hours** | |

Good luck! 🚀 You've got this!

