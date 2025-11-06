-- ============================================================================
-- LightMyFire Database Fixes
-- Based on Database Audit 2025-11-06
-- ============================================================================
--
-- This migration fixes:
-- 1. Pack size constraint mismatch (5,10,25,50 → 10,20,50)
-- 2. Sticker language constraint (6 languages → 27 languages)
-- 3. Multiple permissive RLS policies on likes table
-- 4. Multiple permissive RLS policies on post_flags table
--
-- NOTE: Leaked password protection must be enabled manually in Supabase Dashboard
-- Auth > Settings > Password Policy > Enable "Leaked Password Protection"
-- ============================================================================

BEGIN;

-- ============================================================================
-- FIX 1: Update pack_size constraint on orders table
-- ============================================================================
-- Current: CHECK (pack_size IN (5, 10, 25, 50))
-- Product Spec: 10, 20, 50 stickers
-- Note: 20 stickers = 2 sheets of 10, as per product specification

-- Drop existing constraint
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_pack_size_check;

-- Add new constraint with correct pack sizes
ALTER TABLE public.orders
ADD CONSTRAINT orders_pack_size_check
CHECK (pack_size IN (10, 20, 50));

COMMENT ON CONSTRAINT orders_pack_size_check ON public.orders IS
'Pack sizes: 10 (Starting LightSaver), 20 (Committed LightSaver), 50 (Community LightSaver)';

-- ============================================================================
-- FIX 2: Update sticker_language constraint on lighters table
-- ============================================================================
-- Current: CHECK (sticker_language IN ('en', 'fr', 'es', 'de', 'it', 'pt'))
-- Product Spec: All 27 supported languages

-- Drop existing constraint
ALTER TABLE public.lighters
DROP CONSTRAINT IF EXISTS lighters_sticker_language_check;

-- Add new constraint with all 27 languages
ALTER TABLE public.lighters
ADD CONSTRAINT lighters_sticker_language_check
CHECK (sticker_language IN (
  'en',    -- English
  'fr',    -- French
  'es',    -- Spanish
  'de',    -- German
  'it',    -- Italian
  'pt',    -- Portuguese
  'nl',    -- Dutch
  'ru',    -- Russian
  'pl',    -- Polish
  'ja',    -- Japanese
  'ko',    -- Korean
  'zh-CN', -- Chinese (Simplified)
  'th',    -- Thai
  'vi',    -- Vietnamese
  'hi',    -- Hindi
  'ar',    -- Arabic
  'fa',    -- Farsi/Persian
  'ur',    -- Urdu
  'mr',    -- Marathi
  'te',    -- Telugu
  'id',    -- Indonesian
  'uk',    -- Ukrainian
  'tr'     -- Turkish
));

COMMENT ON CONSTRAINT lighters_sticker_language_check ON public.lighters IS
'Sticker language must be one of the 27 supported languages';

-- ============================================================================
-- FIX 3: Optimize RLS policies on likes table
-- ============================================================================
-- Current: 2 separate permissive policies causing performance overhead
-- likes_read_policy: SELECT for public
-- likes_write_policy: ALL for authenticated (checks user_id = auth.uid())

-- Drop existing policies
DROP POLICY IF EXISTS "likes_read_policy" ON public.likes;
DROP POLICY IF EXISTS "likes_write_policy" ON public.likes;

-- Create optimized combined policies
-- Policy 1: Public read access
CREATE POLICY "likes_select_policy"
ON public.likes
FOR SELECT
TO public
USING (true);

-- Policy 2: Authenticated users can insert their own likes
CREATE POLICY "likes_insert_policy"
ON public.likes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy 3: Authenticated users can delete their own likes
CREATE POLICY "likes_delete_policy"
ON public.likes
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

COMMENT ON POLICY "likes_select_policy" ON public.likes IS
'All likes are publicly visible';

COMMENT ON POLICY "likes_insert_policy" ON public.likes IS
'Users can only like posts as themselves';

COMMENT ON POLICY "likes_delete_policy" ON public.likes IS
'Users can only unlike their own likes';

