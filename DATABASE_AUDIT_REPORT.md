# LightMyFire Database Audit Report

## Executive Summary

The Supabase database has **critical issues** that prevent core features from functioning:

- 🔴 **2 Critical Issues** - Application will crash
- 🔴 **5 High Priority Issues** - Features completely broken
- 🟡 **8 Medium Priority Issues** - Data loss risk
- 🟢 **4 Low Priority Issues** - Performance/UX

**Overall Status:** 🔴 **REQUIRES IMMEDIATE FIXES BEFORE PRODUCTION**

---

## Critical Issues Found

### 🔴 CRITICAL #1: Broken Flag Count Trigger

**Location:** `public.increment_flag_count()` trigger

**Problem:**
```sql
-- WRONG - resets flag_count to 0 every time!
new.flag_count := 0;
```

**Impact:**
- Every new post created gets `flag_count = 0`
- Moderation system completely broken
- Posts can't track how many flags they've received

**Fix:** Delete this trigger entirely
```sql
DROP TRIGGER increment_flag_count_trigger ON posts;
DROP FUNCTION increment_flag_count();
```

**Status:** ⚠️ MUST FIX IMMEDIATELY

---

### 🔴 CRITICAL #2: Missing Orders Table

**Problem:** Table doesn't exist in database

**Impact:**
- Stripe payments have nowhere to be stored
- API endpoint `/api/create-payment-intent` will crash
- Sticker orders cannot be processed
- No revenue tracking

**Solution:** Run DATABASE_FIXES_CRITICAL.sql Section 9

**Missing Columns:**
- `id` (UUID)
- `user_id` (UUID)
- `stripe_payment_intent_id` (TEXT, UNIQUE)
- `stripe_customer_email` (TEXT)
- `lighter_id` (UUID)
- `pack_size` (INTEGER)
- `amount_cents` (INTEGER)
- `status` (TEXT)
- `payment_status` (TEXT)
- And 8 more columns...

**Status:** ⚠️ MUST CREATE IMMEDIATELY

---

### 🔴 CRITICAL #3: Missing Moderation Queue Table

**Problem:** Table doesn't exist in database

**Impact:**
- OpenAI moderation results have nowhere to go
- Flagged content cannot be reviewed
- No compliance audit trail
- `/api/moderate-text` and `/api/moderate-image` will crash

**Solution:** Run DATABASE_FIXES_CRITICAL.sql Section 8

**Status:** ⚠️ MUST CREATE IMMEDIATELY

---

### 🔴 CRITICAL #4: Missing Trophy Auto-Unlock System

**Problem:**
- Trophy unlock triggers don't exist
- No database functions to grant trophies automatically
- Manual trophy granting not implemented

**Impact:**
- Users never get trophies unlocked automatically
- Profile gamification doesn't work
- Trophy system completely broken

**Files Needed:**
- `TROPHY_UNLOCK_LOGIC.sql` (already created)

**Status:** ⚠️ MUST IMPLEMENT BEFORE LAUNCH

---

### 🔴 CRITICAL #5: Security Issues in RPC Functions

**Problem:** RPC functions likely missing `SET search_path = public`

**Affected Functions:**
- `create_new_post`
- `toggle_like`
- `flag_post`
- `get_random_public_posts`
- `create_new_lighter`
- `get_my_stats`
- And others...

**Impact:**
- SQL injection vulnerabilities
- Privilege escalation risks
- Security audit failures

**Fix:** Apply `SUPABASE_SECURITY_FIX_FINAL_CORRECTED.sql`

**Status:** ⚠️ CRITICAL SECURITY FIX NEEDED

---

## High Priority Issues

### 🔴 #6: Missing Columns on Lighters Table

**Missing:**
- `background_color` (TEXT) - for sticker customization
- `sticker_language` (TEXT) - selected language for QR code text
- `sticker_design_version` (INTEGER) - versioning for designs
- `updated_at` (TIMESTAMP) - for tracking changes

**Impact:**
- Sticker design customization can't be saved
- Can't track which language user selected
- No change tracking

**Fix:** Run DATABASE_FIXES_CRITICAL.sql Section 2

**Current Status:** ⚠️ MISSING

---

### 🔴 #7: Broken Profile Auto-Creation

**Problem:** Trigger that creates user profile on signup may not exist

