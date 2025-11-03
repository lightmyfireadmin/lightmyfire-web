# Database Fix Implementation Checklist

## Pre-Implementation

- [ ] **Back up your Supabase database**
  - Go to: Supabase Dashboard → Database → Backups
  - Click "Create backup" or "Create manual backup"
  - Wait for backup to complete
  - Take note of backup ID

- [ ] **Prepare Supabase SQL Editor**
  - Go to: Supabase Dashboard → SQL Editor
  - Keep this window open

- [ ] **Review all SQL files**
  - Read through DATABASE_FIXES_CRITICAL.sql
  - Read through TROPHY_UNLOCK_LOGIC.sql
  - Review DATABASE_AUDIT_REPORT.md

## Phase 1: Critical Fixes (30 minutes)

### Step 1.1: Run DATABASE_FIXES_CRITICAL.sql

**Time: ~5 minutes**

In Supabase SQL Editor:
1. [ ] Copy entire contents of `DATABASE_FIXES_CRITICAL.sql`
2. [ ] Paste into SQL Editor
3. [ ] Click "Run"
4. [ ] **WAIT for completion**
5. [ ] Check for errors (should see "Success" messages)
6. [ ] Do NOT proceed to next step if there are errors

**What this does:**
- Drops broken flag count trigger
- Adds missing columns to lighters table
- Creates/verifies likes table with RLS
- Fixes profile auto-creation trigger
- Creates moderation_queue table
- Creates orders table
- Seeds trophy definitions
- Adds all database indexes
- Fixes foreign key constraints
- Updates RLS policies

**Expected output:**
```
CREATE TABLE
CREATE INDEX
DROP POLICY
CREATE POLICY
...
Success
```

---

### Step 1.2: Run TROPHY_UNLOCK_LOGIC.sql

**Time: ~3 minutes**

In Supabase SQL Editor:
1. [ ] Clear previous SQL (or open new tab)
2. [ ] Copy entire contents of `TROPHY_UNLOCK_LOGIC.sql`
3. [ ] Paste into SQL Editor
4. [ ] Click "Run"
5. [ ] **WAIT for completion**
6. [ ] Check for errors
7. [ ] Do NOT proceed if there are errors

**What this does:**
- Creates trophy unlock detection function
- Creates trophy granting function
- Creates triggers for post and lighter creation
- Creates one-time sync function for existing users

**Expected output:**
```
CREATE OR REPLACE FUNCTION
DROP TRIGGER
CREATE TRIGGER
...
Success
```

---

### Step 1.3: Run SUPABASE_SECURITY_FIX_FINAL_CORRECTED.sql

**Time: ~3 minutes**

In Supabase SQL Editor:
1. [ ] Clear previous SQL (or open new tab)
2. [ ] Copy entire contents of `SUPABASE_SECURITY_FIX_FINAL_CORRECTED.sql`
3. [ ] Paste into SQL Editor
4. [ ] Click "Run"
5. [ ] **WAIT for completion**
6. [ ] Check for errors
7. [ ] Do NOT proceed if there are errors

**What this does:**
- Drops problematic views and policies
- Recreates all views in private schema
- Updates RPC functions with proper security
- Sets up app_role checking instead of user_metadata

**Expected output:**
```
DROP POLICY
DROP FUNCTION
DROP VIEW
CREATE OR REPLACE FUNCTION
CREATE OR REPLACE VIEW
...
Success
```

---

## Phase 2: Verification (30 minutes)

### Step 2.1: Check Tables Exist

In Supabase SQL Editor:
```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

[ ] Click "Run"
[ ] Verify output includes ALL of these tables:
  - [ ] lighters
  - [ ] likes
  - [ ] moderation_queue
  - [ ] orders
  - [ ] posts
  - [ ] profiles
  - [ ] trophies
  - [ ] user_trophies

**If missing tables:**
❌ DO NOT CONTINUE
Go back and check for errors in previous steps

---

### Step 2.2: Check Indexes Exist

In Supabase SQL Editor:
```sql
SELECT tablename, indexname FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

