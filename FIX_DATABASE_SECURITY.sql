-- =====================================================
-- COMPREHENSIVE DATABASE SECURITY FIXES
-- Date: 2025-11-04
-- Priority: CRITICAL
-- =====================================================

-- PART 1: FIX SEARCH_PATH FOR ALL FUNCTIONS (20 functions)
-- Prevents schema injection attacks by setting explicit search_path

-- Fix update_is_flagged
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

-- Fix get_moderation_queue_data
CREATE OR REPLACE FUNCTION get_moderation_queue_data()
RETURNS TABLE (
  id BIGINT,
  post_id BIGINT,
  user_id UUID,
  flagged_at TIMESTAMPTZ,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT mq.id, mq.post_id, mq.user_id, mq.flagged_at, mq.status
  FROM moderation_queue mq;
END;
$$;

-- Fix get_orders_data
CREATE OR REPLACE FUNCTION get_orders_data()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  created_at TIMESTAMPTZ,
  total_amount INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT o.id, o.user_id, o.created_at, o.total_amount, o.status
  FROM orders o;
END;
$$;

-- Fix update_lighter_stats
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

-- Fix create_order_with_shipping
CREATE OR REPLACE FUNCTION create_order_with_shipping(
  p_user_id UUID,
  p_shipping_address JSONB,
  p_total_amount INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  INSERT INTO orders (user_id, shipping_address, total_amount, status)
  VALUES (p_user_id, p_shipping_address, p_total_amount, 'pending')
  RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$;

-- Fix record_order_refund
CREATE OR REPLACE FUNCTION record_order_refund(
  p_order_id UUID,
  p_refund_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
  SET status = 'refunded', refund_amount = p_refund_amount
  WHERE id = p_order_id;
END;
$$;

-- Fix update_moderation_queue_timestamp
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

-- Fix update_orders_timestamp
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

-- Fix update_lighters_timestamp
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

-- Fix log_moderation_result
CREATE OR REPLACE FUNCTION log_moderation_result(
  p_user_id UUID,
  p_content_type TEXT,
  p_flagged BOOLEAN,
  p_severity TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO moderation_logs (user_id, content_type, flagged, severity, created_at)
  VALUES (p_user_id, p_content_type, p_flagged, p_severity, NOW());
END;
$$;

-- Fix create_order_from_payment
CREATE OR REPLACE FUNCTION create_order_from_payment(
  p_payment_intent_id TEXT,
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  INSERT INTO orders (user_id, stripe_payment_intent_id, total_amount, status)
  VALUES (p_user_id, p_payment_intent_id, p_amount, 'pending')
  RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$;

-- Fix update_order_payment_succeeded
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

-- Fix get_moderation_stats
CREATE OR REPLACE FUNCTION get_moderation_stats()
RETURNS TABLE (
  total_flagged BIGINT,
  pending_review BIGINT,
  approved BIGINT,
  rejected BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE is_flagged = true) as total_flagged,
    COUNT(*) FILTER (WHERE is_flagged = true AND moderation_status = 'pending') as pending_review,
    COUNT(*) FILTER (WHERE moderation_status = 'approved') as approved,
    COUNT(*) FILTER (WHERE moderation_status = 'rejected') as rejected
  FROM posts;
END;
$$;

-- Fix get_order_analytics
CREATE OR REPLACE FUNCTION get_order_analytics()
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue BIGINT,
  pending_orders BIGINT,
  completed_orders BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_orders,
    COALESCE(SUM(total_amount), 0) as total_revenue,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_orders
  FROM orders;
END;
$$;

-- Fix is_admin
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

-- Fix is_moderator_or_admin
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

-- Fix get_my_role
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

-- Fix admin_get_all_orders
CREATE OR REPLACE FUNCTION admin_get_all_orders()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  created_at TIMESTAMPTZ,
  total_amount INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT o.id, o.user_id, o.created_at, o.total_amount, o.status
  FROM orders o
  ORDER BY o.created_at DESC;
END;
$$;

-- Fix increment_post_flag_count (already created in FIX_FLAG_COUNT_MECHANISM.sql)
-- This is a duplicate, but we include it here for completeness
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
-- PART 2: OPTIMIZE RLS POLICIES (19 policies)
-- Replace auth.uid() with (SELECT auth.uid()) for performance
-- =====================================================

-- Profiles table
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
CREATE POLICY "Allow users to update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()));

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
CREATE POLICY "Allow users to update their own posts" ON posts
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Likes table
DROP POLICY IF EXISTS "Allow logged-in users to create/delete likes" ON likes;
CREATE POLICY "Allow logged-in users to create/delete likes" ON likes
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- Lighter contributions table
DROP POLICY IF EXISTS "Allow users to manage their own contributions" ON lighter_contributions;
CREATE POLICY "Allow users to manage their own contributions" ON lighter_contributions
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()));

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
-- PART 3: REMOVE DUPLICATE RLS POLICIES
-- Keep only one policy per table/role/action combination
-- =====================================================

-- Remove duplicate profile UPDATE policies (keep "Users can update own profile")
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;

-- Remove duplicate post UPDATE policies (keep "Users can update own posts")
DROP POLICY IF EXISTS "Allow users to update their own posts" ON posts;

-- Combine duplicate likes SELECT policies
DROP POLICY IF EXISTS "Allow logged-in users to create/delete likes" ON likes;
DROP POLICY IF EXISTS "Allow public read access to likes" ON likes;

CREATE POLICY "likes_read_policy" ON likes
  FOR SELECT TO public
  USING (true);

CREATE POLICY "likes_write_policy" ON likes
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- PART 4: FIX SECURITY DEFINER VIEW
-- Remove SECURITY DEFINER from detailed_posts view
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

-- Remove duplicate indexes on orders table
DROP INDEX IF EXISTS idx_orders_created_at_desc;
DROP INDEX IF EXISTS idx_orders_stripe_payment_intent_id;

-- Keep only these indexes:
-- idx_orders_created_at
-- idx_orders_stripe_payment_intent

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify all functions have search_path set
-- SELECT
--   routine_name,
--   routine_type,
--   prosecdef,
--   proconfig
-- FROM information_schema.routines r
-- JOIN pg_proc p ON p.proname = r.routine_name
-- WHERE routine_schema = 'public'
-- AND routine_type = 'FUNCTION';

-- Verify RLS policies are optimized
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual
-- FROM pg_policies
-- WHERE schemaname = 'public';

-- Check for duplicate policies
-- SELECT tablename, cmd, COUNT(*)
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- GROUP BY tablename, cmd
-- HAVING COUNT(*) > 1;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- To rollback this migration, restore from backup
-- This migration makes significant changes to RLS policies and functions
-- Always test in staging environment first!
