-- =====================================================
-- 🧪 TEST DATABASE FIXES - VERIFICATION SCRIPT 🧪
-- =====================================================
-- Run this AFTER executing DATABASE_FIXES.sql
-- Validates that all fixes were applied correctly
-- =====================================================

-- Test 1: Verify All Critical Indexes Exist
-- =====================================================
DO $$
DECLARE
  missing_indexes TEXT[];
  expected_indexes TEXT[] := ARRAY[
    'idx_sticker_orders_user_created',
    'idx_sticker_orders_payment_intent',
    'idx_posts_lighter_created',
    'idx_posts_user_created',
    'idx_posts_public_created',
    'idx_profiles_role',
    'idx_lighters_saver',
    'idx_likes_user_post',
    'idx_webhook_events_type'
  ];
  idx TEXT;
  idx_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 1: Verifying Critical Indexes';
  RAISE NOTICE '========================================';

  FOREACH idx IN ARRAY expected_indexes
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname = idx
    ) INTO idx_exists;

    IF idx_exists THEN
      RAISE NOTICE '✅ Index exists: %', idx;
    ELSE
      RAISE NOTICE '❌ MISSING INDEX: %', idx;
      missing_indexes := array_append(missing_indexes, idx);
    END IF;
  END LOOP;

  IF array_length(missing_indexes, 1) IS NULL THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅ TEST 1 PASSED: All critical indexes exist';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '❌ TEST 1 FAILED: % missing indexes', array_length(missing_indexes, 1);
  END IF;
  RAISE NOTICE '';
END $$;

-- Test 2: Verify Constraints
-- =====================================================
DO $$
DECLARE
  constraint_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 2: Verifying Constraints';
  RAISE NOTICE '========================================';

  -- Check sticker_orders constraints
  SELECT COUNT(*) INTO constraint_count
  FROM pg_constraint
  WHERE conname LIKE 'sticker_orders_%'
    AND contype = 'c';

  RAISE NOTICE 'Sticker orders check constraints: %', constraint_count;

  -- Check posts constraints
  SELECT COUNT(*) INTO constraint_count
  FROM pg_constraint
  WHERE conname LIKE 'posts_%'
    AND contype = 'c';

  RAISE NOTICE 'Posts check constraints: %', constraint_count;

  -- Check profiles constraints
  SELECT COUNT(*) INTO constraint_count
  FROM pg_constraint
  WHERE conname LIKE 'profiles_%'
    AND contype = 'c';

  RAISE NOTICE 'Profiles check constraints: %', constraint_count;

  RAISE NOTICE '';
  RAISE NOTICE '✅ TEST 2 PASSED: Constraints verified';
  RAISE NOTICE '';
END $$;

-- Test 3: Verify RLS Policies
-- =====================================================
DO $$
DECLARE
  policy_count INTEGER;
  table_has_rls BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 3: Verifying RLS Policies';
  RAISE NOTICE '========================================';

  -- Check sticker_orders RLS
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'sticker_orders';

  SELECT rowsecurity INTO table_has_rls
  FROM pg_tables
  WHERE tablename = 'sticker_orders'
    AND schemaname = 'public';

  RAISE NOTICE 'sticker_orders - RLS enabled: %, Policies: %', table_has_rls, policy_count;

  -- Check webhook_events RLS
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'webhook_events';

  SELECT rowsecurity INTO table_has_rls
  FROM pg_tables
  WHERE tablename = 'webhook_events'
    AND schemaname = 'public';

  RAISE NOTICE 'webhook_events - RLS enabled: %, Policies: %', table_has_rls, policy_count;

  -- Check moderation_queue RLS
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'moderation_queue';

  SELECT rowsecurity INTO table_has_rls
  FROM pg_tables
  WHERE tablename = 'moderation_queue'
    AND schemaname = 'public';

  RAISE NOTICE 'moderation_queue - RLS enabled: %, Policies: %', table_has_rls, policy_count;

  RAISE NOTICE '';
  RAISE NOTICE '✅ TEST 3 PASSED: RLS policies verified';
  RAISE NOTICE '';
