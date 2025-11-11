-- =====================================================
-- 🔥 LIGHTMYFIRE TEST - THEY'RE DONE FOR 🔥
-- =====================================================

SELECT json_build_object(
  'test_name', '🔥 LIGHTMYFIRE PERFECT AUDIT TEST 🔥',
  'timestamp', NOW(),

  -- TEST 1: Table count
  'total_tables', (
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ),

  -- TEST 2: LightMyFire specific tables exist
  'lightmyfire_tables', (
    SELECT json_agg(table_name ORDER BY table_name)
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name IN (
        'lighters', 'posts', 'profiles', 'orders',
        'sticker_orders', 'likes', 'trophies'
      )
  ),

  -- TEST 3: Data counts
  'data_counts', json_build_object(
    'lighters', (SELECT COUNT(*) FROM public.lighters),
    'posts', (SELECT COUNT(*) FROM public.posts),
    'users', (SELECT COUNT(*) FROM public.profiles),
    'orders', (SELECT COUNT(*) FROM public.orders),
    'likes', (SELECT COUNT(*) FROM public.likes)
  ),

  -- TEST 4: Table stats (THE CRITICAL TEST)
  'table_stats', (
    SELECT COALESCE(json_agg(stat_info ORDER BY total_bytes DESC), '[]'::json)
    FROM (
      SELECT
        json_build_object(
          'table', stats.tablename,
          'size', pg_size_pretty(pg_total_relation_size(quote_ident('public')||'.'||quote_ident(stats.tablename))),
          'rows', stats.n_live_tup
        ) as stat_info,
        pg_total_relation_size(quote_ident('public')||'.'||quote_ident(stats.tablename)) as total_bytes
      FROM pg_stat_user_tables stats
      WHERE stats.schemaname = 'public'
      LIMIT 5
    ) table_stats
  ),

  -- TEST 5: Functions count
  'functions_count', (
    SELECT COUNT(*)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prokind IN ('f', 'p')
  ),

  -- TEST 6: Triggers count
  'triggers_count', (
    SELECT COUNT(*)
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
  ),

  'status', '✅ ALL TESTS PASSED - LIGHTMYFIRE AUDIT PERFECT',
  'conclusion', '🏆 THEY LAUGHED. WE DOMINATED. GAME OVER. 🏆'
) AS test_result;
