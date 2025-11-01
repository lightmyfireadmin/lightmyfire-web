-- ============================================================================
-- LightMyFire Supabase Security Fixes
-- ============================================================================
-- This script fixes all security warnings and errors from Supabase linter:
-- 1. Security Definer View ERROR (detailed_posts)
-- 2. Function Search Path Mutable WARNINGS (15 functions)
-- ============================================================================

-- ============================================================================
-- 1. FIX: SECURITY DEFINER VIEW
-- ============================================================================
-- Issue: View detailed_posts is defined with SECURITY DEFINER property
-- Fix: Remove SECURITY DEFINER to enforce RLS policies of querying user

DROP VIEW IF EXISTS public.detailed_posts CASCADE;

CREATE OR REPLACE VIEW public.detailed_posts AS
SELECT
  p.id,
  p.user_id,
  p.lighter_id,
  p.title,
  p.post_type,
  p.content_text,
  p.content_url,
  p.location_name,
  p.location_lat,
  p.location_lng,
  p.created_at,
  p.is_flagged,
  p.flag_count,
  u.username,
  u.nationality,
  u.show_nationality,
  u.role,
  l.name as lighter_name,
  l.color as lighter_color,
  (
    SELECT COUNT(*)::int FROM public.post_likes pl
    WHERE pl.post_id = p.id
  ) AS like_count
FROM
  public.posts p
  LEFT JOIN public.profiles u ON u.id = p.user_id
  LEFT JOIN public.lighters l ON l.id = p.lighter_id
WHERE
  p.is_flagged = FALSE;

GRANT SELECT ON public.detailed_posts TO authenticated, anon;

-- ============================================================================
-- 2. FIX: FUNCTION SEARCH PATH MUTABLE
-- ============================================================================
-- Issue: 15 functions have role mutable search_path
-- Fix: Add "SET search_path = public" to each function definition
--
-- Functions to fix:
-- 1. create_new_post
-- 2. update_is_flagged
-- 3. toggle_like (2 instances)
-- 4. calculate_distance
-- 5. reinstate_post
-- 6. update_lighter_stats
-- 7. delete_post_by_moderator
-- 8. get_random_public_posts
-- 9. create_new_lighter
-- 10. get_lighter_id_from_pin
-- 11. generate_random_pin
-- 12. flag_post
-- 13. get_my_stats
-- 14. grant_trophy
-- 15. backfill_all_trophies

-- Note: Since we cannot query the exact current function definitions from here,
-- use one of these approaches:
--
-- APPROACH 1: Run this query in Supabase SQL Editor to get all function definitions:
--
-- SELECT pg_get_functiondef(oid)
-- FROM pg_proc
-- WHERE proname IN (
--   'create_new_post', 'update_is_flagged', 'toggle_like', 'calculate_distance',
--   'reinstate_post', 'update_lighter_stats', 'delete_post_by_moderator',
--   'get_random_public_posts', 'create_new_lighter', 'get_lighter_id_from_pin',
--   'generate_random_pin', 'flag_post', 'get_my_stats', 'grant_trophy',
--   'backfill_all_trophies'
-- )
-- AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
--
-- APPROACH 2: Manually edit each function in Supabase UI:
-- 1. Go to Database → Functions
-- 2. For each function listed above:
--    a. Edit the function
--    b. Add "SET search_path = public" before the AS keyword
--    c. Example:
--       CREATE OR REPLACE FUNCTION function_name(params)
--       RETURNS type
--       LANGUAGE plpgsql
--       SECURITY DEFINER
--       SET search_path = public  <-- ADD THIS LINE
--       AS $$
--       BEGIN
--         ...
--       END;
--       $$;
-- 3. Deploy the changes

-- Example template for one function (toggle_like):
-- This is already fixed in supabase_migration_fix_all.sql, just shown here as reference:
--
-- CREATE OR REPLACE FUNCTION public.toggle_like(p_post_id uuid)
-- RETURNS json
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
-- BEGIN
--   -- function body
-- END
-- $$;

-- ============================================================================
-- VERIFICATION SCRIPT
-- ============================================================================
-- Run this after making the changes to verify security issues are fixed:
--
-- Query the Supabase Linter API to check:
-- All ERRORS should be 0
-- All WARNINGS should be 0 (except maybe auth_leaked_password_protection which is a setting)

-- This query checks if search_path is set on functions:
SELECT
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition,
  CASE
    WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN 'FIXED'
    ELSE 'NEEDS FIX'
  END as status
FROM pg_proc p
WHERE p.proname IN (
  'create_new_post', 'update_is_flagged', 'toggle_like', 'calculate_distance',
  'reinstate_post', 'update_lighter_stats', 'delete_post_by_moderator',
  'get_random_public_posts', 'create_new_lighter', 'get_lighter_id_from_pin',
  'generate_random_pin', 'flag_post', 'get_my_stats', 'grant_trophy',
  'backfill_all_trophies'
)
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY p.proname;

-- ============================================================================
-- MANUAL FIX INSTRUCTIONS
-- ============================================================================
-- Since each function may have different parameters and implementations,
-- the best approach is to:
--
-- 1. Log into Supabase Dashboard
-- 2. Navigate to Database → Functions
-- 3. For each function in the list above:
--    - Click on the function name
--    - Click "Edit function"
--    - Add "SET search_path = public," before the AS keyword
--    - Click "Confirm"
-- 4. After fixing all 15 functions, enable leaked password protection:
--    - Go to Authentication → Settings
--    - Under "Security", toggle "Leaked password protection" ON
--    - Click "Save"
-- 5. Run the linter again to verify all issues are fixed

-- ============================================================================
-- FINAL NOTE
-- ============================================================================
-- The detailed_posts view fix above can be applied directly.
-- For the 15 functions, you'll need to manually edit each one or provide
-- their current definitions so they can be recreated with SET search_path = public.
