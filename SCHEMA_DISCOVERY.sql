-- ============================================================================
-- SUPABASE SCHEMA DISCOVERY SCRIPT
-- ============================================================================
-- Run this FIRST to discover the exact schema
-- Copy the results back to Claude Code for accurate SQL migration
-- ============================================================================

-- 1. Get all columns for the 'posts' table
SELECT
  'posts' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'posts'
ORDER BY ordinal_position;

-- 2. Get all columns for the 'lighters' table
SELECT
  'lighters' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'lighters'
ORDER BY ordinal_position;

-- 3. Get all columns for the 'profiles' table
SELECT
  'profiles' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Get all columns for the 'post_likes' table
SELECT
  'post_likes' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'post_likes'
ORDER BY ordinal_position;

-- 5. Get the definition of detailed_posts view if it exists
SELECT
  table_schema,
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public' AND table_name = 'detailed_posts';

-- 6. Get all current functions and their definitions
SELECT
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
WHERE p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND p.proname IN (
    'create_new_post', 'toggle_like', 'flag_post', 'delete_post_by_moderator',
    'reinstate_post', 'calculate_distance', 'get_random_public_posts',
    'create_new_lighter', 'get_lighter_id_from_pin', 'generate_random_pin',
    'get_my_stats', 'grant_trophy', 'backfill_all_trophies'
  )
ORDER BY p.proname;