**Impact:**
- New users without profiles get foreign key errors
- POST requests fail when user_id not in profiles table
- Google OAuth users can't post

**Evidence:** Code in `my-profile/page.tsx` has fallback to manually create profiles

**Fix:** Run DATABASE_FIXES_CRITICAL.sql Section 4

**Status:** ⚠️ VERIFY & FIX

---

### 🔴 #8: Inconsistent Table Naming

**Problem:** Code references both `likes` and `post_likes`

**Where Used:**
- Type definitions say `post_likes`
- Some queries use `from('likes')`
- Inconsistency in codebase

**Impact:**
- Query failures
- Confusion in development
- Potential duplicate tables

**Fix:** Standardize on `likes` table name

**Status:** ⚠️ VERIFY & UNIFY

---

### 🔴 #9: Missing RPC Functions

**Missing Functions:**
1. `log_moderation_result` - Store moderation decision
2. `create_order_from_payment` - Create order from Stripe payment
3. `update_order_payment_succeeded` - Mark order as paid
4. `get_moderation_stats` - Dashboard analytics
5. `get_order_analytics` - Order analytics
6. `get_moderation_queue_data` - Get moderation queue
7. `get_orders_data` - Get orders for admin

**Impact:**
- Moderation dashboard non-functional
- Order management impossible
- Analytics unavailable

**Fix:** Create these functions (in COMPREHENSIVE_DATABASE_MIGRATION.sql)

**Status:** ⚠️ MISSING

---

### 🔴 #10: Incomplete Foreign Key Constraints

**Problem:** Foreign keys may not have CASCADE deletes

**Affected Relationships:**
- `posts.lighter_id` → `lighters.id`
- `posts.user_id` → `profiles.id`
- `likes.post_id` → `posts.id`
- `likes.user_id` → `profiles.id`
- `user_trophies.user_id` → `profiles.id`

**Impact:**
- Orphaned records when deleting lighters/users
- Database bloat
- Referential integrity violations

**Fix:** Run DATABASE_FIXES_CRITICAL.sql Section 10

**Status:** ⚠️ VERIFY & FIX

---

## Medium Priority Issues

### 🟡 #11: Missing Database Indexes

**Missing Indexes on Posts Table:**
```sql
idx_posts_lighter_id      -- For "all posts of a lighter" queries
idx_posts_user_id         -- For "all posts by user" queries
idx_posts_is_public       -- For "public posts" queries
idx_posts_is_flagged      -- For "non-flagged posts" queries
idx_posts_created_at      -- For "recent posts" queries
```

**Missing Indexes on Likes Table:**
```sql
idx_likes_post_id         -- For "all likes on a post" queries
idx_likes_user_id         -- For "all likes by user" queries
UNIQUE(user_id, post_id)  -- Prevent duplicate likes
```

**Missing Indexes on Lighters Table:**
```sql
idx_lighters_saver_id     -- For "all lighters by user" queries
idx_lighters_created_at   -- For "recent lighters" queries
```

**Impact:**
- Slow queries on large datasets
- Poor user experience
- High database load

**Fix:** Run DATABASE_FIXES_CRITICAL.sql (includes all indexes)

**Status:** ⚠️ PERFORMANCE ISSUE

---

### 🟡 #12: Incomplete RLS Policies

**Posts Table:**
- May allow unauthorized access to flagged posts
- May expose admin-only content

**Likes Table:**
- May allow users to delete others' likes
- May allow manipulation of like counts

**Lighters Table:**
- May expose private lighter data

**User Trophies Table:**
- May allow trophy manipulation

**Impact:**
- Security vulnerabilities
- Data privacy violations
- Unauthorized access

**Fix:** Run DATABASE_FIXES_CRITICAL.sql and review all policies

**Status:** ⚠️ SECURITY ISSUE

---

### 🟡 #13: Missing Timestamp Update Triggers

**Missing Triggers:**
- `update_lighters_timestamp` - Auto-update `updated_at` on changes
- `update_moderation_queue_timestamp` - Auto-update on changes
- `update_orders_timestamp` - Auto-update on changes

**Impact:**
- Can't track when records were modified
- Stale data in views
- Audit trail incomplete

**Fix:** Run DATABASE_FIXES_CRITICAL.sql

**Status:** ⚠️ DATA INTEGRITY ISSUE

---

