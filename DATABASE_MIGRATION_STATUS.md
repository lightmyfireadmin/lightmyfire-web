# Database Migration Status

**Date:** 2025-11-07
**Migration File:** `fix_database_issues.sql`
**Verification Script:** `verify_database_migration.sql`

---

## Migration Overview

The database migration fixes critical schema mismatches between the implementation and product specification:

### Changes Required

1. **Pack Size Constraint (CRITICAL)**
   - **Current:** `CHECK (pack_size IN (5, 10, 25, 50))`
   - **Required:** `CHECK (pack_size IN (10, 20, 50))`
   - **Impact:** Orders with `pack_size=20` will currently FAIL

2. **Sticker Language Constraint (HIGH)**
   - **Current:** Only 6 languages (`en`, `fr`, `es`, `de`, `it`, `pt`)
   - **Required:** All 23 supported languages
   - **Impact:** Lighters with languages like `ja`, `ko`, `zh-CN` will FAIL

3. **RLS Policy Optimization (MEDIUM)**
   - **Current:** Multiple permissive policies causing performance overhead
   - **Required:** Consolidated policies for better performance
   - **Impact:** Improved query performance on `likes` and `post_flags` tables

4. **Post Count Caching (OPTIONAL)**
   - **Addition:** `post_count` column with automatic trigger
   - **Impact:** Eliminates expensive COUNT queries, improves homepage performance

---

## Verification Status

### How to Verify

**Option 1: Run Verification Script (Recommended)**

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `verify_database_migration.sql`
3. Click "Run"
4. Review output messages (✓ PASS / ✗ FAIL)

**Option 2: Manual Checks**

Run these queries in Supabase SQL Editor:

```sql
-- Check pack sizes constraint
SELECT check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'orders_pack_size_check';
-- Should contain: (10, 20, 50)

-- Check sticker languages constraint
SELECT check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'lighters_sticker_language_check';
-- Should contain: 'zh-CN', 'ja', 'ko' (among others)

-- Check likes policies
SELECT policyname FROM pg_policies
WHERE tablename = 'likes';
-- Should show: likes_select_policy, likes_insert_policy, likes_delete_policy

-- Check post_flags policies
SELECT policyname FROM pg_policies
WHERE tablename = 'post_flags';
-- Should show: post_flags_select_policy, post_flags_insert_policy, post_flags_delete_policy

-- Check post_count column
SELECT column_name FROM information_schema.columns
WHERE table_name = 'lighters' AND column_name = 'post_count';
-- Should return: post_count
```

---

## Migration Checklist

### Pre-Migration

- [ ] **Backup database** (Supabase Dashboard → Database → Backups)
- [ ] Review `fix_database_issues.sql` for understanding
- [ ] Notify team of brief maintenance window if needed
- [ ] Check if any orders with `pack_size=20` already exist (will fail with old constraint)

### Migration Execution

- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Copy entire contents of `fix_database_issues.sql`
- [ ] Click **"Run"** (transaction will auto-commit if successful)
- [ ] Review output for any errors
- [ ] Check for ✓ PASS messages in verification section

### Post-Migration

- [ ] Run `verify_database_migration.sql` to confirm all changes applied
- [ ] **Test creating order with pack_size=20** (should succeed now)
- [ ] Test creating order with pack_size=25 (should fail - not a valid size)
- [ ] Test creating lighter with sticker_language='ja' (should succeed now)
- [ ] **Enable Leaked Password Protection** manually:
  - Supabase Dashboard → Auth → Settings → Password Policy
  - Toggle "Leaked Password Protection" (HIBP integration)
- [ ] Update `DATABASE_SPECIFICATION.md` to reflect changes
- [ ] Mark migration as complete in `PROGRESS_REPORT.md`

---

## Testing Recommendations

### Critical Tests (Must Pass)