[ ] Click "Run"
[ ] Verify indexes like:
  - idx_likes_post_id ✓
  - idx_likes_user_id ✓
  - idx_moderation_queue_status ✓
  - idx_orders_user_id ✓
  - idx_orders_created_at ✓
  - idx_posts_created_at ✓
  - idx_posts_lighter_id ✓
  - idx_posts_user_id ✓
  - idx_posts_is_flagged ✓

**If missing indexes:**
❌ DO NOT CONTINUE
Run DATABASE_FIXES_CRITICAL.sql again and check for errors

---

### Step 2.3: Check RLS Enabled

In Supabase SQL Editor:
```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('likes', 'moderation_queue', 'orders', 'posts')
ORDER BY tablename;
```

[ ] Click "Run"
[ ] Verify all have `rowsecurity = t` (true)
  - [ ] likes
  - [ ] moderation_queue
  - [ ] orders
  - [ ] posts

**If any show false:**
⚠️ Re-run the security fix SQL

---

### Step 2.4: Check Triggers Exist

In Supabase SQL Editor:
```sql
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

[ ] Click "Run"
[ ] Verify triggers like:
  - on_auth_user_created (on auth.users)
  - check_trophy_on_post_insert (on posts)
  - check_trophy_on_lighter_insert (on lighters)
  - update_lighters_timestamp (on lighters)
  - update_moderation_queue_timestamp (on moderation_queue)
  - update_orders_timestamp (on orders)

**If missing triggers:**
⚠️ Run the SQL files again and check for errors

---

### Step 2.5: Check Trophy Data

In Supabase SQL Editor:
```sql
SELECT id, name FROM public.trophies
ORDER BY id;
```

[ ] Click "Run"
[ ] Verify all 10 trophies exist:
  - [ ] 1 - Fire Starter
  - [ ] 2 - Story Teller
  - [ ] 3 - Chronicles
  - [ ] 4 - Epic Saga
  - [ ] 5 - Collector
  - [ ] 6 - Community Builder
  - [ ] 7 - Globe Trotter
  - [ ] 8 - Popular Contributor
  - [ ] 9 - Photographer
  - [ ] 10 - Musician

**If missing trophies:**
Run DATABASE_FIXES_CRITICAL.sql Section 7 again

---

## Phase 3: Testing (1 hour)

### Step 3.1: Test Profile Auto-Creation

In your app:
1. [ ] Open signup/auth page
2. [ ] Create new user with email (or use Google OAuth)
3. [ ] Check Supabase → profiles table
4. [ ] Verify profile row exists for the new user

**If profile not created:**
❌ Profile auto-creation trigger failed
Run DATABASE_FIXES_CRITICAL.sql Section 4 again

---

### Step 3.2: Test Create Post

In your app:
1. [ ] Log in as the test user
2. [ ] Create a lighter
3. [ ] Add a post (text type)
4. [ ] Submit post
5. [ ] Check Supabase → posts table
6. [ ] Verify post row exists with correct data

**If post not created:**
❌ Create post function failed
Check application logs for specific error

---

### Step 3.3: Test Like Functionality

In your app:
1. [ ] Navigate to a post
2. [ ] Click like/heart button
3. [ ] Check Supabase → likes table
4. [ ] Verify like row exists
5. [ ] Click like again (should be removed)
6. [ ] Verify like row removed

**If like fails:**
❌ Like toggle function failed
Check likes table RLS policies

---

### Step 3.4: Test Trophy Unlocking

In your app:
1. [ ] Create new user
2. [ ] Create a lighter (should unlock "Fire Starter")
3. [ ] Go to profile
4. [ ] Check "My Trophies" section
5. [ ] Verify "Fire Starter" is unlocked
6. [ ] Add first post (should unlock "Story Teller")
7. [ ] Go to profile
8. [ ] Verify "Story Teller" is unlocked

**If trophies not unlocking:**
❌ Trophy trigger failed
Run TROPHY_UNLOCK_LOGIC.sql again and check for errors

---

### Step 3.5: Test Image Post

In your app:
1. [ ] Create new post with image
2. [ ] Upload image from file or paste URL
3. [ ] Submit post
4. [ ] Check Supabase → posts table
5. [ ] Verify post_type = 'image'
6. [ ] Verify content_url has value

**If image post fails:**
⚠️ Check storage bucket permissions
Verify post-images bucket exists and has RLS configured

---

### Step 3.6: Test Location Post

In your app:
1. [ ] Create new post with location
2. [ ] Search for a place (e.g., "Paris")
3. [ ] Select location from dropdown
4. [ ] Submit post
5. [ ] Check Supabase → posts table
6. [ ] Verify post_type = 'location'
7. [ ] Verify location_lat and location_lng have values

**If location search fails:**
⚠️ This uses Nominatim (free OpenStreetMap API)
Should work without configuration

---

### Step 3.7: Test Song Post (YouTube)

In your app:
1. [ ] Create new post with song
2. [ ] Search YouTube (e.g., "Amazing Grace")
3. [ ] Select song from results
4. [ ] Submit post
5. [ ] Check Supabase → posts table
6. [ ] Verify post_type = 'song'
7. [ ] Verify content_url contains youtube.com

**If YouTube search fails:**
⚠️ Check NEXT_PUBLIC_YOUTUBE_API_KEY in .env.local

---

## Phase 4: Moderation Testing (15 minutes)

### Step 4.1: Check Moderation Table

In Supabase SQL Editor:
```sql
SELECT * FROM public.moderation_queue LIMIT 1;
```

[ ] Click "Run"
[ ] Table should exist (empty is OK)

---

### Step 4.2: Manual Moderation Insert Test

In Supabase SQL Editor:
```sql
INSERT INTO public.moderation_queue
  (user_id, content_type, content, severity, status)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'post', 'Test content', 'low', 'pending')