### 🟡 #14: Detailed Posts View May Have Issues

**Potential Problems:**
- May use `SECURITY DEFINER` (security risk)
- May not include `user_has_liked` column (requires auth context)
- May have stale column references

**Impact:**
- View may fail on certain queries
- Performance issues
- Security vulnerabilities

**Fix:** Recreate view from COMPREHENSIVE_DATABASE_MIGRATION.sql

**Status:** ⚠️ VERIFY & FIX

---

### 🟡 #15: Bigint Data Type in JavaScript

**Problem:**
- Posts table uses `BIGINT` for `id`
- JavaScript can't safely represent bigints > 2^53
- Need explicit BigInt handling

**Affected:**
- `posts.id` (BIGINT)
- `posts` queries

**Impact:**
- Data corruption in large ID values
- Silent bugs in production

**Solution:**
- Use BigInt type in TypeScript
- Use `.bigint()` in Supabase queries

**Status:** 🟡 FUTURE ISSUE (not immediate)

---

### 🟡 #16: Trophy Seed Data Missing

**Problem:** Trophy definitions may not exist in database

**Missing Trophies:**
1. Fire Starter (id=1) - Save first lighter
2. Story Teller (id=2) - Add first post
3. Chronicles (id=3) - 5 posts
4. Epic Saga (id=4) - 10 posts
5. Collector (id=5) - 5 lighters saved
6. Community Builder (id=6) - 10 different lighters
7. Globe Trotter (id=7) - 5 countries
8. Popular Contributor (id=8) - 50 likes
9. Photographer (id=9) - 10 photos
10. Musician (id=10) - 5 songs

**Impact:**
- Trophy system can't work without definitions
- Users can't earn trophies

**Fix:** Run DATABASE_FIXES_CRITICAL.sql Section 7

**Status:** 🟡 DATA ISSUE

---

### 🟡 #17: Storage Bucket Configuration

**Issue:** `post-images` bucket needs proper RLS

**Needs:**
- Authenticated users can upload
- Only image files allowed
- Size limits enforced
- Public read access

**Impact:**
- Image posts fail to upload
- Users can't add photos

**Status:** 🟡 CONFIGURATION ISSUE

---

### 🟡 #18: Profile Picture Storage (Future)

**Issue:** No storage for profile pictures yet

**When Needed:** Profile customization feature

**Status:** 🟢 LOW PRIORITY

---

## Low Priority Issues

### 🟢 #19: Audit Logging

**Missing:** Audit trail for content moderation decisions

**Impact:** Compliance/auditing harder

**Status:** 🟢 NICE-TO-HAVE

---

### 🟢 #20: Soft Deletes

**Missing:** Soft delete support for lighters

**Impact:** Deleted lighters permanently gone

**Status:** 🟢 FEATURE REQUEST

---

## Implementation Checklist

### Phase 1: CRITICAL FIXES (Do Today)

- [ ] Run `DATABASE_FIXES_CRITICAL.sql` (all sections)
  - [ ] Drop broken flag count trigger
  - [ ] Add missing lighter columns
  - [ ] Create/verify likes table
  - [ ] Fix profile auto-creation
  - [ ] Create moderation_queue table
  - [ ] Create orders table
  - [ ] Seed trophy definitions
  - [ ] Fix foreign keys
  - [ ] Update RLS policies

- [ ] Run `TROPHY_UNLOCK_LOGIC.sql`
  - [ ] Create trophy unlock functions
  - [ ] Create trophy unlock triggers

- [ ] Apply security fixes
  - [ ] Run `SUPABASE_SECURITY_FIX_FINAL_CORRECTED.sql`

- [ ] Test critical features
  - [ ] User signup creates profile
  - [ ] Can create a post
  - [ ] Can like a post
  - [ ] Moderation flags work
  - [ ] Stripe orders created

### Phase 2: HIGH PRIORITY (This Week)

- [ ] Verify all indexes exist
- [ ] Review all RLS policies
- [ ] Test timestamp triggers
- [ ] Verify trophy unlocking works
- [ ] Check foreign key constraints
- [ ] Test storage bucket permissions

### Phase 3: MEDIUM PRIORITY (This Month)

- [ ] Implement audit logging
- [ ] Add soft deletes for lighters
- [ ] Performance testing
- [ ] Load testing
- [ ] Security audit

