-- ============================================================================
-- COMPREHENSIVE SUPABASE DATABASE AUDIT - SINGLE BATCH QUERY
-- ============================================================================
-- This query returns complete database schema information including:
-- - Tables, columns, types, constraints
-- - Foreign key relationships
-- - Indexes
-- - RLS policies
-- - Functions/RPCs
-- - Triggers
-- - Storage buckets and policies
-- - Enums and custom types
-- - Views
-- - Roles and grants
-- ============================================================================

-- Enable expanded display for better readability
\x auto

-- ============================================================================
-- SECTION 1: ALL TABLES WITH COLUMNS, TYPES, AND CONSTRAINTS
-- ============================================================================
\echo '============================================================================'
\echo 'SECTION 1: TABLES AND COLUMNS'
\echo '============================================================================'

SELECT
  t.table_schema,
  t.table_name,
  json_agg(
    json_build_object(
      'column_name', c.column_name,
      'ordinal_position', c.ordinal_position,
      'data_type', c.data_type,
      'udt_name', c.udt_name,
      'character_maximum_length', c.character_maximum_length,
      'is_nullable', c.is_nullable,
      'column_default', c.column_default,
      'is_identity', c.is_identity,
      'identity_generation', c.identity_generation,
      'is_generated', c.is_generated,
      'generation_expression', c.generation_expression
    ) ORDER BY c.ordinal_position
  ) AS columns
FROM information_schema.tables t
LEFT JOIN information_schema.columns c
  ON t.table_schema = c.table_schema
  AND t.table_name = c.table_name
WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND t.table_type = 'BASE TABLE'
GROUP BY t.table_schema, t.table_name
ORDER BY t.table_schema, t.table_name;

-- ============================================================================
-- SECTION 2: PRIMARY KEYS AND UNIQUE CONSTRAINTS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 2: PRIMARY KEYS AND UNIQUE CONSTRAINTS'
\echo '============================================================================'

SELECT
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  array_agg(kcu.column_name ORDER BY kcu.ordinal_position) AS columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_schema = kcu.constraint_schema
  AND tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema')
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
GROUP BY tc.table_schema, tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_schema, tc.table_name, tc.constraint_type;

-- ============================================================================
-- SECTION 3: FOREIGN KEY RELATIONSHIPS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 3: FOREIGN KEY RELATIONSHIPS'
\echo '============================================================================'

SELECT
  tc.table_schema,
  tc.table_name AS from_table,
  kcu.column_name AS from_column,
  ccu.table_schema AS to_schema,
  ccu.table_name AS to_table,
  ccu.column_name AS to_column,
  tc.constraint_name,
  rc.update_rule,
  rc.delete_rule
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
ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;

-- ============================================================================
-- SECTION 4: INDEXES
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 4: INDEXES'
\echo '============================================================================'

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY schemaname, tablename, indexname;

-- ============================================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 5: ROW LEVEL SECURITY POLICIES'
\echo '============================================================================'

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS command,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename, policyname;

-- ============================================================================
-- SECTION 6: RLS ENABLED STATUS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 6: RLS ENABLED STATUS ON TABLES'
\echo '============================================================================'

SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY n.nspname, c.relname;

-- ============================================================================
-- SECTION 7: FUNCTIONS AND STORED PROCEDURES (RPCs)
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 7: FUNCTIONS AND STORED PROCEDURES'
\echo '============================================================================'

SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  pg_get_function_result(p.oid) AS return_type,
  l.lanname AS language,
  CASE p.provolatile
    WHEN 'i' THEN 'IMMUTABLE'
    WHEN 's' THEN 'STABLE'
    WHEN 'v' THEN 'VOLATILE'
  END AS volatility,
  CASE p.prosecdef
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_language l ON l.oid = p.prolang
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND p.prokind IN ('f', 'p')  -- functions and procedures
ORDER BY n.nspname, p.proname;

-- ============================================================================
-- SECTION 8: TRIGGERS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 8: TRIGGERS'
\echo '============================================================================'

SELECT
  trigger_schema,
  trigger_name,
  event_manipulation AS event,
  event_object_schema AS table_schema,
  event_object_table AS table_name,
  action_timing AS timing,
  action_orientation AS orientation,
  action_statement AS action
FROM information_schema.triggers
WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY event_object_schema, event_object_table, trigger_name;

-- ============================================================================
-- SECTION 9: ENUMS AND CUSTOM TYPES
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 9: ENUMS AND CUSTOM TYPES'
\echo '============================================================================'

SELECT
  n.nspname AS schema_name,
  t.typname AS type_name,
  CASE t.typtype
    WHEN 'e' THEN 'enum'
    WHEN 'c' THEN 'composite'
    WHEN 'd' THEN 'domain'
    WHEN 'r' THEN 'range'
    ELSE t.typtype::text
  END AS type_category,
  CASE
    WHEN t.typtype = 'e' THEN
      array_to_string(
        array_agg(e.enumlabel ORDER BY e.enumsortorder),
        ', '
      )
    ELSE NULL
  END AS enum_values
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND t.typtype IN ('e', 'c', 'd', 'r')
GROUP BY n.nspname, t.typname, t.typtype
ORDER BY n.nspname, t.typname;

-- ============================================================================
-- SECTION 10: VIEWS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 10: VIEWS'
\echo '============================================================================'

SELECT
  table_schema AS schema_name,
  table_name AS view_name,
  view_definition
FROM information_schema.views
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

-- ============================================================================
-- SECTION 11: STORAGE BUCKETS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 11: STORAGE BUCKETS'
\echo '============================================================================'