RETURNING *;
```

[ ] Click "Run"
[ ] Verify insert succeeds (should see the row returned)
[ ] Delete the test row:
  ```sql
  DELETE FROM public.moderation_queue WHERE content = 'Test content';
  ```

---

## Phase 5: Order Testing (15 minutes)

### Step 5.1: Check Orders Table

In Supabase SQL Editor:
```sql
SELECT * FROM public.orders LIMIT 1;
```

[ ] Click "Run"
[ ] Table should exist (empty is OK)

---

### Step 5.2: Manual Order Insert Test

In Supabase SQL Editor:
```sql
INSERT INTO public.orders
  (user_id, stripe_payment_intent_id, stripe_customer_email, pack_size, amount_cents, status)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'pi_test_123', 'test@example.com', 10, 4999, 'pending')
RETURNING *;
```

[ ] Click "Run"
[ ] Verify insert succeeds
[ ] Delete the test row:
  ```sql
  DELETE FROM public.orders WHERE stripe_payment_intent_id = 'pi_test_123';
  ```

---

## Phase 6: Final Checks

### Step 6.1: Performance Check

In Supabase SQL Editor:
```sql
-- Check for missing statistics
ANALYZE;

-- Check query performance on posts
EXPLAIN ANALYZE
SELECT * FROM public.posts WHERE lighter_id = '00000000-0000-0000-0000-000000000000' LIMIT 10;
```

[ ] Should use index (check for "Index Scan" in output)
[ ] Execution time should be < 10ms

---

### Step 6.2: Foreign Key Check

In Supabase SQL Editor:
```sql
SELECT constraint_name, table_name, column_name, referenced_table_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public'
ORDER BY table_name;
```

[ ] Click "Run"
[ ] Verify all expected foreign keys exist

---

### Step 6.3: RLS Policy Check

In Supabase SQL Editor:
```sql
SELECT tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

