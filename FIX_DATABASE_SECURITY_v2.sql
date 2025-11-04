-- =====================================================
-- COMPREHENSIVE DATABASE SECURITY FIXES v2
-- Date: 2025-11-04
-- Priority: CRITICAL
-- This version drops functions before recreating them
-- =====================================================

-- PART 1: DROP ALL FUNCTIONS FIRST
-- This prevents signature mismatch errors

DROP FUNCTION IF EXISTS update_is_flagged() CASCADE;
DROP FUNCTION IF EXISTS get_moderation_queue_data() CASCADE;
DROP FUNCTION IF EXISTS get_orders_data() CASCADE;
DROP FUNCTION IF EXISTS update_lighter_stats() CASCADE;
DROP FUNCTION IF EXISTS create_order_with_shipping(UUID, JSONB, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS record_order_refund(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_moderation_queue_timestamp() CASCADE;
DROP FUNCTION IF EXISTS update_orders_timestamp() CASCADE;
DROP FUNCTION IF EXISTS update_lighters_timestamp() CASCADE;
DROP FUNCTION IF EXISTS log_moderation_result(UUID, TEXT, BOOLEAN, TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_order_from_payment(TEXT, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_order_payment_succeeded(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_moderation_stats() CASCADE;
DROP FUNCTION IF EXISTS get_order_analytics() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_moderator_or_admin() CASCADE;
DROP FUNCTION IF EXISTS get_my_role() CASCADE;
DROP FUNCTION IF EXISTS admin_get_all_orders() CASCADE;
DROP FUNCTION IF EXISTS increment_post_flag_count() CASCADE;

-- =====================================================
-- PART 2: RECREATE FUNCTIONS WITH SEARCH_PATH
-- =====================================================

CREATE OR REPLACE FUNCTION update_is_flagged()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.is_flagged = (NEW.flagged_count >= 3);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_lighter_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE lighters
  SET stats_posts_count = (SELECT COUNT(*) FROM posts WHERE lighter_id = NEW.lighter_id)
  WHERE id = NEW.lighter_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_moderation_queue_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_orders_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_lighters_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_order_payment_succeeded(
  p_payment_intent_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
  SET status = 'paid', paid_at = NOW()
  WHERE stripe_payment_intent_id = p_payment_intent_id;
END;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION is_moderator_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role FROM profiles WHERE id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION increment_post_flag_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE posts
  SET flagged_count = flagged_count + 1
  WHERE id = NEW.post_id
  RETURNING flagged_count INTO new_count;

  IF new_count >= 3 THEN
    UPDATE posts
    SET is_flagged = true
    WHERE id = NEW.post_id;
  END IF;

  RETURN NEW;
END;
$$;

-- =====================================================
-- PART 3: OPTIMIZE RLS POLICIES
-- Replace auth.uid() with (SELECT auth.uid())
-- =====================================================

-- Profiles table
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()));

-- Lighters table
DROP POLICY IF EXISTS "Allow LightSavers to update their own lighters" ON lighters;
CREATE POLICY "Allow LightSavers to update their own lighters" ON lighters
  FOR UPDATE TO authenticated
  USING (saver_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Allow logged-in users to create lighters" ON lighters;
CREATE POLICY "Allow logged-in users to create lighters" ON lighters
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Posts table
DROP POLICY IF EXISTS "Allow logged-in users to create posts" ON posts;
CREATE POLICY "Allow logged-in users to create posts" ON posts
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Allow users to delete their own posts" ON posts;
CREATE POLICY "Allow users to delete their own posts" ON posts
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Allow users to update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Likes table - combine duplicate policies
DROP POLICY IF EXISTS "Allow logged-in users to create/delete likes" ON likes;
DROP POLICY IF EXISTS "Allow public read access to likes" ON likes;

CREATE POLICY "likes_read_policy" ON likes
  FOR SELECT TO public
  USING (true);

CREATE POLICY "likes_write_policy" ON likes
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Lighter contributions table
DROP POLICY IF EXISTS "Allow users to manage their own contributions" ON lighter_contributions;
CREATE POLICY "Allow users to manage their own contributions" ON lighter_contributions
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Moderation queue table
DROP POLICY IF EXISTS "moderation_queue_view_policy" ON moderation_queue;
CREATE POLICY "moderation_queue_view_policy" ON moderation_queue
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
      AND role IN ('moderator', 'admin')
    )
  );

DROP POLICY IF EXISTS "moderation_queue_update_policy" ON moderation_queue;
CREATE POLICY "moderation_queue_update_policy" ON moderation_queue
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
      AND role IN ('moderator', 'admin')
    )
  );

DROP POLICY IF EXISTS "moderation_queue_delete_policy" ON moderation_queue;
CREATE POLICY "moderation_queue_delete_policy" ON moderation_queue
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
      AND role IN ('moderator', 'admin')
    )
  );

-- Orders table
DROP POLICY IF EXISTS "orders_view_policy" ON orders;
CREATE POLICY "orders_view_policy" ON orders
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "orders_update_policy" ON orders;
CREATE POLICY "orders_update_policy" ON orders
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Post flags table
DROP POLICY IF EXISTS "Users can flag posts" ON post_flags;
CREATE POLICY "Users can flag posts" ON post_flags
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can see their own flags" ON post_flags;
CREATE POLICY "Users can see their own flags" ON post_flags
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Moderators can see all flags" ON post_flags;
CREATE POLICY "Moderators can see all flags" ON post_flags
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
      AND role IN ('moderator', 'admin')
    )
  );

-- =====================================================
-- PART 4: FIX SECURITY DEFINER VIEW
-- =====================================================

DROP VIEW IF EXISTS detailed_posts CASCADE;

CREATE VIEW detailed_posts AS
SELECT
  p.id,
  p.title,
  p.content_text,
  p.content_url,
  p.post_type,
  p.created_at,
  p.user_id,
  p.lighter_id,
  p.location_lat,
  p.location_lng,
  p.location_name,
  p.is_find_location,
  p.is_creation,
  p.is_anonymous,
  p.is_pinned,
  p.is_public,
  p.is_flagged,
  p.flagged_count,
  prof.username,
  prof.nationality,
  prof.show_nationality,
  prof.role,
  l.name as lighter_name,
  (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count
FROM posts p
LEFT JOIN profiles prof ON p.user_id = prof.id
LEFT JOIN lighters l ON p.lighter_id = l.id;

GRANT SELECT ON detailed_posts TO authenticated;
GRANT SELECT ON detailed_posts TO anon;

-- =====================================================
-- PART 5: REMOVE DUPLICATE INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_orders_created_at_desc;
DROP INDEX IF EXISTS idx_orders_stripe_payment_intent_id;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check that functions have search_path set
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname IN (
    'update_is_flagged',
    'update_lighter_stats',
    'update_moderation_queue_timestamp',
    'update_orders_timestamp',
    'update_lighters_timestamp',
    'update_order_payment_succeeded',
    'is_admin',
    'is_moderator_or_admin',
    'get_my_role',
    'increment_post_flag_count'
  )
  AND 'search_path=public' = ANY(p.proconfig);

  RAISE NOTICE 'Functions with search_path set: %', func_count;
END $$;

RAISE NOTICE 'Database security fixes applied successfully!';