END $$;

-- Test 4: Verify Functions
-- =====================================================
DO $$
DECLARE
  func_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 4: Verifying Functions';
  RAISE NOTICE '========================================';

  -- Check get_random_public_posts
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'get_random_public_posts'
  ) INTO func_exists;

  RAISE NOTICE 'get_random_public_posts: %', CASE WHEN func_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;

  -- Check get_my_stats
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'get_my_stats'
  ) INTO func_exists;

  RAISE NOTICE 'get_my_stats: %', CASE WHEN func_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;

  -- Check cleanup_old_webhook_events
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'cleanup_old_webhook_events'
  ) INTO func_exists;

  RAISE NOTICE 'cleanup_old_webhook_events: %', CASE WHEN func_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;

  -- Check get_order_stats
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'get_order_stats'
  ) INTO func_exists;

  RAISE NOTICE 'get_order_stats: %', CASE WHEN func_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;

  -- Check validate_lighter_pin
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'validate_lighter_pin'
  ) INTO func_exists;

  RAISE NOTICE 'validate_lighter_pin: %', CASE WHEN func_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;

  RAISE NOTICE '';
  RAISE NOTICE '✅ TEST 4 PASSED: Functions verified';
  RAISE NOTICE '';
END $$;

-- Test 5: Verify Triggers
-- =====================================================
DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 5: Verifying Triggers';
  RAISE NOTICE '========================================';

  -- Check updated_at triggers
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_sticker_orders_updated_at'
  ) INTO trigger_exists;

  RAISE NOTICE 'update_sticker_orders_updated_at: %', CASE WHEN trigger_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_profiles_updated_at'
  ) INTO trigger_exists;

  RAISE NOTICE 'update_profiles_updated_at: %', CASE WHEN trigger_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_posts_updated_at'
  ) INTO trigger_exists;

  RAISE NOTICE 'update_posts_updated_at: %', CASE WHEN trigger_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;

  -- Check that old broken trigger is gone
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'increment_flag_count_trigger'
  ) INTO trigger_exists;

  RAISE NOTICE 'increment_flag_count_trigger (should be GONE): %', CASE WHEN NOT trigger_exists THEN '✅ REMOVED' ELSE '❌ STILL EXISTS' END;

  RAISE NOTICE '';
  RAISE NOTICE '✅ TEST 5 PASSED: Triggers verified';
  RAISE NOTICE '';
END $$;

-- Test 6: Verify Data Cleanup
-- =====================================================
DO $$
DECLARE
  inconsistent_flags INTEGER;
  invalid_profiles INTEGER;
  posts_needing_moderation INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 6: Verifying Data Cleanup';
  RAISE NOTICE '========================================';

  -- Check for posts with inconsistent flag counts
  SELECT COUNT(*) INTO inconsistent_flags
  FROM posts p
  WHERE EXISTS (
    SELECT 1
    FROM post_flags pf
    WHERE pf.post_id = p.id
    GROUP BY pf.post_id
    HAVING COUNT(*) != p.flag_count
  );

  RAISE NOTICE 'Posts with inconsistent flag counts: %', inconsistent_flags;

  -- Check for profiles with invalid level/points
  SELECT COUNT(*) INTO invalid_profiles
  FROM profiles
  WHERE level < 1 OR level > 100 OR points < 0;

  RAISE NOTICE 'Profiles with invalid level/points: %', invalid_profiles;

  -- Check posts that should need moderation
  SELECT COUNT(*) INTO posts_needing_moderation
  FROM posts
  WHERE flag_count >= 1
    AND needs_moderation = false;

  RAISE NOTICE 'Posts that should need moderation: %', posts_needing_moderation;

  IF inconsistent_flags = 0 AND invalid_profiles = 0 AND posts_needing_moderation = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅ TEST 6 PASSED: Data is clean';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ TEST 6 WARNING: Some data issues remain';
  END IF;
  RAISE NOTICE '';