[ ] Click "Run"
[ ] Verify policies exist for:
  - [ ] likes
  - [ ] moderation_queue
  - [ ] orders
  - [ ] posts

---

## Rollback Procedure (If Needed)

If something goes wrong:

### Option 1: Restore from Backup

1. Go to Supabase Dashboard → Database → Backups
2. Find the backup created before fixes
3. Click "Restore"
4. Confirm restoration
5. Wait for restore to complete

### Option 2: Drop and Recreate

If you need to drop specific tables:

```sql
-- Drop new tables if needed
DROP TABLE IF EXISTS public.moderation_queue CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- Drop problematic functions
DROP FUNCTION IF EXISTS public.increment_flag_count();

-- Drop bad triggers
DROP TRIGGER IF EXISTS increment_flag_count_trigger ON public.posts;
```

Then re-run the SQL files from scratch.

---

## Completion Checklist

- [ ] All SQL files executed successfully
- [ ] All tables exist (8 tables verified)
- [ ] All indexes created (9+ indexes verified)
- [ ] All triggers exist (6+ triggers verified)
- [ ] RLS enabled on 4 tables
- [ ] Trophy definitions seeded (10 trophies)
- [ ] User signup creates profile
- [ ] Posts can be created
- [ ] Likes work properly
- [ ] Trophies unlock automatically
- [ ] Location search works
- [ ] YouTube search works
- [ ] Image upload works
- [ ] Moderation_queue table accessible
- [ ] Orders table accessible
- [ ] Performance acceptable
- [ ] Foreign keys verified
- [ ] RLS policies working

---

## Next Steps After Fixes

1. **Deploy Code**
   - Push changes to production
   - Deploy with these database changes
   - Monitor error logs

2. **Monitor**
   - Check database logs in Supabase
   - Monitor API response times
   - Check error rates

3. **Load Test**
   - Test with realistic user load
   - Check performance metrics
   - Optimize if needed

4. **Security Audit**
   - Review RLS policies
   - Check for SQL injection vectors
   - Verify auth flows work correctly

---

## Troubleshooting

**Error: "table already exists"**
- This is OK - means the table was already there
- SQL includes `CREATE TABLE IF NOT EXISTS`
- Proceed to next step

**Error: "function already exists"**
- This is OK - we're replacing the function
- SQL includes `DROP FUNCTION IF EXISTS` first
- Proceed to next step

**Error: "permission denied"**
- Verify you're logged in as admin/owner
- Check Supabase project permissions
- Contact Supabase support if needed

**Error: "syntax error in SQL"**
- Copy SQL more carefully (no characters before/after)
- Try running sections individually
- Check for special characters in copy

**Trophies not unlocking**
- Verify trophy seed data exists
- Re-run TROPHY_UNLOCK_LOGIC.sql
- Check Supabase logs for trigger errors

**Moderation queue empty**
- This is normal - no content flagged yet
- Test by creating post with moderation API
- Verify table schema is correct

---

## Support

For issues:

1. **Check verification queries** (Phase 2)
2. **Review error messages** in SQL output
3. **Check DATABASE_AUDIT_REPORT.md** for details
4. **Contact Supabase support** for database issues
5. **Check application logs** for code-related issues

---

## Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1.1 | Run critical fixes SQL | 5 min | |
| 1.2 | Run trophy logic SQL | 3 min | |
| 1.3 | Run security fixes SQL | 3 min | |
| 2.1-2.5 | Verify all changes | 30 min | |
| 3.1-3.7 | Test features | 1 hour | |
| 4.1-4.2 | Test moderation | 15 min | |
| 5.1-5.2 | Test orders | 15 min | |
| 6.1-6.3 | Final checks | 15 min | |
| **Total** | | **~2 hours** | |

---

**When complete, database will be production-ready! ✅**
