# Performance Monitoring Guide

## Overview

This guide explains how to monitor and verify the performance improvements to the auth flow, specifically targeting the elimination of the "Cold Start" race condition that caused 2-5s delays during Google SSO login.

## Performance Goals

- **Time to Interactive (TTI)**: < 500ms for new users
- **Zero indefinite loading**: No more "syncing" spinners
- **Webhook latency**: < 100ms for user sync operations
- **Database query time**: < 50ms for `getOnboardingStatus`

## Architecture

```
User Login (Google SSO)
    ↓
Clerk Session Created
    ↓
Post-Login Webhook (/api/clerk/post-login)
    ↓
Signature Verification (svix) - < 10ms
    ↓
ensureCurrentUser Mutation
    ↓
clerkId Lookup - < 20ms
    ↓
User Record Created/Updated - < 30ms
    ↓
Onboarding Guard Query
    ↓
Redirect to /onboarding or /dashboard
```

## Monitoring Setup

### 1. Server-Side Logging

All performance metrics are logged in the console. Look for these log patterns:

#### Webhook Handler Logs

```bash
[Post-Login] Syncing user clerk_abc123 (user.created)
[Post-Login] User sync completed in 45ms for user clerk_abc123
```

**Expected Metrics:**
- Signature verification: < 10ms
- User sync: < 50ms
- Total webhook processing: < 100ms

#### ensureCurrentUser Logs

```bash
[ensureCurrentUser] Starting sync for user clerk_abc123
[ensureCurrentUser] User found in 20ms for clerk_abc123
[ensureCurrentUser] Patching user clerk_abc123 in 15ms
[ensureCurrentUser] User sync completed in 35ms for clerk_abc123
```

**Expected Metrics:**
- Lookup time: < 20ms
- Patch time: < 20ms
- Total sync: < 50ms

#### getOnboardingStatus Logs

```bash
[getOnboardingStatus] User not found, showing onboarding page
```

**Expected Behavior:**
- Should rarely show "User not found" after post-login webhook is active
- If user not found, should immediately show onboarding page (no "syncing" spinner)

### 2. Client-Side Monitoring

#### OnboardingGuard Logs

```bash
[Onboarding Guard] Guard check: { status: "incomplete", isLoading: false, ... }
[Onboarding Guard] Onboarding incomplete, showing onboarding page
```

**Expected Behavior:**
- No "syncing" status
- Immediate redirect to onboarding page for new users
- Immediate redirect to dashboard for existing users

### 3. Convex Dashboard Monitoring

#### Query Performance

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to your project
3. Select "Queries" from the sidebar
4. Monitor `getOnboardingStatus` query performance

**Expected Metrics:**
- Query time: < 50ms
- Cache hit rate: > 95%

#### Database Performance

1. Go to the Convex Dashboard
2. Navigate to "Database" → "Users" table
3. Monitor query performance

**Expected Metrics:**
- Index lookup time: < 20ms
- No slow queries

## Performance Testing

### Manual Testing

#### Test 1: New User Login

1. Clear browser cookies and localStorage
2. Navigate to your application
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. **Measure Time to Interactive:**
   - Start timer when Google OAuth completes
   - Stop timer when onboarding page loads
   - **Expected: < 500ms**

**Expected Logs:**
```
[Post-Login] Syncing user clerk_abc123 (user.created)
[Post-Login] User sync completed in 45ms for user clerk_abc123
[getOnboardingStatus] User not found, showing onboarding page
[Onboarding Guard] Onboarding incomplete, showing onboarding page
```

#### Test 2: Existing User Login

1. Log in as an existing user
2. Log out
3. Log in again
4. **Measure Time to Interactive:**
   - Start timer when Google OAuth completes
   - Stop timer when dashboard loads
   - **Expected: < 500ms**

**Expected Logs:**
```
[Post-Login] Syncing user clerk_abc123 (user.updated)
[Post-Login] User sync completed in 35ms for user clerk_abc123
[getOnboardingStatus] User found, onboarding complete
[Onboarding Guard] Onboarding complete, redirecting to dashboard
```

#### Test 3: Webhook Latency

1. Check server logs during login
2. Look for `[Post-Login] User sync completed in Xms`
3. **Expected: X < 100ms**

### Automated Testing

#### Using curl

```bash
# Test webhook with valid signature
curl -X POST https://your-domain.com/api/clerk/post-login \
  -H "svix-id: test-id" \
  -H "svix-timestamp: test-timestamp" \
  -H "svix-signature: test-signature" \
  -d '{
    "type": "user.created",
    "data": {
      "id": "clerk_test123",
      "email_addresses": [{"email_address": "test@example.com"}],
      "first_name": "Test",
      "last_name": "User",
      "image_url": "https://example.com/avatar.jpg"
    }
  }'

# Expected response:
# {
#   "success": true,
#   "latency": 45
# }
```