-- ============================================================================
-- FIX 4: Optimize RLS policies on post_flags table
-- ============================================================================
-- Current: 2 separate permissive SELECT policies causing performance overhead
-- "Users can see their own flags": SELECT for own flags
-- "Moderators can see all flags": SELECT for moderators

-- Drop existing policies
DROP POLICY IF EXISTS "Users can see their own flags" ON public.post_flags;
DROP POLICY IF EXISTS "Moderators can see all flags" ON public.post_flags;
DROP POLICY IF EXISTS "Users can flag posts" ON public.post_flags;

-- Create optimized combined policies
-- Policy 1: Users see own flags, moderators see all
CREATE POLICY "post_flags_select_policy"
ON public.post_flags
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
);

-- Policy 2: Authenticated users can flag posts
CREATE POLICY "post_flags_insert_policy"
ON public.post_flags
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can delete their own flags (unflag)
CREATE POLICY "post_flags_delete_policy"
ON public.post_flags
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

COMMENT ON POLICY "post_flags_select_policy" ON public.post_flags IS
'Users see own flags; moderators and admins see all flags';

COMMENT ON POLICY "post_flags_insert_policy" ON public.post_flags IS
'Users can flag posts as inappropriate';

COMMENT ON POLICY "post_flags_delete_policy" ON public.post_flags IS
'Users can remove their own flags';

-- ============================================================================
-- OPTIONAL FIX 5: Add cached post_count to lighters for performance
-- ============================================================================
-- This adds a denormalized post count column to avoid COUNT queries

-- Add column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'lighters'
    AND column_name = 'post_count'
  ) THEN
    ALTER TABLE public.lighters ADD COLUMN post_count integer NOT NULL DEFAULT 0;
    COMMENT ON COLUMN public.lighters.post_count IS 'Cached count of posts for this lighter';
  END IF;
END $$;

-- Create index for queries that filter by post count
CREATE INDEX IF NOT EXISTS idx_lighters_post_count
ON public.lighters(post_count)
WHERE post_count > 0;

-- Initialize post_count with current values
UPDATE public.lighters
SET post_count = (
  SELECT COUNT(*)
  FROM public.posts
  WHERE posts.lighter_id = lighters.id
);

-- Create function to update post_count
CREATE OR REPLACE FUNCTION public.update_lighter_post_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.lighters
    SET post_count = post_count + 1
    WHERE id = NEW.lighter_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.lighters
    SET post_count = GREATEST(0, post_count - 1)
    WHERE id = OLD.lighter_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger to automatically update post_count
DROP TRIGGER IF EXISTS update_lighter_post_count_trigger ON public.posts;
CREATE TRIGGER update_lighter_post_count_trigger
AFTER INSERT OR DELETE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_lighter_post_count();

COMMENT ON FUNCTION public.update_lighter_post_count() IS
'Automatically maintains the post_count cache on lighters table';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify pack sizes constraint
DO $$
BEGIN
  RAISE NOTICE 'Verifying orders.pack_size constraint...';
  PERFORM 1 FROM information_schema.check_constraints
  WHERE constraint_schema = 'public'
    AND constraint_name = 'orders_pack_size_check'
    AND check_clause LIKE '%10%20%50%';

  IF FOUND THEN
    RAISE NOTICE '✓ Pack size constraint updated successfully';
  ELSE
    RAISE WARNING '✗ Pack size constraint update may have failed';
  END IF;
END $$;

-- Verify sticker language constraint
DO $$
BEGIN
  RAISE NOTICE 'Verifying lighters.sticker_language constraint...';
  PERFORM 1 FROM information_schema.check_constraints
  WHERE constraint_schema = 'public'
    AND constraint_name = 'lighters_sticker_language_check'
    AND check_clause LIKE '%zh-CN%'; -- Check for one of the new languages

  IF FOUND THEN
    RAISE NOTICE '✓ Sticker language constraint updated successfully (27 languages)';
  ELSE
    RAISE WARNING '✗ Sticker language constraint update may have failed';
  END IF;
END $$;

-- Verify likes policies
DO $$
DECLARE
  policy_count integer;
