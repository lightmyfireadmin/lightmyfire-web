-- ============================================================================
-- Database Migration Verification Script
-- Run this in Supabase SQL Editor to check if fix_database_issues.sql was applied
-- ============================================================================

-- Set client min messages to notice to see output
SET client_min_messages TO NOTICE;

DO $$
DECLARE
  constraint_check TEXT;
  policy_count INTEGER;
  column_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'LightMyFire Database Migration Verification';
  RAISE NOTICE 'Date: %', NOW();
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  -- ============================================================================
  -- CHECK 1: Verify pack_size constraint on orders table
  -- ============================================================================
  RAISE NOTICE '1. Checking orders.pack_size constraint...';

  SELECT check_clause INTO constraint_check
  FROM information_schema.check_constraints
  WHERE constraint_schema = 'public'
    AND constraint_name = 'orders_pack_size_check';

  IF constraint_check IS NULL THEN
    RAISE WARNING '   ✗ FAIL: orders_pack_size_check constraint not found!';
  ELSIF constraint_check LIKE '%10%20%50%' THEN
    RAISE NOTICE '   ✓ PASS: Pack sizes updated to (10, 20, 50)';
    RAISE NOTICE '   Details: %', constraint_check;
  ELSIF constraint_check LIKE '%5%10%25%50%' THEN
    RAISE WARNING '   ✗ FAIL: Pack sizes still using OLD values (5, 10, 25, 50)';
    RAISE WARNING '   Action: Run fix_database_issues.sql';
  ELSE
    RAISE WARNING '   ⚠ UNKNOWN: Unexpected constraint: %', constraint_check;
  END IF;
  RAISE NOTICE '';

  -- ============================================================================
  -- CHECK 2: Verify sticker_language constraint on lighters table
  -- ============================================================================
  RAISE NOTICE '2. Checking lighters.sticker_language constraint...';

  SELECT check_clause INTO constraint_check
  FROM information_schema.check_constraints
  WHERE constraint_schema = 'public'
    AND constraint_name = 'lighters_sticker_language_check';

  IF constraint_check IS NULL THEN
    RAISE WARNING '   ✗ FAIL: lighters_sticker_language_check constraint not found!';
  ELSIF constraint_check LIKE '%zh-CN%' AND constraint_check LIKE '%ja%' AND constraint_check LIKE '%ko%' THEN
    RAISE NOTICE '   ✓ PASS: Sticker languages updated to 23 languages';
    RAISE NOTICE '   Includes: en, fr, es, de, it, pt, nl, ru, pl, ja, ko, zh-CN, th, vi, hi, ar, fa, ur, mr, te, id, uk, tr';
  ELSIF constraint_check LIKE '%en%' AND constraint_check LIKE '%fr%' AND NOT constraint_check LIKE '%ja%' THEN
    RAISE WARNING '   ✗ FAIL: Sticker languages still limited to 6 languages';
    RAISE WARNING '   Action: Run fix_database_issues.sql';
  ELSE
    RAISE WARNING '   ⚠ UNKNOWN: Unexpected constraint: %', constraint_check;
  END IF;
  RAISE NOTICE '';

  -- ============================================================================
  -- CHECK 3: Verify likes table RLS policies
  -- ============================================================================
  RAISE NOTICE '3. Checking likes table RLS policies...';

  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'likes';

  RAISE NOTICE '   Total policies: %', policy_count;

  -- Check for new optimized policies
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'likes'
      AND policyname = 'likes_select_policy'
  ) THEN
    RAISE NOTICE '   ✓ PASS: New optimized policies found (likes_select_policy)';
    RAISE NOTICE '   Expected policies: likes_select_policy, likes_insert_policy, likes_delete_policy';
  ELSIF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'likes'
      AND policyname = 'likes_read_policy'
  ) THEN
    RAISE WARNING '   ✗ FAIL: Old policies still in use (likes_read_policy, likes_write_policy)';
    RAISE WARNING '   Action: Run fix_database_issues.sql';
  ELSE
    RAISE WARNING '   ⚠ UNKNOWN: Unexpected policy configuration';
  END IF;
  RAISE NOTICE '';

  -- ============================================================================
  -- CHECK 4: Verify post_flags table RLS policies
  -- ============================================================================
  RAISE NOTICE '4. Checking post_flags table RLS policies...';

  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'post_flags';

  RAISE NOTICE '   Total policies: %', policy_count;

  -- Check for new optimized policies
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'post_flags'
      AND policyname = 'post_flags_select_policy'
  ) THEN
    RAISE NOTICE '   ✓ PASS: New optimized policies found (post_flags_select_policy)';
    RAISE NOTICE '   Expected policies: post_flags_select_policy, post_flags_insert_policy, post_flags_delete_policy';
  ELSIF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'post_flags'
      AND policyname = 'Users can see their own flags'
  ) THEN
    RAISE WARNING '   ✗ FAIL: Old policies still in use ("Users can see their own flags")';
    RAISE WARNING '   Action: Run fix_database_issues.sql';
  ELSE
    RAISE WARNING '   ⚠ UNKNOWN: Unexpected policy configuration';
  END IF;
  RAISE NOTICE '';

  -- ============================================================================
  -- CHECK 5: Verify post_count column exists on lighters table
  -- ============================================================================
  RAISE NOTICE '5. Checking lighters.post_count optimization...';

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'lighters'
      AND column_name = 'post_count'
  ) INTO column_exists;

  IF column_exists THEN
    RAISE NOTICE '   ✓ PASS: post_count column exists';

    -- Check if trigger exists
    IF EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = 'update_lighter_post_count_trigger'
    ) THEN
      RAISE NOTICE '   ✓ PASS: post_count trigger exists';
    ELSE
      RAISE WARNING '   ⚠ WARNING: post_count column exists but trigger is missing';
    END IF;

    -- Check if index exists
    IF EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'lighters'
        AND indexname = 'idx_lighters_post_count'
    ) THEN
      RAISE NOTICE '   ✓ PASS: post_count index exists';
    ELSE
      RAISE WARNING '   ⚠ WARNING: post_count column exists but index is missing';
    END IF;
  ELSE
    RAISE WARNING '   ✗ FAIL: post_count column does not exist (optional optimization)';
    RAISE NOTICE '   Action: Run fix_database_issues.sql for performance optimization';
  END IF;
  RAISE NOTICE '';

  -- ============================================================================
  -- CHECK 6: Additional Security - Leaked Password Protection
  -- ============================================================================
  RAISE NOTICE '6. Checking leaked password protection...';
  RAISE NOTICE '   ⚠ NOTE: This must be enabled MANUALLY in Supabase Dashboard';
  RAISE NOTICE '   Path: Auth → Settings → Password Policy → Enable HIBP integration';
  RAISE NOTICE '';

  -- ============================================================================
  -- SUMMARY
  -- ============================================================================
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'If you see ✗ FAIL messages above:';
  RAISE NOTICE '  → Run fix_database_issues.sql in Supabase SQL Editor';
  RAISE NOTICE '';
  RAISE NOTICE 'If you see ✓ PASS for all checks:';
  RAISE NOTICE '  → Migration is complete! 🎉';
  RAISE NOTICE '  → Don''t forget to enable Leaked Password Protection manually';
  RAISE NOTICE '';

END $$;

-- ============================================================================
-- OPTIONAL: Query current pack sizes in use (if orders table has data)
-- ============================================================================

DO $$
DECLARE
  has_orders BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.orders LIMIT 1) INTO has_orders;

  IF has_orders THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Current Pack Sizes in Database:';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
  END IF;
END $$;

-- Show pack size distribution if orders exist
SELECT
  pack_size,
  COUNT(*) as order_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM public.orders
WHERE pack_size IS NOT NULL
GROUP BY pack_size
ORDER BY pack_size;

-- ============================================================================
-- OPTIONAL: Query current sticker languages in use (if lighters table has data)
-- ============================================================================

DO $$
DECLARE
  has_lighters BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.lighters LIMIT 1) INTO has_lighters;

  IF has_lighters THEN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Current Sticker Languages in Database:';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
  END IF;
END $$;

-- Show sticker language distribution if lighters exist
SELECT
  sticker_language,
  COUNT(*) as lighter_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM public.lighters
WHERE sticker_language IS NOT NULL
GROUP BY sticker_language
ORDER BY lighter_count DESC;