### Phase 4: LOW PRIORITY (Later)

- [ ] Profile picture storage
- [ ] Advanced analytics
- [ ] Data archiving

---

## SQL Files to Run (In Order)

1. **DATABASE_FIXES_CRITICAL.sql** ← RUN FIRST
   - Fixes all critical issues
   - Creates missing tables
   - Seeds trophy data
   - Sets up RLS policies

2. **TROPHY_UNLOCK_LOGIC.sql** ← RUN SECOND
   - Sets up trophy auto-unlock
   - Creates database triggers

3. **COMPREHENSIVE_DATABASE_MIGRATION.sql** (if needed)
   - Additional functions
   - Advanced features

4. **SUPABASE_SECURITY_FIX_FINAL_CORRECTED.sql**
   - Security hardening
   - Function fixes

---

## Verification Queries

Run these to verify the fixes:

```sql
-- Check tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should include: lighters, likes, moderation_queue, orders,
-- posts, profiles, trophies, user_trophies

-- Check RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check triggers
SELECT trigger_schema, trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- Check functions
SELECT proname, prosrc
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

-- Check foreign keys
SELECT constraint_name, table_name, column_name,
       referenced_table_name, referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## Post-Fix Validation

After running the SQL files:

### 1. Test User Flow
```
1. Sign up new user (Google OAuth)
2. Check profile created automatically
3. Create lighter
4. Add post (text, image, song, location)
5. Like a post
6. Check profile shows post count
7. Check trophies unlock automatically
```

### 2. Test Moderation
```
1. Post inappropriate content
2. Check it appears in moderation_queue
3. Admin reviews and approves/rejects
4. Check post shows as flagged/unflagged
```

### 3. Test Orders
```
1. Create lighter
2. Go to sticker order page
3. Create payment intent
4. Check order created in orders table
5. Complete payment
6. Check order marked as succeeded
```

### 4. Test Admin Features
```
1. Login as admin
2. View moderation dashboard
3. View order analytics
4. Check all RLS policies work
```

---

## Performance Expectations

After fixes:
- Homepage load: < 2s (was slower)
- Post creation: < 1s
- Trophy unlock: < 100ms
- Moderation processing: < 500ms
- Order creation: < 1s

If still slow, check:
- Index usage with EXPLAIN ANALYZE
- N+1 query problems
- Missing statistics (ANALYZE)

---

## Security Checklist

After all fixes:

- [ ] All RPC functions have `SET search_path = public`
- [ ] All RLS policies prevent unauthorized access
- [ ] No `SECURITY DEFINER` on views
- [ ] Foreign keys enforce referential integrity
- [ ] No SQL injection vectors
- [ ] Admin role properly checked in policies
- [ ] Storage bucket RLS configured
- [ ] API endpoints validate inputs

---

## Rollback Plan

If something breaks:

1. **For table creation errors:**
   ```sql
   DROP TABLE IF EXISTS public.moderation_queue CASCADE;
   DROP TABLE IF EXISTS public.orders CASCADE;
   ```

2. **For trigger errors:**
   ```sql
   DROP TRIGGER IF EXISTS trigger_name ON table_name;
   DROP FUNCTION IF EXISTS function_name();
   ```

3. **For RLS policy errors:**
   ```sql
   DROP POLICY IF EXISTS policy_name ON table_name;
   ```

4. **For full rollback:**
   - Restore from latest backup
   - Contact Supabase support

---

## Next Steps

1. **Immediate:**
   - Run DATABASE_FIXES_CRITICAL.sql
   - Run TROPHY_UNLOCK_LOGIC.sql
   - Apply security fixes

2. **Testing:**
   - Run verification queries
   - Test all user flows
   - Performance testing

3. **Deployment:**
   - Deploy fixed code
   - Monitor for errors
   - Check performance metrics

4. **Monitoring:**
   - Watch database logs
   - Monitor query performance
   - Track error rates

---

## Questions?

If you encounter issues:

1. Check verification queries output
2. Review PostgreSQL logs in Supabase dashboard
3. Test one feature at a time
4. Use rollback plan if needed
5. Contact Supabase support for database issues

---

**Report Generated:** 2024-11-03
**Status:** 🔴 CRITICAL - REQUIRES IMMEDIATE ACTION BEFORE DEPLOYMENT