BEGIN
  RAISE NOTICE 'Verifying likes table RLS policies...';
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'likes';

  RAISE NOTICE '✓ Likes table now has % policies (should be 3)', policy_count;
END $$;

-- Verify post_flags policies
DO $$
DECLARE
  policy_count integer;
BEGIN
  RAISE NOTICE 'Verifying post_flags table RLS policies...';
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'post_flags';

  RAISE NOTICE '✓ Post_flags table now has % policies (should be 3)', policy_count;
END $$;

-- Verify post_count column and trigger
DO $$
BEGIN
  RAISE NOTICE 'Verifying post_count optimization...';
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'lighters'
      AND column_name = 'post_count'
  ) THEN
    RAISE NOTICE '✓ post_count column added successfully';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_lighter_post_count_trigger'
  ) THEN
    RAISE NOTICE '✓ post_count trigger created successfully';
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- POST-MIGRATION CHECKLIST
-- ============================================================================
--
-- [ ] Run this migration script via Supabase SQL Editor
-- [ ] Verify all checks passed (see NOTICE messages above)
-- [ ] Test creating order with pack_size = 20 (should succeed)
-- [ ] Test creating order with pack_size = 25 (should fail)
-- [ ] Test creating lighter with sticker_language = 'ja' (should succeed)
-- [ ] Test toggle_like() function (should work with new policies)
-- [ ] Test flag_post() function (should work with new policies)
-- [ ] Enable "Leaked Password Protection" in Supabase Dashboard:
--     Auth → Settings → Password Policy → Enable HIBP integration
-- [ ] Update DATABASE_SPECIFICATION.md to reflect these changes
--
-- ============================================================================

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================
--
-- If you need to rollback these changes, run the following:
--
-- BEGIN;
--
-- -- Rollback pack_size constraint
-- ALTER TABLE public.orders DROP CONSTRAINT orders_pack_size_check;
-- ALTER TABLE public.orders ADD CONSTRAINT orders_pack_size_check
--   CHECK (pack_size IN (5, 10, 25, 50));
--
-- -- Rollback sticker_language constraint
-- ALTER TABLE public.lighters DROP CONSTRAINT lighters_sticker_language_check;
-- ALTER TABLE public.lighters ADD CONSTRAINT lighters_sticker_language_check
--   CHECK (sticker_language IN ('en', 'fr', 'es', 'de', 'it', 'pt'));
--
-- -- Rollback likes policies (restore original)
-- DROP POLICY IF EXISTS "likes_select_policy" ON public.likes;
-- DROP POLICY IF EXISTS "likes_insert_policy" ON public.likes;
-- DROP POLICY IF EXISTS "likes_delete_policy" ON public.likes;
-- CREATE POLICY "likes_read_policy" ON public.likes FOR SELECT TO public USING (true);
-- CREATE POLICY "likes_write_policy" ON public.likes FOR ALL TO authenticated
--   USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
--
-- -- Rollback post_flags policies (restore original)
-- DROP POLICY IF EXISTS "post_flags_select_policy" ON public.post_flags;
-- DROP POLICY IF EXISTS "post_flags_insert_policy" ON public.post_flags;
-- DROP POLICY IF EXISTS "post_flags_delete_policy" ON public.post_flags;
-- CREATE POLICY "Users can see their own flags" ON public.post_flags FOR SELECT TO authenticated
--   USING (user_id = auth.uid());
-- CREATE POLICY "Moderators can see all flags" ON public.post_flags FOR SELECT TO authenticated
--   USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin')));
-- CREATE POLICY "Users can flag posts" ON public.post_flags FOR INSERT TO authenticated
--   WITH CHECK (user_id = auth.uid());
--
-- -- Rollback post_count optimization
-- DROP TRIGGER IF EXISTS update_lighter_post_count_trigger ON public.posts;
-- DROP FUNCTION IF EXISTS public.update_lighter_post_count();
-- ALTER TABLE public.lighters DROP COLUMN IF EXISTS post_count;
-- DROP INDEX IF EXISTS idx_lighters_post_count;
--
-- COMMIT;
--
-- ============================================================================