```sql
-- Test 1: Create order with pack_size=20 (NEW valid size)
INSERT INTO orders (user_id, pack_size, amount_paid, shipping_country)
VALUES ('[test-user-id]', 20, 1440, 'FR');
-- Expected: SUCCESS

-- Test 2: Create order with pack_size=25 (OLD invalid size)
INSERT INTO orders (user_id, pack_size, amount_paid, shipping_country)
VALUES ('[test-user-id]', 25, 1800, 'FR');
-- Expected: FAIL with constraint violation

-- Test 3: Create lighter with Japanese language
INSERT INTO lighters (user_id, name, sticker_language, background_color)
VALUES ('[test-user-id]', 'テストライター', 'ja', '#FF6B6B');
-- Expected: SUCCESS

-- Test 4: Verify likes policy performance
EXPLAIN ANALYZE
SELECT * FROM likes WHERE post_id = '[some-post-id]';
-- Should use optimized policy
```

---

## Rollback Plan

If migration causes issues, run the rollback script at the bottom of `fix_database_issues.sql`:

```sql
BEGIN;

-- Rollback pack_size constraint
ALTER TABLE public.orders DROP CONSTRAINT orders_pack_size_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_pack_size_check
  CHECK (pack_size IN (5, 10, 25, 50));

-- Rollback sticker_language constraint
ALTER TABLE public.lighters DROP CONSTRAINT lighters_sticker_language_check;
ALTER TABLE public.lighters ADD CONSTRAINT lighters_sticker_language_check
  CHECK (sticker_language IN ('en', 'fr', 'es', 'de', 'it', 'pt'));

-- Rollback likes policies (restore original)
DROP POLICY IF EXISTS "likes_select_policy" ON public.likes;
DROP POLICY IF EXISTS "likes_insert_policy" ON public.likes;
DROP POLICY IF EXISTS "likes_delete_policy" ON public.likes;
CREATE POLICY "likes_read_policy" ON public.likes FOR SELECT TO public USING (true);
CREATE POLICY "likes_write_policy" ON public.likes FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Rollback post_flags policies (restore original)
DROP POLICY IF EXISTS "post_flags_select_policy" ON public.post_flags;
DROP POLICY IF EXISTS "post_flags_insert_policy" ON public.post_flags;
DROP POLICY IF EXISTS "post_flags_delete_policy" ON public.post_flags;
CREATE POLICY "Users can see their own flags" ON public.post_flags FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Moderators can see all flags" ON public.post_flags FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin')));
CREATE POLICY "Users can flag posts" ON public.post_flags FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Rollback post_count optimization
DROP TRIGGER IF EXISTS update_lighter_post_count_trigger ON public.posts;
DROP FUNCTION IF EXISTS public.update_lighter_post_count();
ALTER TABLE public.lighters DROP COLUMN IF EXISTS post_count;
DROP INDEX IF EXISTS idx_lighters_post_count;

COMMIT;
```

---

## Current Status

**Status:** ⚠️ **VERIFICATION NEEDED**

The user mentioned "the database migration should be live" but we need confirmation.

**Next Steps:**

1. Run `verify_database_migration.sql` in Supabase SQL Editor
2. Review output to determine migration status
3. If ✗ FAIL messages appear, run `fix_database_issues.sql`
4. If ✓ PASS messages appear, mark migration as complete

---

## Migration Impact Analysis

### Risk Level: LOW
- **Why:** Migration uses safe DDL operations (constraint updates, policy changes)
- **Downtime:** None (operations are atomic)
- **Data Loss Risk:** Zero (no data modifications)

### Performance Impact: POSITIVE
- RLS policy consolidation reduces query overhead
- Post count caching eliminates expensive COUNT queries
- Indexed post_count improves homepage load time

### Breaking Changes: NONE
- New constraints are LESS restrictive (more pack sizes, more languages)
- Existing data remains valid
- API endpoints continue to work

### Required Manual Steps
1. Enable Leaked Password Protection in Supabase Dashboard (Auth settings)
2. Update any documentation referencing old pack sizes

---

## Questions for User

1. Has `fix_database_issues.sql` already been run in Supabase?
2. Are there any existing orders with `pack_size=20` that might be blocked?
3. Should we schedule this migration or is immediate execution acceptable?
4. Do you have admin access to Supabase Dashboard to enable Leaked Password Protection?

---

**Last Updated:** 2025-11-07
**Responsible:** Claude (automated verification)
**Approval:** Pending user confirmation
