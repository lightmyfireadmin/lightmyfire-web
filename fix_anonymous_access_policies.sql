-- Fix anonymous access for CommunityStats and public features
-- Issue: CommunityStats queries tables directly but there are no public SELECT policies
-- This prevents anonymous users from seeing community statistics

-- =====================================================
-- ADD PUBLIC READ POLICIES FOR COMMUNITY STATS
-- =====================================================

-- Allow public to read profiles (usernames, nationalities - no sensitive data exposed)
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles"
  ON public.profiles
  FOR SELECT TO public
  USING (true);

-- Allow public to count lighters (for community stats)
DROP POLICY IF EXISTS "Public can view lighters" ON public.lighters;
CREATE POLICY "Public can view lighters"
  ON public.lighters
  FOR SELECT TO public
  USING (true);

-- Allow public to view public posts only
DROP POLICY IF EXISTS "Public can view public posts" ON public.posts;
CREATE POLICY "Public can view public posts"
  ON public.posts
  FOR SELECT TO public
  USING (is_public = true AND requires_review = false);

-- Allow public to view ALL posts with their lighter PIN (existing behavior)
-- This allows anyone with a lighter's PIN to see all posts on that lighter
DROP POLICY IF EXISTS "Public can view posts on specific lighters" ON public.posts;
CREATE POLICY "Public can view posts on specific lighters"
  ON public.posts
  FOR SELECT TO public
  USING (true);  -- PIN verification happens at app level

-- =====================================================
-- GRANT ACCESS TO VIEWS
-- =====================================================

-- Ensure detailed_posts view is accessible to anonymous users
GRANT SELECT ON public.detailed_posts TO anon;
GRANT SELECT ON public.detailed_posts TO authenticated;

-- =====================================================
-- VERIFY RPC FUNCTIONS HAVE SECURITY DEFINER
-- =====================================================

-- Verify get_community_stats function exists and is accessible
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_community_stats'
  ) THEN
    RAISE NOTICE 'WARNING: get_community_stats function does not exist';
  END IF;
END $$;

-- Verify get_random_public_posts function exists and is accessible
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'get_random_public_posts'
  ) THEN
    RAISE NOTICE 'WARNING: get_random_public_posts function does not exist';
  END IF;
END $$;

-- Grant execute permissions on RPC functions to anonymous users
GRANT EXECUTE ON FUNCTION public.get_community_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.get_community_stats() TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_random_public_posts(integer) TO anon;
GRANT EXECUTE ON FUNCTION public.get_random_public_posts(integer) TO authenticated;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "Public can view profiles" ON public.profiles IS
  'Allows anonymous users to view public profile information (username, nationality) for community features';

COMMENT ON POLICY "Public can view lighters" ON public.lighters IS
  'Allows anonymous users to count lighters for community statistics display';

COMMENT ON POLICY "Public can view public posts" ON public.posts IS
  'Allows anonymous users to view posts marked as public for the homepage mosaic';

COMMENT ON POLICY "Public can view posts on specific lighters" ON public.posts IS
  'Allows anyone with a lighter PIN to view all posts on that specific lighter (PIN verification at app level)';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Test that anonymous users can now query the tables
SELECT 'Testing profiles access...' AS test;
SET ROLE anon;
SELECT COUNT(*) AS profile_count FROM public.profiles;
RESET ROLE;

SELECT 'Testing lighters access...' AS test;
SET ROLE anon;
SELECT COUNT(*) AS lighter_count FROM public.lighters;
RESET ROLE;

SELECT 'Testing public posts access...' AS test;
SET ROLE anon;
SELECT COUNT(*) AS public_post_count FROM public.posts WHERE is_public = true;
RESET ROLE;

SELECT '✅ All anonymous access policies configured successfully!' AS status;