SELECT
  id,
  name,
  owner,
  created_at,
  updated_at,
  public,
  avif_autodetection,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- ============================================================================
-- SECTION 12: STORAGE POLICIES
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 12: STORAGE POLICIES'
\echo '============================================================================'

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS command,
  qual AS using_expression
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;

-- ============================================================================
-- SECTION 13: DATABASE ROLES AND GRANTS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 13: DATABASE ROLES'
\echo '============================================================================'

SELECT
  rolname AS role_name,
  rolsuper AS is_superuser,
  rolinherit AS can_inherit,
  rolcreaterole AS can_create_role,
  rolcreatedb AS can_create_db,
  rolcanlogin AS can_login,
  rolreplication AS can_replicate,
  rolbypassrls AS can_bypass_rls,
  rolconnlimit AS connection_limit
FROM pg_roles
WHERE rolname NOT LIKE 'pg_%'
  AND rolname NOT LIKE 'supabase_%'
ORDER BY rolname;

-- ============================================================================
-- SECTION 14: TABLE GRANTS AND PERMISSIONS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 14: TABLE GRANTS'
\echo '============================================================================'

SELECT
  table_schema,
  table_name,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name, grantee, privilege_type;

-- ============================================================================
-- SECTION 15: SEQUENCES
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 15: SEQUENCES'
\echo '============================================================================'

SELECT
  sequence_schema,
  sequence_name,
  data_type,
  start_value,
  minimum_value,
  maximum_value,
  increment,
  cycle_option
FROM information_schema.sequences
WHERE sequence_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY sequence_schema, sequence_name;

-- ============================================================================
-- SECTION 16: CHECK CONSTRAINTS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 16: CHECK CONSTRAINTS'
\echo '============================================================================'

SELECT
  tc.table_schema,
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
  AND tc.constraint_schema = cc.constraint_schema
WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema')
  AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;

-- ============================================================================
-- SECTION 17: TABLE SIZES AND ROW COUNTS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 17: TABLE SIZES AND STATISTICS'
\echo '============================================================================'

SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
  n_live_tup AS estimated_row_count,
  n_dead_tup AS dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- SECTION 18: EXTENSIONS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 18: INSTALLED EXTENSIONS'
\echo '============================================================================'

SELECT
  extname AS extension_name,
  extversion AS version,
  nspname AS schema,
  extrelocatable AS is_relocatable,
  extconfig AS configuration_tables
FROM pg_extension
JOIN pg_namespace ON pg_namespace.oid = pg_extension.extnamespace
ORDER BY extname;

-- ============================================================================
-- SECTION 19: MATERIALIZED VIEWS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 19: MATERIALIZED VIEWS'
\echo '============================================================================'

SELECT
  schemaname,
  matviewname AS view_name,
  matviewowner AS owner,
  tablespace,
  hasindexes,
  ispopulated,
  definition
FROM pg_matviews
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, matviewname;

-- ============================================================================
-- SECTION 20: REALTIME PUBLICATIONS (Supabase Realtime)
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 20: REALTIME PUBLICATIONS'
\echo '============================================================================'

SELECT
  pubname AS publication_name,
  puballtables AS publishes_all_tables,
  pubinsert AS publishes_insert,
  pubupdate AS publishes_update,
  pubdelete AS publishes_delete,
  pubtruncate AS publishes_truncate
FROM pg_publication
ORDER BY pubname;

-- ============================================================================
-- SECTION 21: PUBLICATION TABLES (Realtime enabled tables)
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'SECTION 21: REALTIME ENABLED TABLES'
\echo '============================================================================'

SELECT
  pub.pubname AS publication_name,
  n.nspname AS schema_name,
  c.relname AS table_name
FROM pg_publication pub
JOIN pg_publication_rel pr ON pr.prpubid = pub.oid
JOIN pg_class c ON c.oid = pr.prrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
ORDER BY pub.pubname, n.nspname, c.relname;

-- ============================================================================
-- SUMMARY STATISTICS
-- ============================================================================
\echo ''
\echo '============================================================================'
\echo 'DATABASE SUMMARY STATISTICS'
\echo '============================================================================'

SELECT
  'Tables' AS category,
  COUNT(*) AS count
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  AND table_type = 'BASE TABLE'

UNION ALL

SELECT
  'Columns' AS category,
  COUNT(*) AS count
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')

UNION ALL

SELECT
  'Foreign Keys' AS category,
  COUNT(*) AS count
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_schema NOT IN ('pg_catalog', 'information_schema')

UNION ALL

SELECT
  'Indexes' AS category,
  COUNT(*) AS count
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')

UNION ALL

SELECT
  'RLS Policies' AS category,
  COUNT(*) AS count
FROM pg_policies
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')

UNION ALL

SELECT
  'Functions/RPCs' AS category,
  COUNT(*) AS count
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND p.prokind IN ('f', 'p')

UNION ALL

SELECT
  'Triggers' AS category,
  COUNT(*) AS count
FROM information_schema.triggers
WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')

UNION ALL

SELECT
  'Views' AS category,
  COUNT(*) AS count
FROM information_schema.views
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')

UNION ALL

SELECT
  'Storage Buckets' AS category,
  COUNT(*) AS count
FROM storage.buckets

UNION ALL

SELECT
  'Enums' AS category,
  COUNT(*) AS count
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND t.typtype = 'e'

ORDER BY category;

\echo ''
\echo '============================================================================'
\echo 'DATABASE AUDIT COMPLETE'
\echo '============================================================================'