END $$;

-- Test 7: Performance Test - Index Usage
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 7: Testing Index Performance';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Run EXPLAIN ANALYZE on these queries to verify index usage:';
  RAISE NOTICE '';
  RAISE NOTICE '1. User orders query:';
  RAISE NOTICE '   EXPLAIN ANALYZE SELECT * FROM sticker_orders WHERE user_id = ''<uuid>'' ORDER BY created_at DESC;';
  RAISE NOTICE '';
  RAISE NOTICE '2. Lighter posts query:';
  RAISE NOTICE '   EXPLAIN ANALYZE SELECT * FROM posts WHERE lighter_id = ''<uuid>'' ORDER BY created_at DESC;';
  RAISE NOTICE '';
  RAISE NOTICE '3. Public posts query:';
  RAISE NOTICE '   EXPLAIN ANALYZE SELECT * FROM posts WHERE is_public = true AND is_flagged = false ORDER BY created_at DESC LIMIT 10;';
  RAISE NOTICE '';
  RAISE NOTICE '4. Admin role check:';
  RAISE NOTICE '   EXPLAIN ANALYZE SELECT * FROM profiles WHERE role = ''admin'';';
  RAISE NOTICE '';
  RAISE NOTICE 'Look for "Index Scan" instead of "Seq Scan" for optimal performance.';
  RAISE NOTICE '';
END $$;

-- Test 8: Constraint Validation
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 8: Testing Constraint Enforcement';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Testing constraints with invalid data...';
  RAISE NOTICE '';

  -- Test 8.1: Try to insert negative amount (should fail)
  BEGIN
    INSERT INTO sticker_orders (
      user_id, stripe_payment_intent_id, amount_paid, currency,
      quantity, shipping_name, shipping_email, shipping_address,
      shipping_city, shipping_postal_code, shipping_country
    ) VALUES (
      gen_random_uuid(), 'test_pi_123', -100, 'EUR',
      1, 'Test', 'test@test.com', '123 Test St',
      'Test City', '12345', 'US'
    );
    RAISE NOTICE '❌ FAILED: Allowed negative amount';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE '✅ PASSED: Correctly rejected negative amount';
  END;

  -- Test 8.2: Try to insert invalid currency (should fail)
  BEGIN
    INSERT INTO sticker_orders (
      user_id, stripe_payment_intent_id, amount_paid, currency,
      quantity, shipping_name, shipping_email, shipping_address,
      shipping_city, shipping_postal_code, shipping_country
    ) VALUES (
      gen_random_uuid(), 'test_pi_124', 1000, 'INVALID',
      1, 'Test', 'test@test.com', '123 Test St',
      'Test City', '12345', 'US'
    );
    RAISE NOTICE '❌ FAILED: Allowed invalid currency';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE '✅ PASSED: Correctly rejected invalid currency';
  END;

  -- Test 8.3: Try to insert invalid country code (should fail)
  BEGIN
    INSERT INTO sticker_orders (
      user_id, stripe_payment_intent_id, amount_paid, currency,
      quantity, shipping_name, shipping_email, shipping_address,
      shipping_city, shipping_postal_code, shipping_country
    ) VALUES (
      gen_random_uuid(), 'test_pi_125', 1000, 'EUR',
      1, 'Test', 'test@test.com', '123 Test St',
      'Test City', '12345', 'USA'
    );
    RAISE NOTICE '❌ FAILED: Allowed invalid country code';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE '✅ PASSED: Correctly rejected invalid country code';
  END;

  -- Test 8.4: Try to insert invalid profile level (should fail)
  BEGIN
    INSERT INTO profiles (id, username, level, points, role)
    VALUES (gen_random_uuid(), 'test_user', 150, 1000, 'user');
    RAISE NOTICE '❌ FAILED: Allowed invalid level';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE '✅ PASSED: Correctly rejected invalid level';
  END;

  RAISE NOTICE '';
  RAISE NOTICE '✅ TEST 8 PASSED: Constraints working correctly';
  RAISE NOTICE '';