#### Using Playwright

```typescript
import { test, expect } from '@playwright/test';

test('new user login should complete in < 500ms', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/');
  await page.click('text=Sign in with Google');
  await page.waitForURL(/\/onboarding/);
  
  const endTime = Date.now();
  const timeToInteractive = endTime - startTime;
  
  expect(timeToInteractive).toBeLessThan(500);
});
```

## Performance Metrics Dashboard

### Key Metrics to Track

1. **Webhook Success Rate**
   - Target: > 99%
   - Alert if < 95%

2. **Webhook Latency (p50, p95, p99)**
   - Target: p50 < 50ms, p95 < 100ms
   - Alert if p95 > 200ms

3. **User Sync Time**
   - Target: < 50ms
   - Alert if > 100ms

4. **Onboarding Status Query Time**
   - Target: < 50ms
   - Alert if > 100ms

5. **Time to Interactive (TTI)**
   - Target: < 500ms
   - Alert if > 1000ms

### Setting Up Alerts

#### Using Convex Analytics

1. Go to Convex Dashboard
2. Navigate to "Analytics"
3. Set up alerts for:
   - Query performance degradation
   - Error rate spikes
   - Latency thresholds

#### Using External Monitoring

- **Sentry**: Track webhook errors
- **Datadog**: Monitor server performance
- **New Relic**: Track application performance

## Troubleshooting

### Issue: Webhook Not Triggering

**Symptoms:**
- User not created in Convex after login
- "User not found" logs in `getOnboardingStatus`

**Diagnosis:**
1. Check Clerk Dashboard webhook logs
2. Verify webhook URL is correct
3. Check server logs for signature verification errors

**Solution:**
1. Ensure webhook is active in Clerk Dashboard
2. Verify `CLERK_WEBHOOK_SECRET` is set
3. Check server is running and accessible

### Issue: High Latency

**Symptoms:**
- Webhook takes > 200ms
- User sync takes > 100ms
- TTI > 1000ms

**Diagnosis:**
1. Check server CPU/memory usage
2. Review database query performance
3. Check network latency

**Solution:**
1. Optimize database queries
2. Add caching for frequently accessed data
3. Scale server resources

### Issue: "Syncing" Spinner Persists

**Symptoms:**
- OnboardingGuard shows "syncing" status
- User sees indefinite loading

**Diagnosis:**
1. Check if user record exists in Convex
2. Review `getOnboardingStatus` logs
3. Verify post-login webhook is working

**Solution:**
1. Check if user was created by webhook
2. Verify `getOnboardingStatus` is returning correct status
3. Ensure `OnboardingGuard` is using the correct query

## Performance Optimization Tips

### 1. Database Indexing

Ensure the following indexes are created:

```typescript
// In convex/schema.ts
{
  name: "by_clerk_id",
  fieldName: "clerkId",
}
```

### 2. Caching

- `getOnboardingStatus` is automatically cached by Convex
- Consider caching user data in client-side state
- Use `unstable_cache` for frequently accessed data

### 3. Non-Blocking Operations

- Metadata sync to Clerk is non-blocking
- Use `Promise.resolve()` for non-critical operations
- Avoid await in hot paths

### 4. Error Handling

- Log errors but don't fail the entire operation
- Implement retry logic for transient failures
- Use circuit breakers for external API calls

## Continuous Monitoring

### Daily Checks

1. Review server logs for performance metrics
2. Check Convex dashboard for query performance
3. Monitor error rates

### Weekly Reviews

1. Analyze performance trends
2. Identify optimization opportunities
3. Update performance baselines

### Monthly Audits

1. Conduct comprehensive performance testing
2. Review and optimize slow queries
3. Update monitoring thresholds

## Success Criteria

### Definition of Done

- [ ] Google SSO login redirects to `/onboarding` (new) or `/dashboard` (existing) in under 500ms
- [ ] Zero occurrence of "indefinite loading" in production logs
- [ ] `post-login` webhook latency metrics visible in Convex logs
- [ ] Webhook success rate > 99%
- [ ] Average webhook latency < 100ms
- [ ] Average user sync time < 50ms
- [ ] Average onboarding status query time < 50ms

## Additional Resources

- [Clerk Webhooks Documentation](https://clerk.com/docs/backend-requests/webhooks)
- [Convex Performance Guide](https://convex.dev/guides/performance)
- [Next.js Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)

## Support

For performance issues:
1. Check server logs for detailed error messages
2. Review Convex dashboard for query performance
3. Check Clerk Dashboard for webhook status
4. Consult the troubleshooting section above