# Onboarding Flow - Testing & Monitoring Guide

## Quick Start: How to Test All Improvements

This guide provides step-by-step instructions to verify that all performance optimizations and fixes have been successfully implemented.

---

## Phase 1: Database Query Optimization Testing

### 1.1 Check Performance Logs in Convex Dashboard

**Goal:** Verify that `ensureCurrentUser` queries are optimized and using `.first()` instead of `.collect()`

**Steps:**
1. Open [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Go to **Logs** → **Functions**
4. Filter by `ensureCurrentUser`
5. Look for `[PERF]` log entries

**Expected Output:**
```
[PERF] [ensureCurrentUser] clerkId lookup: 8ms
[PERF] [ensureCurrentUser] email sync: 0ms
[PERF] [ensureCurrentUser] full operation: 12ms
```

**Success Criteria:**
- ✅ `clerkId lookup` is **<15ms** (was 20-40ms before)
- ✅ Email sync is **<10ms** (was 5-10ms, now optimized)
- ✅ Full operation is **<30ms** (was 40-80ms before)

### 1.2 Test in Browser DevTools

**Steps:**
1. Open your app in browser
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Filter for `[PERF]` logs
5. Perform a login action

**Look for:**
```
[PERF] [ensureCurrentUser] clerkId lookup: 10ms
[PERF] [ensureCurrentUser] full operation: 15ms
```

---

## Phase 2: Profile Batch Update Parallelization Testing

### 2.1 Monitor Profile Update Performance

**Goal:** Verify that profile updates now run in parallel instead of sequentially

**Steps:**

1. **Create test user with multiple profiles:**
   - Login to your app
   - Create 5-10 test profiles for that user

2. **Trigger onboarding completion:**
   - Navigate to `/onboarding`
   - Select account type (B2C or B2B)
   - Click "Turpināt"

3. **Check Console Logs:**
   - Open DevTools → Console
   - Look for:
   ```
   [PERF] [setAccountType] query profiles: 5ms
   [PERF] [setAccountType] patch profiles (10 items): 35ms (3.50ms/item)
   [PERF] [setAccountType] full operation: 45ms
   ```

**Success Criteria:**
- ✅ Query time: **<20ms**
- ✅ Average patch time per item: **<5ms** (was 20-30ms/item before)
- ✅ Total batch operation: **<100ms** (was 200-300ms before)
- ✅ Log shows "X items" processed in parallel

### 2.2 Load Testing with Realistic Profile Counts

Test with different profile counts:

| Profile Count | Before (Sequential) | After (Parallel) | Improvement |
|---------------|-------------------|-----------------|------------|
| 1 profile | 30ms | 30ms | - |
| 5 profiles | 150ms | 40ms | 73% faster |
| 10 profiles | 300ms | 50ms | 83% faster |
| 20 profiles | 600ms | 80ms | 87% faster |

---

## Phase 3: Webhook Race Condition Testing

### 3.1 Verify Synchronous Webhook Processing

**Goal:** Confirm that webhook completes before browser queries, eliminating "syncing" spinner

**Steps:**

1. **Enable detailed webhook logging:**
   - Open DevTools → Network tab
   - Clear all requests
   - Open Console tab with filter: `[WEBHOOK]`

2. **Perform Google SSO login:**
   - Click "Sign In"
   - Choose Google
   - Authorize

3. **Observe console output:**

**Expected Timeline:**
```
T=0ms     [WEBHOOK] Starting sync for user user_abc123
T=50ms    [Convex] mutation called: ensureCurrentUser
T=100ms   [PERF] [ensureCurrentUser] full operation: 45ms
T=105ms   [WEBHOOK] ✅ User sync completed in 105ms for user user_abc123. Onboarding: incomplete
```

**Success Criteria:**
- ✅ No "Sinhronizējam profilu..." spinner appears (or appears for <100ms)
- ✅ Webhook completes BEFORE browser navigates
- ✅ Status changes directly from "not_logged_in" → "incomplete" (no "syncing" state)
- ✅ `[WEBHOOK]` logs show success with latency <150ms

### 3.2 Monitor Webhook Latency in Production

**Steps:**

1. Go to **Convex Dashboard** → **Logs** → **Server Functions**
2. Filter by `POST /api/clerk/post-login`
3. Check latency column
4. Add performance trend chart

**Expected Performance:**
- Average latency: **50-100ms**
- P99 latency: **<200ms**
- Success rate: **>99.5%**

---

## Phase 4: End-to-End Onboarding Flow Testing

### 4.1 Complete User Journey Test

**Scenario: New user signs up and completes onboarding**

**Steps:**

1. **Open DevTools → Console & Network tabs**
2. **Clear logs and network history**
3. **Start recording performance metrics:**
   ```javascript
   // Paste into console to track timing
   window.onboardingStartTime = performance.now();
   console.log('[TEST] Onboarding flow started');
   ```

4. **Click "Sign In" button**
5. **Complete Google OAuth**
6. **Wait for redirect to /onboarding**
7. **Check console for `[PERF]` logs** - should complete <150ms total
8. **Select B2C or B2B account type**
9. **Click "Turpināt"**
10. **Wait for redirect to /dashboard**
11. **Check final time:**
    ```javascript
    console.log(`[TEST] Total onboarding time: ${performance.now() - window.onboardingStartTime}ms`);
    ```

**Expected Flow Timeline:**

```
T=0ms     User clicks "Sign In"
T=100ms   OAuth dialog opens
T=500ms   User completes OAuth and grants permission
T=700ms   Browser redirects to /onboarding
T=750ms   [Webhook] starts syncing user
T=800ms   [PERF] Webhook sync completed (50ms)
T=850ms   Onboarding page displays cards (no spinner)
T=1200ms  User thinks and selects B2C
T=1250ms  User clicks "Turpināt"
T=1300ms  setAccountType mutation starts
T=1350ms  [PERF] Profiles patched in parallel (50ms)
T=1400ms  User auto-redirects to /dashboard
T=1450ms  Dashboard fully rendered
TOTAL:    ~1.5 seconds (mostly user action time)
```

### 4.2 Verify No "Syncing" Spinner

**Goal:** Confirm that the onboarding flow never shows the "Sinhronizējam profilu..." spinner

**Steps:**

1. Open DevTools → Console
2. Filter for "syncing"
3. Perform 5 complete onboarding flows
4. Check that status never returns `{ status: "syncing" }`

**What to look for:**
```javascript
// ❌ BAD - status should NOT go through syncing
{ status: "not_logged_in" } 
  → { status: "syncing" }       // ← We want to eliminate this
  → { status: "incomplete" }
  → { status: "complete", accountType: "b2c" }

// ✅ GOOD - status should jump directly to incomplete
{ status: "not_logged_in" }
  → { status: "incomplete" }    // ← Direct, no syncing state
  → { status: "complete", accountType: "b2c" }
```

---

## Phase 5: Performance Monitoring & Metrics

### 5.1 Set Up Convex Dashboard Monitoring

**Create Custom Charts:**

1. Go to **Convex Dashboard** → **Logs** → **Charts**
2. Create chart for `ensureCurrentUser` latency:
   - Filter: `"[PERF]" AND "[ensureCurrentUser]"`
   - Metric: `Average Latency`
   - Target: `<30ms`

3. Create chart for webhook latency:
   - Filter: `"[WEBHOOK]"`
   - Metric: `Average Latency`
   - Target: `<100ms`

4. Create chart for profile batch operations:
   - Filter: `"[PERF]" AND "[setAccountType]" AND "patch profiles"`
   - Metric: `Average Latency`
   - Target: `<100ms`

### 5.2 Browser Performance Monitoring

**Using Web Vitals:**

1. Install Web Vitals library:
   ```bash
   npm install web-vitals
   ```

2. Add monitoring to your layout:
   ```typescript
   // app/layout.tsx
   import { onCLS, onFID, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

   onCLS(metric => console.log('[WEB-VITAL] CLS:', metric.value));
   onFID(metric => console.log('[WEB-VITAL] FID:', metric.value));
   onFCP(metric => console.log('[WEB-VITAL] FCP:', metric.value));
   onINP(metric => console.log('[WEB-VITAL] INP:', metric.value));
   onLCP(metric => console.log('[WEB-VITAL] LCP:', metric.value));
   onTTFB(metric => console.log('[WEB-VITAL] TTFB:', metric.value));
   ```

3. Monitor during onboarding:
   - Expected FCP (First Contentful Paint): **<1s**
   - Expected LCP (Largest Contentful Paint): **<2.5s**
   - Expected INP (Interaction to Next Paint): **<200ms**

---

## Phase 6: Load Testing

### 6.1 Simulate Multiple Concurrent Signups

**Goal:** Test webhook and database under load

**Using K6 (load testing):**

```javascript
// load-test-signup.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
};

export default function () {
  const res = http.post(
    'https://your-app.com/api/clerk/post-login',
    JSON.stringify({
      type: 'user.created',
      data: {
        id: `user_test_${__VU}_${__ITER}`,
        email_addresses: [{ email_address: `test${__VU}@example.com` }],
        first_name: 'Test',
        last_name: 'User',
      },
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'webhook latency < 200ms': (r) => r.timings.duration < 200,
  });
}
```

**Run test:**
```bash
k6 run load-test-signup.js
```

**Expected results:**
- ✅ Success rate: **>99%**
- ✅ Average latency: **<100ms**
- ✅ P95 latency: **<150ms**
- ✅ P99 latency: **<200ms**

### 6.2 Database Contention Testing

**Goal:** Verify no OCC (Optimistic Concurrency Control) conflicts

**Steps:**

1. In Convex Dashboard, go to **Insights**
2. Look for "OCC Conflicts" or "Write Conflicts"
3. During load test, verify:
   - ✅ No spikes in OCC conflicts
   - ✅ All mutations succeed on first attempt
   - ✅ Zero retries due to conflicts

---

## Phase 7: Regression Testing Checklist

Before deploying to production, verify:

- [ ] **Queries are optimized**
  - [ ] `ensureCurrentUser` latency: <30ms
  - [ ] Profile queries use `.first()` not `.collect()`
  - [ ] No duplicate database queries

- [ ] **Batch operations work correctly**
  - [ ] Profile updates complete <100ms for 10+ profiles
  - [ ] All profiles for a user are updated (not just first one)
  - [ ] No missed updates in batch operations

- [ ] **Webhook race condition is fixed**
  - [ ] No "syncing" spinner on first load
  - [ ] Webhook completes before browser queries
  - [ ] Status transitions directly: not_logged_in → incomplete
  - [ ] Webhook latency consistently <100ms

- [ ] **UI/UX improvements applied**
  - [ ] Page title shows "Mana informācija"
  - [ ] Helper text shows "Pārvaldi savus datus un savu redzamību."
  - [ ] Avatar upload helper text shows "Augšupielādē attēlu (maks. 5 MB)"
  - [ ] Tab labels are updated to Latvian

- [ ] **Performance targets met**
  - [ ] Total onboarding flow: <500ms (excluding user think time)
  - [ ] No indefinite loading states
  - [ ] Browser logs show all `[PERF]` operations <150ms

- [ ] **Error handling works**
  - [ ] Webhook returns 200 even if mutation fails
  - [ ] Frontend gracefully handles network errors
  - [ ] User can retry if onboarding fails

---

## Common Issues & Troubleshooting

### Issue: Still seeing "Sinhronizējam profilu..." spinner

**Possible causes:**
- Webhook is still using `.collect()` or multiple queries
- Webhook is not awaiting mutation completion
- Browser is querying before webhook finishes

**Fix:**
1. Check `app/api/clerk/post-login/route.ts` - verify `await convex.mutation(...)`
2. Check Convex logs - verify webhook latency
3. Check browser console - verify status transitions

### Issue: Profile updates taking >100ms

**Possible causes:**
- Still using sequential `for...of` loop instead of `Promise.all()`
- Profile query using `.collect()` with many profiles
- Database indexes not being used

**Fix:**
1. Check `convex/onboarding.ts` - verify `measureBatch()` is used
2. Check `convex/schema.ts` - verify `by_clerk_id` index exists on profiles
3. Run load test to measure actual latency

### Issue: OCC conflicts in production

**Possible causes:**
- Multiple mutations updating same user simultaneously
- Non-idempotent operations

**Fix:**
1. Add retry logic in webhook handler
2. Use database locks or atomic operations
3. Monitor OCC conflict rate in Convex dashboard

---

## Metrics to Track Long-Term

### Daily Metrics

Track these in your analytics dashboard:

| Metric | Target | Action If > Target |
|--------|--------|------------------|
| Onboarding completion rate | >85% | Investigate UX issues |
| Webhook success rate | >99% | Check error logs |
| Average webhook latency | <100ms | Optimize database queries |
| "Syncing" spinner duration | 0ms | Fix race condition |
| Page load time (TTI) | <2s | Optimize assets |

### Weekly Metrics

- Count of OCC conflicts during onboarding
- P95/P99 latency for critical operations
- User feedback on onboarding speed
- Error rate by operation

### Monthly Metrics

- Trend in onboarding completion time
- Database query performance
- Infrastructure cost per signup
- User satisfaction score

---

## Testing Script Template

Save this to `test-onboarding.js` and run to automated test:

```javascript
// test-onboarding.js - Automated Testing Script
const testMetrics = {
  webhookLatency: [],
  queryLatency: [],
  totalTime: [],
};

async function testOnboardingFlow() {
  const startTime = performance.now();
  
  console.log('[TEST] Starting onboarding flow test...');
  
  // Measure webhook latency
  const webhookStart = performance.now();
  await fetch('/api/clerk/post-login', {
    method: 'POST',
    body: JSON.stringify({ /* test data */ }),
  });
  testMetrics.webhookLatency.push(performance.now() - webhookStart);
  
  // Measure query latency
  const queryStart = performance.now();
  await fetch('/api/onboarding-status');
  testMetrics.queryLatency.push(performance.now() - queryStart);
  
  const totalTime = performance.now() - startTime;
  testMetrics.totalTime.push(totalTime);
  
  console.log(`
[TEST] Results:
  Webhook latency: ${testMetrics.webhookLatency[0]}ms
  Query latency: ${testMetrics.queryLatency[0]}ms
  Total time: ${totalTime}ms
  ✅ PASS if all < 150ms
  `);
}

// Run 10 times
for (let i = 0; i < 10; i++) {
  await testOnboardingFlow();
  await new Promise(r => setTimeout(r, 1000)); // Wait 1s between tests
}

// Print summary
console.log('[TEST] Summary:', {
  avgWebhookLatency: (testMetrics.webhookLatency.reduce((a,b) => a+b) / testMetrics.webhookLatency.length).toFixed(2) + 'ms',
  avgQueryLatency: (testMetrics.queryLatency.reduce((a,b) => a+b) / testMetrics.queryLatency.length).toFixed(2) + 'ms',
  avgTotalTime: (testMetrics.totalTime.reduce((a,b) => a+b) / testMetrics.totalTime.length).toFixed(2) + 'ms',
});
```

---

## Summary: Quick Testing Checklist

Quick 5-minute test before deployment:

- [ ] Login and check console for `[PERF]` logs (<30ms each)
- [ ] Complete onboarding flow - no spinner appears
- [ ] Check Convex Dashboard logs - webhook latency <100ms
- [ ] Test with 10 profiles - batch operation completes <100ms
- [ ] Load test with 10 concurrent users - no errors
- [ ] Verify no OCC conflicts in production dashboard

**Expected Result:** ✅ All green, onboarding flow <500ms total

