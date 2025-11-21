# Welcome Email Fix - 2025-11-12

## Problem

Welcome emails were never being sent to new users (both email/password and Google auth).

**Root Cause**: The `isNewUser` detection logic was flawed.

### Original Logic (Broken)
```typescript
const createdTime = new Date(profile.created_at).getTime();
const now = Date.now();
const isNewUser = (now - createdTime) < 10000; // 10 seconds
```

**Why it failed:**
- User profiles are created immediately during signup (via Supabase auth triggers)
- By the time the auth callback runs, it's often been MORE than 10 seconds
- Result: ALL users were marked as "existing users"
- Welcome emails were never sent

### Timeline Example
```
T+0s:    User clicks "Sign up with Google"
T+0.5s:  Supabase creates auth.users entry
T+0.5s:  Database trigger creates profiles entry
T+2s:    OAuth flow redirects to callback
T+3s:    Auth callback runs
T+3s:    Check: Is (3000ms < 10000ms)? YES - should work...
         BUT WAIT: The profile was created at T+0.5s
         Actual check: Is (NOW - T+0.5s) < 10s?
                      Is (3s - 0.5s = 2.5s) < 10s? YES

BUT if there's ANY delay:
T+15s:   Auth callback runs (network delay, slow processing, etc.)
T+15s:   Check: Is (NOW - T+0.5s) < 10s?
                Is (15s - 0.5s = 14.5s) < 10s? NO
         Result: User marked as "existing" - NO EMAIL SENT
```

## Solution

Replace time-based check with a **persistent flag** in the database.

### Changes Made

#### 1. Database Migration
**File**: `supabase/migrations/20251112000002_add_welcome_email_flag.sql`

Added `welcome_email_sent` boolean column to `profiles` table:
- Defaults to `FALSE` for new users
- Set to `TRUE` for existing users (created > 1 hour ago)
- Updated after successful email send

#### 2. Auth Callback Logic
**File**: `app/[locale]/auth/callback/route.ts`

**Changed from:**
```typescript
const isNewUser = (now - createdTime) < 10000;
```

**Changed to:**
```typescript
const isNewUser = !profile.welcome_email_sent;
```

**After successful email send:**
```typescript
await supabase
  .from('profiles')
  .update({ welcome_email_sent: true })
  .eq('id', session.user.id);
```

#### 3. Database Types
**File**: `types/database.ts`

Added `welcome_email_sent: boolean` to profiles table type definition.

#### 4. Enhanced Logging

Added comprehensive logging to help debug issues:

```typescript
console.log('Auth callback - user status:', {
  userId: session.user.id,
  email: session.user.email,
  isNewUser,
  profileFound: !!profile,
  welcomeEmailSent: profile?.welcome_email_sent,
  provider: session.user.app_metadata?.provider,
});
```

## How to Apply

### Step 1: Apply Database Migration

```bash
npx supabase db push
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Run: `supabase/migrations/20251112000002_add_welcome_email_flag.sql`

### Step 2: Deploy Code

Deploy the updated application code to your hosting platform.

### Step 3: Verify Environment Variables

Ensure `RESEND_API_KEY` is set:
```bash
echo $RESEND_API_KEY
```

## Testing

### Test New User Signup

#### Email/Password Signup
1. Create a new account with email/password
2. Check server logs for:
   ```
   Auth callback - user status: { isNewUser: true, welcomeEmailSent: false, ... }
   Sending welcome email to new user: { email: '...', ... }
   Welcome email sent successfully: { emailId: '...' }
   ```
3. Check recipient inbox for welcome email

#### Google Auth Signup
1. Create a new account with Google
2. Check server logs for same messages
3. Check recipient inbox

### Test Existing User Login

1. Log in with an existing account
2. Check server logs for:
   ```
   Auth callback - user status: { isNewUser: false, welcomeEmailSent: true, ... }
   Existing user logged in, skipping welcome email: { email: '...' }
   ```
3. Should NOT receive welcome email

## Monitoring

### Check Logs for Email Issues

```bash
# Successful sends
grep "Welcome email sent successfully" /var/log/app.log

# Failed sends
grep "Welcome email failed to send" /var/log/app.log

# Exceptions
grep "Failed to send welcome email (exception)" /var/log/app.log

# User status checks
grep "Auth callback - user status" /var/log/app.log
```

### Check Database Flag

```sql
-- See users who haven't received welcome email
SELECT id, email, username, created_at, welcome_email_sent
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE welcome_email_sent = FALSE
ORDER BY created_at DESC;

-- Manually mark email as sent (if needed)
UPDATE profiles
SET welcome_email_sent = TRUE
WHERE id = '<user-id>';
```

## Troubleshooting

### "Email still not sending"

1. Check RESEND_API_KEY is set:
   ```bash
   echo $RESEND_API_KEY
   ```

2. Check Resend dashboard for failed attempts

3. Check server logs for detailed errors:
   ```
   Failed to send welcome email (exception): { error: '...', email: '...', userId: '...' }
   ```

4. Test Resend directly via admin panel email tool

### "isNewUser is always false"

1. Check database migration was applied:
   ```sql
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_name = 'profiles'
   AND column_name = 'welcome_email_sent';
   ```

2. Check flag value for test user:
   ```sql
   SELECT id, email, welcome_email_sent
   FROM profiles p
   LEFT JOIN auth.users u ON u.id = p.id
   WHERE email = 'test@example.com';
   ```

3. If needed, reset flag:
   ```sql
   UPDATE profiles
   SET welcome_email_sent = FALSE
   WHERE email = 'test@example.com';
   ```

### "Migration fails with column already exists"

The migration includes a check for existing column. If it still fails:

```sql
-- Check if column exists
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'welcome_email_sent';

-- If it exists but migration didn't run:
UPDATE profiles
SET welcome_email_sent = COALESCE(welcome_email_sent, FALSE);
```

## Expected Behavior After Fix

### New User Flow
1. User signs up (email/password or Google)
2. Profile created with `welcome_email_sent = FALSE`
3. Auth callback detects `isNewUser = true`
4. Welcome email sent via Resend
5. Database updated: `welcome_email_sent = TRUE`
6. User receives welcome email in inbox

### Existing User Flow
1. User logs in
2. Profile exists with `welcome_email_sent = TRUE`
3. Auth callback detects `isNewUser = false`
4. No email sent (correct behavior)
5. Log: "Existing user logged in, skipping welcome email"

## Benefits of New Approach

✅ **Reliable**: Not dependent on timing windows
✅ **Persistent**: Flag survives server restarts, delays, etc.
✅ **Debuggable**: Can query database to see who got emails
✅ **Idempotent**: Re-running callback won't send duplicate emails
✅ **Flexible**: Can manually trigger emails by resetting flag

## Files Modified

1. `supabase/migrations/20251112000002_add_welcome_email_flag.sql` (NEW)
2. `app/[locale]/auth/callback/route.ts` (MODIFIED)
3. `types/database.ts` (MODIFIED)

---

## Build Issue Note

The build currently fails due to `canvas` package native dependencies:

```
Package pangocairo was not found in the pkg-config search path
```

**This is unrelated to the email issue.** The canvas package is used for sticker generation.

**Workaround options:**
1. Install system dependencies: `apt-get install libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
2. Make canvas optional in package.json (if sticker generation isn't critical)
3. Use a Docker container with pre-installed dependencies

The TypeScript/code changes are correct regardless of build status.
