-- ============================================================================
-- LightMyFire Supabase Database Migration - Comprehensive Fixes
-- ============================================================================
-- This migration fixes all known database issues including:
-- 1. toggle_like RPC ambiguous column reference
-- 2. posts foreign key constraint violations
-- 3. Missing profile creation trigger
-- 4. Orphaned data cleanup
-- ============================================================================

-- ============================================================================
-- PART 1: Fix toggle_like RPC Function
-- ============================================================================
-- Drop the existing function that has ambiguous user_id column
DROP FUNCTION IF EXISTS toggle_like(uuid);

-- Recreate with proper table prefixes to avoid ambiguity
CREATE OR REPLACE FUNCTION toggle_like(p_post_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_existing_like_id uuid;
  v_result json;
BEGIN
  -- Get the current user's ID from auth context
  v_user_id := auth.uid();

  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Check if like already exists (use explicit table prefix)
  SELECT likes.id INTO v_existing_like_id
  FROM likes
  WHERE likes.post_id = p_post_id
    AND likes.user_id = v_user_id;

  IF v_existing_like_id IS NOT NULL THEN
    -- Unlike: delete the existing like
    DELETE FROM likes WHERE likes.id = v_existing_like_id;
    v_result := json_build_object(
      'action', 'unliked',
      'post_id', p_post_id,
      'success', true
    );
  ELSE
    -- Like: insert new like
    INSERT INTO likes (post_id, user_id, created_at)
    VALUES (p_post_id, v_user_id, NOW());
    v_result := json_build_object(
      'action', 'liked',
      'post_id', p_post_id,
      'success', true
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION toggle_like(uuid) TO authenticated;

-- ============================================================================
-- PART 2: Ensure All Auth Users Have Profiles
-- ============================================================================
-- Create profiles for any auth users who don't have one yet
-- This fixes the foreign key constraint issue
INSERT INTO profiles (id, username, created_at, level, points)
SELECT
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'username',
    SPLIT_PART(au.email, '@', 1),
    'User_' || SUBSTRING(au.id::text, 1, 8)
  ) as username,
  au.created_at,
  1 as level,
  0 as points
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 3: Create/Update Profile Auto-Creation Trigger
-- ============================================================================
-- Drop existing trigger first, then the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the trigger function that auto-creates profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, created_at, level, points)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'username',
      SPLIT_PART(NEW.email, '@', 1),
      'User_' || SUBSTRING(NEW.id::text, 1, 8)
    ),
    NEW.created_at,
    1,
    0
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PART 4: Data Integrity Checks and Orphan Cleanup
-- ============================================================================
-- Check for orphaned posts (posts without valid user_id in profiles)
-- Comment out the DELETE if you want to review first
DO $$
DECLARE
  orphaned_count integer;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM posts p
  LEFT JOIN profiles prof ON p.user_id = prof.id
  WHERE prof.id IS NULL;

  IF orphaned_count > 0 THEN
    RAISE NOTICE '% orphaned posts found. Review them before cleanup.', orphaned_count;
    -- UNCOMMENT to delete orphaned posts:
    -- DELETE FROM posts p
    -- WHERE NOT EXISTS (SELECT 1 FROM profiles prof WHERE prof.id = p.user_id);
  ELSE
    RAISE NOTICE 'No orphaned posts found.';
  END IF;
END $$;

-- Check for orphaned likes
DO $$
DECLARE
  orphaned_count integer;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM likes l
  LEFT JOIN profiles prof ON l.user_id = prof.id
  WHERE prof.id IS NULL;

  IF orphaned_count > 0 THEN
    RAISE NOTICE '% orphaned likes found. Review them before cleanup.', orphaned_count;
    -- UNCOMMENT to delete orphaned likes:
    -- DELETE FROM likes l
    -- WHERE NOT EXISTS (SELECT 1 FROM profiles prof WHERE prof.id = l.user_id);
  ELSE
    RAISE NOTICE 'No orphaned likes found.';
  END IF;
END $$;

-- Check for lighters without valid savers
DO $$
DECLARE
  orphaned_count integer;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM lighters l
  LEFT JOIN profiles prof ON l.saver_id = prof.id
  WHERE l.saver_id IS NOT NULL AND prof.id IS NULL;

  IF orphaned_count > 0 THEN
    RAISE NOTICE '% lighters with invalid saver_id found.', orphaned_count;
    -- UNCOMMENT to set saver_id to NULL for orphaned lighters:
    -- UPDATE lighters l
    -- SET saver_id = NULL
    -- WHERE saver_id IS NOT NULL
    --   AND NOT EXISTS (SELECT 1 FROM profiles prof WHERE prof.id = l.saver_id);
  ELSE
    RAISE NOTICE 'No lighters with invalid saver_id found.';
  END IF;
END $$;

