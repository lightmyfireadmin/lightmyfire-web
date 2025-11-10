-- ============================================================================
-- COMPREHENSIVE SUPABASE DATABASE AUDIT - JSON OUTPUT (FIXED)
-- ============================================================================
-- This returns a single JSON result with all database schema information
-- Run this in Supabase SQL Editor for easy copy/paste
-- Works in both Supabase UI and psql
-- ============================================================================

SELECT json_build_object(
  'audit_timestamp', NOW(),
  'database_name', current_database(),

  -- TABLES AND COLUMNS
  'tables', (
    SELECT json_agg(
      json_build_object(
        'schema', t.table_schema,
        'name', t.table_name,
        'columns', (
          SELECT json_agg(
            json_build_object(
              'name', c.column_name,
              'position', c.ordinal_position,
              'type', c.data_type,
              'udt_name', c.udt_name,
              'max_length', c.character_maximum_length,
              'nullable', c.is_nullable,
              'default', c.column_default,
              'is_identity', c.is_identity,
              'is_generated', c.is_generated
            ) ORDER BY c.ordinal_position
          )
          FROM information_schema.columns c
          WHERE c.table_schema = t.table_schema
            AND c.table_name = t.table_name
        )
      ) ORDER BY t.table_schema, t.table_name
    )
    FROM information_schema.tables t
    WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND t.table_type = 'BASE TABLE'
  ),

  -- PRIMARY KEYS
  'primary_keys', (
    SELECT json_agg(
      json_build_object(
        'schema', tc.table_schema,
        'table', tc.table_name,
        'constraint_name', tc.constraint_name,
        'columns', (
          SELECT array_agg(kcu.column_name ORDER BY kcu.ordinal_position)
          FROM information_schema.key_column_usage kcu
          WHERE kcu.constraint_schema = tc.constraint_schema
            AND kcu.constraint_name = tc.constraint_name
        )
      ) ORDER BY tc.table_schema, tc.table_name
    )
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema')
      AND tc.constraint_type = 'PRIMARY KEY'
  ),

  -- FOREIGN KEYS
  'foreign_keys', (
    SELECT json_agg(
      json_build_object(
        'schema', tc.table_schema,
        'from_table', tc.table_name,
        'from_column', kcu.column_name,
        'to_schema', ccu.table_schema,
        'to_table', ccu.table_name,
        'to_column', ccu.column_name,
        'constraint_name', tc.constraint_name,
        'update_rule', rc.update_rule,
        'delete_rule', rc.delete_rule
      ) ORDER BY tc.table_schema, tc.table_name, tc.constraint_name
    )
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
      AND tc.table_schema = rc.constraint_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
  ),

  -- INDEXES
  'indexes', (
    SELECT json_agg(
      json_build_object(
        'schema', schemaname,
        'table', tablename,
        'name', indexname,
        'definition', indexdef
      ) ORDER BY schemaname, tablename, indexname
    )
    FROM pg_indexes
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  ),

  -- RLS POLICIES
  'rls_policies', (
    SELECT json_agg(
      json_build_object(
        'schema', schemaname,
        'table', tablename,
        'name', policyname,
        'permissive', permissive,
        'roles', roles,
        'command', cmd,
        'using', qual,
        'with_check', with_check
      ) ORDER BY schemaname, tablename, policyname
    )
    FROM pg_policies
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  ),

  -- RLS ENABLED TABLES
  'rls_enabled', (
    SELECT json_agg(
      json_build_object(
        'schema', n.nspname,
        'table', c.relname,
        'enabled', c.relrowsecurity,
        'forced', c.relforcerowsecurity
      ) ORDER BY n.nspname, c.relname
    )
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  ),

  -- FUNCTIONS (RPCs) - Fixed to avoid nested aggregates
  'functions', (
    SELECT json_agg(
      json_build_object(
        'schema', n.nspname,
        'name', p.proname,
        'arguments', pg_get_function_arguments(p.oid),
        'return_type', pg_get_function_result(p.oid),
        'language', l.lanname,
        'volatility', CASE p.provolatile
          WHEN 'i' THEN 'IMMUTABLE'
          WHEN 's' THEN 'STABLE'
          WHEN 'v' THEN 'VOLATILE'
        END,
        'security', CASE p.prosecdef
          WHEN true THEN 'SECURITY DEFINER'
          ELSE 'SECURITY INVOKER'
        END
      ) ORDER BY n.nspname, p.proname
    )
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_language l ON l.oid = p.prolang
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
      AND p.prokind IN ('f', 'p')
  ),

  -- TRIGGERS
  'triggers', (
    SELECT json_agg(
      json_build_object(
        'schema', trigger_schema,
        'name', trigger_name,
        'event', event_manipulation,
        'table_schema', event_object_schema,
        'table', event_object_table,
        'timing', action_timing,
        'orientation', action_orientation,
        'statement', action_statement
      ) ORDER BY event_object_schema, event_object_table, trigger_name
    )
    FROM information_schema.triggers
    WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
  ),

  -- ENUMS - Fixed to avoid nested aggregates
  'enums', (
    SELECT json_agg(enum_data ORDER BY schema_name, type_name)
    FROM (
      SELECT
        n.nspname AS schema_name,
        t.typname AS type_name,
        json_build_object(
          'schema', n.nspname,
          'name', t.typname,
          'values', array_agg(e.enumlabel ORDER BY e.enumsortorder)
        ) AS enum_data
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
        AND t.typtype = 'e'
      GROUP BY n.nspname, t.typname
    ) AS enums
  ),

  -- VIEWS
  'views', (
    SELECT json_agg(
      json_build_object(
        'schema', table_schema,
        'name', table_name,
        'definition', view_definition
      ) ORDER BY table_schema, table_name
    )
    FROM information_schema.views
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  ),

  -- STORAGE BUCKETS
  'storage_buckets', (
    SELECT json_agg(
      json_build_object(
        'id', id,
        'name', name,
        'owner', owner,
        'public', public,
        'file_size_limit', file_size_limit,
        'allowed_mime_types', allowed_mime_types,
        'created_at', created_at,
        'updated_at', updated_at
      ) ORDER BY name
    )
    FROM storage.buckets
  ),

  -- CHECK CONSTRAINTS
  'check_constraints', (
    SELECT json_agg(
      json_build_object(
        'schema', tc.table_schema,
        'table', tc.table_name,
        'name', tc.constraint_name,
        'check_clause', cc.check_clause
      ) ORDER BY tc.table_schema, tc.table_name, tc.constraint_name
    )
    FROM information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc
      ON tc.constraint_name = cc.constraint_name
      AND tc.constraint_schema = cc.constraint_schema
    WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema')
      AND tc.constraint_type = 'CHECK'
  ),

  -- SEQUENCES
  'sequences', (
    SELECT json_agg(
      json_build_object(
        'schema', sequence_schema,
        'name', sequence_name,
        'data_type', data_type,
        'start_value', start_value,
        'increment', increment,
        'minimum_value', minimum_value,
        'maximum_value', maximum_value,
        'cycle_option', cycle_option
      ) ORDER BY sequence_schema, sequence_name
    )
    FROM information_schema.sequences
    WHERE sequence_schema NOT IN ('pg_catalog', 'information_schema')
  ),

  -- EXTENSIONS
  'extensions', (
    SELECT json_agg(
      json_build_object(
        'name', extname,
        'version', extversion,
        'schema', nspname,
        'relocatable', extrelocatable
      ) ORDER BY extname
    )
    FROM pg_extension
    JOIN pg_namespace ON pg_namespace.oid = pg_extension.extnamespace
  ),

  -- REALTIME PUBLICATIONS
  'realtime_publications', (
    SELECT json_agg(
      json_build_object(
        'name', pubname,
        'all_tables', puballtables,
        'insert', pubinsert,
        'update', pubupdate,
        'delete', pubdelete,
        'truncate', pubtruncate
      ) ORDER BY pubname
    )
    FROM pg_publication
  ),

  -- REALTIME ENABLED TABLES
  'realtime_tables', (
    SELECT json_agg(
      json_build_object(
        'publication', pub.pubname,
        'schema', n.nspname,
        'table', c.relname
      ) ORDER BY pub.pubname, n.nspname, c.relname
    )
    FROM pg_publication pub
    JOIN pg_publication_rel pr ON pr.prpubid = pub.oid
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
  ),

  -- TABLE SIZES AND STATISTICS
  'table_statistics', (
    SELECT json_agg(
      json_build_object(
        'schema', schemaname,
        'table', tablename,
        'total_size', pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)),
        'table_size', pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)),
        'indexes_size', pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)),
        'estimated_rows', n_live_tup,
        'dead_rows', n_dead_tup,
        'last_vacuum', last_vacuum,
        'last_autovacuum', last_autovacuum,
        'last_analyze', last_analyze
      ) ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    )
    FROM pg_stat_user_tables
  ),

  -- SUMMARY STATISTICS
  'summary', json_build_object(
    'total_tables', (
      SELECT COUNT(*)
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND table_type = 'BASE TABLE'
    ),
    'total_columns', (
      SELECT COUNT(*)
      FROM information_schema.columns
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ),
    'total_foreign_keys', (
      SELECT COUNT(*)
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
    ),
    'total_indexes', (
      SELECT COUNT(*)
      FROM pg_indexes
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    ),
    'total_rls_policies', (
      SELECT COUNT(*)
      FROM pg_policies
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    ),
    'total_functions', (
      SELECT COUNT(*)
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
        AND p.prokind IN ('f', 'p')
    ),
    'total_triggers', (
      SELECT COUNT(*)
      FROM information_schema.triggers
      WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
    ),
    'total_views', (
      SELECT COUNT(*)
      FROM information_schema.views
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ),
    'total_storage_buckets', (
      SELECT COUNT(*) FROM storage.buckets
    ),
    'total_enums', (
      SELECT COUNT(DISTINCT t.typname)
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
        AND t.typtype = 'e'
    )
  )
) AS database_audit;