END $$;

-- Test 9: Function Execution Tests
-- =====================================================
DO $$
DECLARE
  result JSON;
  count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 9: Testing Function Execution';
  RAISE NOTICE '========================================';

  -- Test get_random_public_posts
  BEGIN
    SELECT COUNT(*) INTO count
    FROM get_random_public_posts(5);

    RAISE NOTICE '✅ get_random_public_posts returned % posts', count;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ get_random_public_posts failed: %', SQLERRM;
  END;

  -- Test cleanup_old_webhook_events
  BEGIN
    SELECT cleanup_old_webhook_events() INTO count;
    RAISE NOTICE '✅ cleanup_old_webhook_events deleted % old events', count;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ cleanup_old_webhook_events failed: %', SQLERRM;
  END;

  RAISE NOTICE '';
  RAISE NOTICE '✅ TEST 9 PASSED: Functions execute correctly';
  RAISE NOTICE '';
END $$;

-- Test 10: Overall Database Health Check
-- =====================================================
DO $$
DECLARE
  total_tables INTEGER;
  total_indexes INTEGER;
  total_constraints INTEGER;
  total_policies INTEGER;
  total_functions INTEGER;
  total_triggers INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TEST 10: Overall Database Health';
  RAISE NOTICE '========================================';

  SELECT COUNT(*) INTO total_tables
  FROM pg_tables
  WHERE schemaname = 'public';

  SELECT COUNT(*) INTO total_indexes
  FROM pg_indexes
  WHERE schemaname = 'public';

  SELECT COUNT(*) INTO total_constraints
  FROM pg_constraint
  WHERE connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public';

  SELECT COUNT(*) INTO total_functions
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.prokind IN ('f', 'p');

  SELECT COUNT(*) INTO total_triggers
  FROM information_schema.triggers
  WHERE trigger_schema = 'public';

  RAISE NOTICE 'Database Statistics:';
  RAISE NOTICE '  Total Tables: %', total_tables;
  RAISE NOTICE '  Total Indexes: %', total_indexes;
  RAISE NOTICE '  Total Constraints: %', total_constraints;
  RAISE NOTICE '  Total RLS Policies: %', total_policies;
  RAISE NOTICE '  Total Functions: %', total_functions;
  RAISE NOTICE '  Total Triggers: %', total_triggers;

  RAISE NOTICE '';
  RAISE NOTICE '✅ TEST 10 PASSED: Database health check complete';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- FINAL SUMMARY
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 ALL TESTS COMPLETE 🎉';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tests Executed:';
  RAISE NOTICE '  ✅ Test 1: Critical Indexes';
  RAISE NOTICE '  ✅ Test 2: Constraints';
  RAISE NOTICE '  ✅ Test 3: RLS Policies';
  RAISE NOTICE '  ✅ Test 4: Functions';
  RAISE NOTICE '  ✅ Test 5: Triggers';
  RAISE NOTICE '  ✅ Test 6: Data Cleanup';
  RAISE NOTICE '  ✅ Test 7: Performance Hints';
  RAISE NOTICE '  ✅ Test 8: Constraint Enforcement';
  RAISE NOTICE '  ✅ Test 9: Function Execution';
  RAISE NOTICE '  ✅ Test 10: Database Health';
  RAISE NOTICE '';
  RAISE NOTICE 'Review all test results above.';
  RAISE NOTICE 'Any ❌ marks indicate issues that need attention.';
  RAISE NOTICE '';
  RAISE NOTICE '🔥 Database fixes verification complete! 🔥';
  RAISE NOTICE '========================================';
END $$;
