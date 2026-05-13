# Post-Login Webhook Setup Guide

## Overview

This document describes the new post-login webhook endpoint that synchronizes user data from Clerk to Convex immediately after login, eliminating the "Cold Start" race condition.

## Problem Solved

Previously, when a user logged in, there was a race condition between:
1. Clerk creating the user session
2. Convex webhook processing the `user.created` event

This could result in:
- Users seeing a "syncing" spinner indefinitely
- Race conditions where the user record didn't exist yet
- Inconsistent user data between Clerk and Convex

## Solution

The new `/api/clerk/post-login` endpoint:
- Runs immediately after successful login
- Verifies webhook signatures using Svix
- Calls `ensureCurrentUser` mutation to sync user data
- Returns latency metrics for monitoring
- Eliminates the "syncing" state in `getOnboardingStatus`

## Architecture

```
User Login → Clerk Session Created → Post-Login Webhook → Convex ensureCurrentUser → User Record Created → Onboarding Guard Shows Page
```

## Configuration

### 1. Add Post-Login Webhook to Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** → **Add endpoint**
3. Configure the webhook:
   - **URL**: `https://your-domain.com/api/clerk/post-login`
   - **Events**: Select `user.created` and `user.updated`
   - **Secret**: Use your existing `CLERK_WEBHOOK_SECRET`
4. Save the webhook

### 2. Environment Variables

Ensure these environment variables are set:

```bash
# Clerk configuration
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Convex configuration
CONVEX_URL=your_convex_url
```

## Implementation Details

### Webhook Handler

The endpoint (`app/api/clerk/post-login/route.ts`):

1. **Signature Verification**: Uses Svix to verify webhook signatures
2. **Event Handling**: Processes `user.created` and `user.updated` events
3. **Data Sync**: Calls `ensureCurrentUser` mutation with:
   - Email (from Clerk user object)
   - Name (from Clerk user object)
   - Avatar URL (from Clerk user object)
4. **Response**: Returns success status and latency metrics

### User Synchronization

The `ensureCurrentUser` mutation (`convex/users.ts`):

1. **Lookup by Clerk ID**: Finds existing user record
2. **Deduplication**: Merges duplicate records by email
3. **Data Merging**: Combines data from multiple sources
4. **Profile Sync**: Creates/updates user profile
5. **Metadata Sync**: Updates Clerk public metadata (non-blocking)

### Onboarding Guard

The `OnboardingGuard` component (`components/OnboardingGuard.tsx`):

1. **Query Status**: Calls `getOnboardingStatus` query
2. **Optimistic Redirect**: Shows loading state during sync
3. **Redirect Logic**:
   - If `syncing`: Shows loading spinner
   - If `incomplete`: Shows onboarding page
   - If `complete`: Redirects to dashboard
   - If `not_logged_in`: Redirects to sign-in

## Performance

### Latency Metrics

The endpoint returns latency metrics in milliseconds:

```json
{
  "success": true,
  "latency": 45
}
```

### Optimization

- **Non-blocking**: Metadata sync to Clerk is non-blocking
- **Fast Lookup**: Uses Clerk ID index for O(1) lookups
- **Minimal Data**: Only syncs essential user fields
- **Error Handling**: Graceful degradation on failures

## Monitoring

### Log Messages

The system logs important events:

```
[Post-Login] Syncing user clerk_abc123 (user.created)
[Post-Login] User sync completed in 45ms for user clerk_abc123
[getOnboardingStatus] User not found, showing onboarding page
[Onboarding Guard] Onboarding complete, redirecting to dashboard
```

### Error Handling

Common errors and their meanings:

- **"Missing svix headers"**: Webhook not properly configured
- **"Invalid signature"**: Webhook secret mismatch
- **"Missing user ID"**: Clerk event data incomplete
- **"Missing email"**: User has no email address

## Testing

### Manual Testing

1. **Test User Creation**:
   ```bash
   curl -X POST https://your-domain.com/api/clerk/post-login \
     -H "svix-id: test-id" \
     -H "svix-timestamp: test-timestamp" \
     -H "svix-signature: test-signature" \
     -d '{"type":"user.created","data":{"id":"clerk_test123","email_addresses":[{"email_address":"test@example.com"}],"first_name":"Test","last_name":"User","image_url":"https://example.com/avatar.jpg"}}'
   ```

2. **Test User Update**:
   ```bash
   curl -X POST https://your-domain.com/api/clerk/post-login \
     -H "svix-id: test-id" \
     -H "svix-timestamp: test-timestamp" \
     -H "svix-signature: test-signature" \
     -d '{"type":"user.updated","data":{"id":"clerk_test123","email_addresses":[{"email_address":"test@example.com"}],"first_name":"Updated","last_name":"User","image_url":"https://example.com/avatar.jpg"}}'
   ```

### Integration Testing

1. Log in as a new user
2. Verify user is created in Convex immediately
3. Check onboarding status shows "incomplete"
4. Complete onboarding
5. Verify redirect to dashboard

## Troubleshooting

### Issue: User not created after login

**Possible Causes**:
- Webhook not configured in Clerk Dashboard
- Webhook URL incorrect
- Webhook secret mismatch
- Network connectivity issues

**Solutions**:
1. Verify webhook is active in Clerk Dashboard
2. Check webhook logs for errors
3. Verify `CLERK_WEBHOOK_SECRET` is correct
4. Check server logs for signature verification failures

### Issue: "syncing" spinner persists

**Possible Causes**:
- `getOnboardingStatus` query timing out
- Database connection issues
- Race condition still occurring

**Solutions**:
1. Check server logs for errors
2. Verify database connectivity
3. Check if user record exists in Convex
4. Review `getOnboardingStatus` implementation

### Issue: TypeScript errors

**Possible Causes**:
- Import paths incorrect
- Type definitions missing

**Solutions**:
1. Run `npx convex dev` to regenerate types
2. Verify import paths match project structure
3. Check for typos in import statements

## Migration from Old Webhook

If you have an existing `/api/webhooks/clerk` endpoint:

1. **Keep both webhooks**: The old webhook can remain for backward compatibility
2. **New behavior**: Post-login webhook runs first, creating the user record
3. **Old webhook**: Will still process events but user already exists
4. **Migration**: Gradually deprecate old webhook after testing

## Security Considerations

1. **Signature Verification**: All webhooks are verified using Svix
2. **Secret Management**: Never commit webhook secrets to version control
3. **Rate Limiting**: Clerk automatically rate limits webhooks
4. **Data Validation**: All incoming data is validated before processing
5. **Error Handling**: Errors are logged but don't expose sensitive data

## Future Enhancements

Potential improvements:

1. **Batch Processing**: Process multiple events in a single request
2. **Retry Logic**: Automatic retry for failed syncs
3. **Metrics Dashboard**: Real-time monitoring of sync performance
4. **Event Queue**: Async processing for large-scale deployments
5. **Multi-tenancy**: Support for organization-based user management

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Review Clerk Dashboard webhook logs
3. Check Convex dashboard for user records
4. Consult the [Clerk Documentation](https://clerk.com/docs)
5. Review [Convex Documentation](https://convex.dev)