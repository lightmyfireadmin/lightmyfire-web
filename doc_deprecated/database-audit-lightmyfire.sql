-- =====================================================
-- 🔥 LIGHTMYFIRE DATABASE AUDIT - PERFECT EDITION 🔥
-- =====================================================
-- Tailored SPECIFICALLY for LightMyFire database
-- Zero errors. Complete coverage. Total domination.
-- =====================================================

SELECT json_build_object(
  'audit_info', json_build_object(
    'timestamp', NOW(),
    'database', current_database(),
    'postgres_version', version()
  ),

  -- ===================================================
  -- TABLES WITH FULL COLUMN DETAILS
  -- ===================================================
  'tables', (
    SELECT COALESCE(json_agg(table_info ORDER BY table_name), '[]'::json)
    FROM (
      SELECT json_build_object(
        'table_name', t.table_name,
        'columns', (
          SELECT json_agg(
            json_build_object(
              'name', c.column_name,
              'type', c.data_type,
              'nullable', c.is_nullable,
              'default', c.column_default,
              'position', c.ordinal_position
            ) ORDER BY c.ordinal_position
          )
          FROM information_schema.columns c
          WHERE c.table_schema = 'public'
            AND c.table_name = t.table_name
        )
      ) as table_info
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
    ) tables_data
  ),

  -- ===================================================
  -- FOREIGN KEY RELATIONSHIPS
  -- ===================================================
  'foreign_keys', (
    SELECT COALESCE(json_agg(fk_info), '[]'::json)
    FROM (
      SELECT json_build_object(
        'constraint_name', tc.constraint_name,
        'from_table', tc.table_name,
        'from_column', kcu.column_name,
        'to_table', ccu.table_name,
        'to_column', ccu.column_name,
        'on_delete', rc.delete_rule,
        'on_update', rc.update_rule
      ) as fk_info
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name
        AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    ) fks
  ),

  -- ===================================================
  -- INDEXES
  -- ===================================================
  'indexes', (
    SELECT COALESCE(json_agg(idx_info), '[]'::json)
    FROM (
      SELECT json_build_object(
        'table', tablename,
        'index_name', indexname,
        'definition', indexdef
      ) as idx_info
      FROM pg_indexes
      WHERE schemaname = 'public'
    ) indexes_data
  ),

  -- ===================================================
  -- RLS POLICIES
  -- ===================================================
  'rls_policies', (
    SELECT COALESCE(json_agg(policy_info), '[]'::json)
    FROM (
      SELECT json_build_object(
        'table', tablename,
        'policy_name', policyname,
        'permissive', permissive,
        'roles', roles,
        'command', cmd,
        'qual', qual,
        'with_check', with_check
      ) as policy_info
      FROM pg_policies
      WHERE schemaname = 'public'
    ) policies
  ),

  -- ===================================================
  -- FUNCTIONS (All LightMyFire functions)
  -- ===================================================
  'functions', (
    SELECT COALESCE(json_agg(func_info ORDER BY function_name), '[]'::json)
    FROM (
      SELECT json_build_object(
        'function_name', p.proname,
        'language', l.lanname,
        'return_type', pg_get_function_result(p.oid),
        'arguments', pg_get_function_arguments(p.oid),
        'function_type', CASE p.prokind
          WHEN 'f' THEN 'function'
          WHEN 'p' THEN 'procedure'
          WHEN 'a' THEN 'aggregate'
          WHEN 'w' THEN 'window'
          ELSE 'unknown'
        END,
        'volatility', CASE p.provolatile
          WHEN 'i' THEN 'immutable'
          WHEN 's' THEN 'stable'
          WHEN 'v' THEN 'volatile'
        END,
        'security_definer', p.prosecdef
      ) as func_info
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      JOIN pg_language l ON l.oid = p.prolang
      WHERE n.nspname = 'public'
        AND p.prokind IN ('f', 'p')
    ) functions_data
  ),

  -- ===================================================
  -- TRIGGERS
  -- ===================================================
  'triggers', (
    SELECT COALESCE(json_agg(trigger_info), '[]'::json)
    FROM (
      SELECT json_build_object(
        'table', event_object_table,
        'trigger_name', trigger_name,
        'event', event_manipulation,
        'timing', action_timing,
        'orientation', action_orientation,
        'function', action_statement
      ) as trigger_info
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
    ) triggers_data
  ),

  -- ===================================================
  -- ENUMS (text check constraints simulated)
  -- ===================================================
  'enums', (
    SELECT COALESCE(json_agg(enum_info ORDER BY enum_name), '[]'::json)
    FROM (
      SELECT json_build_object(
        'enum_name', t.typname,
        'values', array_agg(e.enumlabel ORDER BY e.enumsortorder)
      ) as enum_info
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE n.nspname = 'public'
      GROUP BY t.typname
    ) enums_data
  ),

  -- ===================================================
  -- TABLE STATISTICS (WORKING PATTERN)
  -- ===================================================
  'table_statistics', (
    SELECT COALESCE(json_agg(stat_info ORDER BY total_bytes DESC), '[]'::json)
    FROM (
      SELECT
        json_build_object(
          'table', stats.tablename,
          'total_size', pg_size_pretty(pg_total_relation_size(quote_ident('public')||'.'||quote_ident(stats.tablename))),
          'table_size', pg_size_pretty(pg_relation_size(quote_ident('public')||'.'||quote_ident(stats.tablename))),
          'index_size', pg_size_pretty(pg_total_relation_size(quote_ident('public')||'.'||quote_ident(stats.tablename)) - pg_relation_size(quote_ident('public')||'.'||quote_ident(stats.tablename))),
          'estimated_rows', stats.n_live_tup,
          'dead_rows', stats.n_dead_tup,
          'last_vacuum', stats.last_vacuum,
          'last_autovacuum', stats.last_autovacuum,
          'last_analyze', stats.last_analyze
        ) as stat_info,
        pg_total_relation_size(quote_ident('public')||'.'||quote_ident(stats.tablename)) as total_bytes
      FROM pg_stat_user_tables stats
      WHERE stats.schemaname = 'public'
    ) table_stats
  ),

  -- ===================================================
  -- CONSTRAINTS (PRIMARY KEYS, UNIQUE, CHECK)
  -- ===================================================
  'constraints', (
    SELECT COALESCE(json_agg(constraint_info), '[]'::json)
    FROM (
      SELECT json_build_object(
        'table', table_name,
        'constraint_name', constraint_name,
        'constraint_type', constraint_type
      ) as constraint_info
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
    ) constraints_data
  ),

  -- ===================================================
  -- SEQUENCES
  -- ===================================================
  'sequences', (
    SELECT COALESCE(json_agg(seq_info), '[]'::json)
    FROM (
      SELECT json_build_object(
        'sequence_name', sequence_name,
        'data_type', data_type,
        'start_value', start_value,
        'min_value', minimum_value,
        'max_value', maximum_value,
        'increment', increment
      ) as seq_info
      FROM information_schema.sequences
      WHERE sequence_schema = 'public'
    ) sequences_data
  ),

  -- ===================================================
  -- EXTENSIONS
  -- ===================================================
  'extensions', (
    SELECT COALESCE(json_agg(ext_info), '[]'::json)
    FROM (
      SELECT json_build_object(
        'name', extname,
        'version', extversion,
        'schema', n.nspname
      ) as ext_info
      FROM pg_extension e
      JOIN pg_namespace n ON n.oid = e.extnamespace
    ) extensions_data
  ),

  -- ===================================================
  -- STORAGE BUCKETS (Supabase)
  -- ===================================================
  'storage_buckets', (
    SELECT COALESCE(json_agg(bucket_info), '[]'::json)
    FROM (
      SELECT json_build_object(
        'id', id,
        'name', name,
        'public', public,
        'file_size_limit', file_size_limit,
        'allowed_mime_types', allowed_mime_types,
        'created_at', created_at
      ) as bucket_info
      FROM storage.buckets
    ) buckets_data
  ),

  -- ===================================================
  -- REALTIME PUBLICATIONS
  -- ===================================================
  'realtime_publications', (
    SELECT COALESCE(json_agg(pub_info), '[]'::json)
    FROM (
      SELECT json_build_object(
        'name', pubname,
        'all_tables', puballtables,
        'insert', pubinsert,
        'update', pubupdate,
        'delete', pubdelete,
        'truncate', pubtruncate
      ) as pub_info
      FROM pg_publication
    ) publications_data
  ),

  -- ===================================================
  -- LIGHTMYFIRE SPECIFIC DATA COUNTS
  -- ===================================================
  'data_summary', json_build_object(
    'total_lighters', (SELECT COUNT(*) FROM public.lighters),
    'active_lighters', (SELECT COUNT(*) FROM public.lighters WHERE is_retired = false),
    'total_posts', (SELECT COUNT(*) FROM public.posts),
    'public_posts', (SELECT COUNT(*) FROM public.posts WHERE is_public = true),
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_orders', (SELECT COUNT(*) FROM public.orders),
    'completed_orders', (SELECT COUNT(*) FROM public.orders WHERE status = 'completed'),
    'total_sticker_orders', (SELECT COUNT(*) FROM public.sticker_orders),
    'total_likes', (SELECT COUNT(*) FROM public.likes),
    'flagged_posts', (SELECT COUNT(*) FROM public.posts WHERE is_flagged = true),
    'moderation_queue_pending', (SELECT COUNT(*) FROM public.moderation_queue WHERE status = 'pending'),
    'total_trophies', (SELECT COUNT(*) FROM public.trophies),
    'trophies_earned', (SELECT COUNT(*) FROM public.user_trophies)
  ),

  -- ===================================================
  -- SUMMARY STATISTICS
  -- ===================================================
  'schema_summary', json_build_object(
    'total_tables', (
      SELECT COUNT(*)
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ),
    'total_columns', (
      SELECT COUNT(*)
      FROM information_schema.columns
      WHERE table_schema = 'public'
    ),
    'total_indexes', (
      SELECT COUNT(*)
      FROM pg_indexes
      WHERE schemaname = 'public'
    ),
    'total_foreign_keys', (
      SELECT COUNT(*)
      FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY'
    ),
    'total_rls_policies', (
      SELECT COUNT(*)
      FROM pg_policies
      WHERE schemaname = 'public'
    ),
    'total_functions', (
      SELECT COUNT(*)
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.prokind IN ('f', 'p')
    ),
    'total_triggers', (
      SELECT COUNT(*)
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
    ),
    'total_enums', (
      SELECT COUNT(DISTINCT t.typname)
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE n.nspname = 'public'
    ),
    'total_extensions', (
      SELECT COUNT(*) FROM pg_extension
    )
  )
) AS lightmyfire_audit;
