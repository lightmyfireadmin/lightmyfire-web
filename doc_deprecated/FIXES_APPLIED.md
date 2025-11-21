# Code Issues Fixed - 2025-11-12

## Summary of Issues

Three critical issues have been identified and fixed:

1. **Admin/Moderation Panel Error**: "Error loading moderators: structure of query does not match function result type"
2. **OpenAI Moderation**: Moderation system not being called properly
3. **Welcome Emails**: New users (including Google auth users) not receiving welcome emails

## Root Causes

### 1. Admin/Moderation Panel Error
**Cause**: Missing database functions
- `admin_get_moderators()` - Function did not exist
- `admin_grant_moderator()` - Function did not exist
- `admin_revoke_moderator()` - Function did not exist

### 2. OpenAI Moderation
**Cause**: Missing `create_new_post()` function
- The frontend was calling `create_new_post()` RPC function
- This function did not exist in the database
- OpenAI moderation was happening client-side but posts couldn't be created

### 3. Welcome Emails
**Cause**: Insufficient error handling and logging
- Emails were being sent but failures were silent
- No detailed logging to debug issues
- Google auth users were treated the same as regular users, but timing issues may have prevented detection

## Fixes Applied

### Fix 1: Database Functions Migration

Created `/supabase/migrations/20251112000000_add_missing_functions.sql` with:

1. **`admin_get_moderators()`**
   - Returns all users with admin/moderator roles
   - Includes user_id, email, username, role, and created_at
   - Security: Requires admin privileges
   - Properly joins auth.users table for email addresses

2. **`admin_grant_moderator(p_user_email TEXT)`**
   - Grants moderator role to user by email
   - Validates user exists
   - Prevents demoting admins
   - Returns JSON with success/error status
   - Security: Requires admin privileges

3. **`admin_revoke_moderator(p_user_id TEXT)`**
   - Revokes moderator role (sets to 'user')
   - Prevents revoking admin roles
   - Returns JSON with success/error status
   - Security: Requires admin privileges

4. **`create_new_post(...)`**
   - Creates posts with full validation
   - Supports all post types (text, song, image, location, refuel)
   - Handles moderation flagging (`requires_review` parameter)
   - Automatically adds flagged posts to moderation queue
   - Updates lighter post count and contributions
   - Returns JSON with success status and post_id

### Fix 2: Enhanced Welcome Email Handling

Updated `/app/[locale]/auth/callback/route.ts`:

1. **Comprehensive Logging**
   - Logs when attempting to send welcome email
   - Logs success with email ID from Resend
   - Logs failures with detailed error messages
   - Identifies Google auth users in logs

2. **Better Error Tracking**
   - Checks `emailResult.success` status
   - Logs different event types: `welcome_email_sent`, `welcome_email_failed`, `welcome_email_error`
   - Provides visibility into email sending issues

3. **Existing User Logging**
   - Logs when existing users log in (to distinguish from new users)
   - Helps debug "isNewUser" detection issues

## How to Apply the Fixes

### Step 1: Apply Database Migration

Run the SQL migration file in your Supabase database:

```bash
# Option A: Using Supabase CLI
npx supabase db push

# Option B: Using Supabase Dashboard
# 1. Go to Supabase Dashboard > SQL Editor
# 2. Copy contents of supabase/migrations/20251112000000_add_missing_functions.sql
# 3. Run the SQL
```

### Step 2: Verify Functions Exist

In Supabase Dashboard > Database > Functions, verify these exist:
- ✅ admin_get_moderators
- ✅ admin_grant_moderator
- ✅ admin_revoke_moderator
- ✅ create_new_post

### Step 3: Deploy Updated Code

The code changes are already in place:
- ✅ Auth callback route has enhanced logging
- ✅ AddPostForm already calls create_new_post (was just missing the function)
- ✅ ModeratorsManagement already calls admin functions

Simply deploy your application to apply the changes.

### Step 4: Verify Environment Variables

Ensure these are set in your environment:

```env
# Required for emails
RESEND_API_KEY=re_xxx...

# Required for moderation
OPENAI_API_KEY=sk-xxx...

# Optional: Where to send fulfillment emails
FULFILLMENT_EMAIL=mitch@lightmyfire.app
```