-- ============================================================================
-- PART 5: Verify Foreign Key Constraints
-- ============================================================================
-- Ensure foreign key constraints are properly set up
DO $$
BEGIN
  -- Check if posts.user_id FK exists, create if not
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'posts_user_id_fkey'
  ) THEN
    ALTER TABLE posts
    ADD CONSTRAINT posts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    RAISE NOTICE 'Created posts_user_id_fkey constraint';
  ELSE
    RAISE NOTICE 'posts_user_id_fkey constraint already exists';
  END IF;

  -- Check if likes.user_id FK exists, create if not
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'likes_user_id_fkey'
  ) THEN
    ALTER TABLE likes
    ADD CONSTRAINT likes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    RAISE NOTICE 'Created likes_user_id_fkey constraint';
  ELSE
    RAISE NOTICE 'likes_user_id_fkey constraint already exists';
  END IF;
END $$;

-- ============================================================================
-- PART 6: Verification Queries (Run these to check everything is fixed)
-- ============================================================================
-- Count total users and profiles
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM posts) as total_posts,
  (SELECT COUNT(*) FROM likes) as total_likes;

-- Check for any remaining orphaned records
SELECT 'Orphaned Posts' as check_type, COUNT(*) as count
FROM posts p
LEFT JOIN profiles prof ON p.user_id = prof.id
WHERE prof.id IS NULL
UNION ALL
SELECT 'Orphaned Likes', COUNT(*)
FROM likes l
LEFT JOIN profiles prof ON l.user_id = prof.id
WHERE prof.id IS NULL
UNION ALL
SELECT 'Invalid Lighter Savers', COUNT(*)
FROM lighters l
LEFT JOIN profiles prof ON l.saver_id = prof.id
WHERE l.saver_id IS NOT NULL AND prof.id IS NULL;

-- ============================================================================
-- PART 7: Enable Row Level Security (RLS) on All Tables
-- ============================================================================
-- Enable RLS to prevent unauthorized data access
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighters ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 8: Create RLS Policies for Profiles Table
-- ============================================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- SELECT: Everyone can read all profiles
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- INSERT: Authenticated users can create own profile
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: Users can only delete their own profile
CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- ============================================================================
-- PART 9: Create RLS Policies for Posts Table
-- ============================================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "posts_select_all" ON posts;
DROP POLICY IF EXISTS "posts_insert_own" ON posts;
DROP POLICY IF EXISTS "posts_update_own" ON posts;
DROP POLICY IF EXISTS "posts_delete_own" ON posts;

-- SELECT: Everyone can read all posts
CREATE POLICY "posts_select_all"
  ON posts FOR SELECT
  USING (true);

-- INSERT: Authenticated users can create posts
CREATE POLICY "posts_insert_own"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own posts
CREATE POLICY "posts_update_own"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own posts
CREATE POLICY "posts_delete_own"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 10: Create RLS Policies for Likes Table
-- ============================================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "likes_select_all" ON likes;
DROP POLICY IF EXISTS "likes_insert_own" ON likes;
DROP POLICY IF EXISTS "likes_delete_own" ON likes;

-- SELECT: Everyone can read likes
CREATE POLICY "likes_select_all"
  ON likes FOR SELECT
  USING (true);

-- INSERT: Authenticated users can create likes
CREATE POLICY "likes_insert_own"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only unlike their own likes
CREATE POLICY "likes_delete_own"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 11: Create RLS Policies for Lighters Table
-- ============================================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "lighters_select_all" ON lighters;
DROP POLICY IF EXISTS "lighters_insert_own" ON lighters;
DROP POLICY IF EXISTS "lighters_update_saver" ON lighters;
DROP POLICY IF EXISTS "lighters_delete_own" ON lighters;

-- SELECT: Everyone can read all lighters
CREATE POLICY "lighters_select_all"
  ON lighters FOR SELECT
  USING (true);

-- INSERT: Authenticated users can create lighters (saver_id = current user)
CREATE POLICY "lighters_insert_own"
  ON lighters FOR INSERT
  WITH CHECK (auth.uid() = saver_id);

-- UPDATE: Only saver (current owner) can update lighter
CREATE POLICY "lighters_update_saver"
  ON lighters FOR UPDATE
  USING (auth.uid() = saver_id)
  WITH CHECK (auth.uid() = saver_id);

-- DELETE: Only saver can delete lighter
CREATE POLICY "lighters_delete_own"
  ON lighters FOR DELETE
  USING (auth.uid() = saver_id);

-- ============================================================================
-- EXECUTION COMPLETE
-- ============================================================================
-- After running this migration:
-- 1. The toggle_like function should work without ambiguous column errors
-- 2. All auth users will have corresponding profiles
-- 3. New users will automatically get profiles via trigger
-- 4. Foreign key constraints are properly enforced
-- 5. No orphaned data should remain (if cleanup was uncommented)
-- 6. ✅ ROW LEVEL SECURITY (RLS) is now enabled on all tables
-- 7. ✅ All policies enforce that users can only modify their own data
-- ============================================================================