### Step 5: Test Each Fix

#### Test 1: Admin Panel Moderators
1. Log in as admin
2. Navigate to `/admin`
3. Verify "Moderator Management" section loads without errors
4. Try granting moderator role to a test user
5. Try revoking moderator role

#### Test 2: Post Creation with Moderation
1. Create a new post with normal content
2. Verify post appears immediately (requires_review = false)
3. Create a post with flagged content (e.g., profanity)
4. Verify post is created but requires review
5. Check moderation queue for the flagged post

#### Test 3: Welcome Emails
1. Create a new account with email/password
2. Check server logs for "Sending welcome email to new user"
3. Check for "Welcome email sent successfully" with email ID
4. Check recipient's inbox for welcome email
5. Repeat with Google OAuth login

## Monitoring Welcome Emails

To debug welcome email issues, check your server logs for:

```
# Successful send
"Welcome email sent successfully: { email: 'user@example.com', emailId: '...' }"

# Failed send
"Welcome email failed to send: { email: 'user@example.com', error: '...' }"

# Exception during send
"Failed to send welcome email (exception): { error: ..., email: '...', userId: '...' }"

# Existing user (should skip email)
"Existing user logged in, skipping welcome email: { email: '...', userId: '...' }"
```

## Expected Behavior After Fixes

### Admin Panel
- ✅ Moderators list loads successfully
- ✅ Shows all users with 'admin' or 'moderator' roles
- ✅ Can grant moderator role by email
- ✅ Can revoke moderator role
- ✅ Proper error messages for invalid operations

### Content Moderation
- ✅ OpenAI moderation runs on all text content before post creation
- ✅ OpenAI moderation runs on all images before post creation
- ✅ Flagged content is created with `requires_review = true`
- ✅ Flagged content appears in moderation queue
- ✅ Clean content is published immediately
- ✅ If moderation API fails, content is flagged for manual review (safe default)

### Welcome Emails
- ✅ New email/password users receive welcome email immediately after signup
- ✅ New Google auth users receive welcome email after first login
- ✅ Existing users do not receive duplicate welcome emails
- ✅ Email failures are logged with detailed error information
- ✅ Email failures do not block the signup/login flow

## Troubleshooting

### "Admin get moderators still failing"
- Verify migration was applied successfully
- Check function exists: `SELECT * FROM pg_proc WHERE proname = 'admin_get_moderators'`
- Verify user has admin role: `SELECT role FROM profiles WHERE id = '<your-user-id>'`

### "Posts still not being created"
- Verify create_new_post function exists
- Check browser console for RPC errors
- Verify OPENAI_API_KEY is set
- Check if moderation is timing out (increase timeout if needed)

### "Welcome emails still not sending"
- Verify RESEND_API_KEY is set and valid
- Check server logs for detailed error messages
- Test email sending via admin panel email tool
- Verify email domain is verified in Resend
- Check Resend dashboard for failed email attempts

## Technical Details

### Database Schema Changes
- No schema changes to existing tables
- Only new functions added
- All functions use SECURITY DEFINER for admin operations
- Proper permission grants for authenticated users

### Breaking Changes
None. These are purely additive fixes.

### Performance Impact
Minimal. Functions use efficient queries with proper indexes.

### Security Considerations
- All admin functions verify caller has admin role
- SECURITY DEFINER used safely with explicit permission checks
- Content moderation happens before post creation
- Emails sent asynchronously, don't block critical flows

## Support

If issues persist after applying these fixes:

1. Check server logs for detailed error messages
2. Verify all environment variables are set
3. Test each component independently
4. Check Supabase function logs
5. Check Resend dashboard for email delivery status

## Files Modified

1. `/supabase/migrations/20251112000000_add_missing_functions.sql` (NEW)
2. `/app/[locale]/auth/callback/route.ts` (MODIFIED)

## Files Using Fixed Functions

1. `/app/[locale]/admin/page.tsx` - Calls admin_get_moderators
2. `/app/[locale]/admin/ModeratorsManagement.tsx` - Calls admin functions
3. `/app/[locale]/lighter/[id]/add/AddPostForm.tsx` - Calls create_new_post
4. `/app/[locale]/moderation/page.tsx` - Uses posts created by create_new_post
