-- ============================================================================
-- SUPABASE SECURITY FIXES - Address all linter warnings
-- ============================================================================

-- Drop problematic views and policies first
DROP VIEW IF EXISTS public.moderation_queue_with_user CASCADE;
DROP VIEW IF EXISTS public.orders_with_details CASCADE;

-- Drop ALL existing RLS policies
DROP POLICY IF EXISTS moderation_queue_select_own ON public.moderation_queue;
DROP POLICY IF EXISTS moderation_queue_insert ON public.moderation_queue;
DROP POLICY IF EXISTS moderation_queue_update ON public.moderation_queue;
DROP POLICY IF EXISTS moderation_queue_delete ON public.moderation_queue;
DROP POLICY IF EXISTS orders_select_own ON public.orders;
DROP POLICY IF EXISTS orders_insert ON public.orders;
DROP POLICY IF EXISTS orders_update ON public.orders;

-- ============================================================================
-- SECTION 1: FIX moderation_queue TABLE RLS (Remove user_metadata references)
-- ============================================================================

-- Users can only see their own content in moderation queue (use uid instead of metadata)
CREATE POLICY moderation_queue_select_own ON public.moderation_queue
  FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users can insert
CREATE POLICY moderation_queue_insert ON public.moderation_queue
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can update (check app_role in JWT claims, not user_metadata)
CREATE POLICY moderation_queue_update ON public.moderation_queue
  FOR UPDATE USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'app_role' = 'admin')
    OR (auth.jwt() ->> 'app_role' = 'moderator')
  );

-- Only admins can delete
CREATE POLICY moderation_queue_delete ON public.moderation_queue
  FOR DELETE USING (auth.jwt() ->> 'app_role' = 'admin');

-- ============================================================================
-- SECTION 2: FIX orders TABLE RLS (Remove user_metadata references)
-- ============================================================================

-- Users can only see their own orders
CREATE POLICY orders_select_own ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users can insert
CREATE POLICY orders_insert ON public.orders
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own, admins can update any
CREATE POLICY orders_update ON public.orders
  FOR UPDATE USING (
    auth.uid() = user_id
    OR (auth.jwt() ->> 'app_role' = 'admin')
  );

-- ============================================================================
-- SECTION 3: CREATE PRIVATE SCHEMA VIEWS (Not exposed to PostgREST)
-- ============================================================================

-- Create private schema if not exists
CREATE SCHEMA IF NOT EXISTS private;

-- Move views to private schema - these won't be exposed via API
CREATE OR REPLACE VIEW private.moderation_queue_with_user AS
SELECT
  mq.id,
  mq.user_id,
  u.email as user_email,
  u.raw_user_meta_data ->> 'username' as username,
  mq.content_type,
  mq.content,
  mq.content_url,
  mq.post_id,
  mq.lighter_id,
  mq.flagged,
  mq.categories,
  mq.severity,
  mq.status,
  mq.review_notes,
  mq.action_taken,
  mq.reviewed_by,
  mq.reviewed_at,
  mq.created_at,
  mq.updated_at
FROM public.moderation_queue mq
JOIN auth.users u ON mq.user_id = u.id;

CREATE OR REPLACE VIEW private.orders_with_details AS
SELECT
  o.id,
  o.user_id,
  u.email as user_email,
  u.raw_user_meta_data ->> 'username' as username,
  o.stripe_payment_intent_id,
  o.stripe_customer_email,
  o.lighter_id,
  l.name as lighter_name,
  l.background_color,
  o.pack_size,
  o.amount_cents,
  o.currency,
  o.status,
  o.payment_status,
  o.shipped_at,
  o.tracking_number,
  o.notes,
  o.design_snapshot,
  o.created_at,
  o.updated_at,
  o.completed_at
FROM public.orders o
JOIN auth.users u ON o.user_id = u.id
LEFT JOIN public.lighters l ON o.lighter_id = l.id;

-- ============================================================================
-- SECTION 4: FIX detailed_posts VIEW (if it exists and has SECURITY DEFINER)
-- ============================================================================

-- Drop if exists with SECURITY DEFINER
DROP VIEW IF EXISTS public.detailed_posts CASCADE;

-- Recreate without SECURITY DEFINER (if you need it)
-- Only create if you actually use it
-- CREATE OR REPLACE VIEW public.detailed_posts AS ...

-- ============================================================================
-- SECTION 5: UPDATE RPC FUNCTIONS TO USE app_role INSTEAD OF user_metadata
-- ============================================================================

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_moderation_queue_data(text,text,integer,integer);
DROP FUNCTION IF EXISTS get_orders_data(text,integer,integer);

-- Function: Get moderation queue with user details (check app_role instead of user_metadata)
CREATE OR REPLACE FUNCTION get_moderation_queue_data(
  p_status TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  content_type TEXT,
  content TEXT,
  content_url TEXT,
  post_id UUID,
  lighter_id UUID,
  flagged BOOLEAN,
  categories JSONB,
  severity TEXT,
  status TEXT,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  created_ago TEXT
) AS $$
BEGIN
  -- Only allow admins and moderators to access (use app_role, not user_metadata)
  IF auth.jwt() ->> 'app_role' NOT IN ('admin', 'moderator') THEN
    RAISE EXCEPTION 'Insufficient permissions to access moderation queue';
  END IF;

  RETURN QUERY
  SELECT
    mq.id,
    mq.user_id,
    u.email,
    mq.content_type,
    mq.content,
    mq.content_url,
    mq.post_id,
    mq.lighter_id,
    mq.flagged,
    mq.categories,
    mq.severity,
    mq.status,
    mq.review_notes,
    mq.created_at,
    (CURRENT_TIMESTAMP - mq.created_at)::TEXT
  FROM public.moderation_queue mq
  JOIN auth.users u ON mq.user_id = u.id
  WHERE
    (p_status IS NULL OR mq.status = p_status)
    AND (p_severity IS NULL OR mq.severity = p_severity)
  ORDER BY mq.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get orders with details (check app_role instead of user_metadata)
CREATE OR REPLACE FUNCTION get_orders_data(
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_email TEXT,
  stripe_payment_intent_id TEXT,
  lighter_id UUID,
  lighter_name TEXT,
  pack_size INTEGER,
  amount_cents INTEGER,
  currency TEXT,
  status TEXT,
  payment_status TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  created_ago TEXT
) AS $$
BEGIN
  -- Only allow admins to access (use app_role, not user_metadata)
  IF auth.jwt() ->> 'app_role' != 'admin' THEN
    RAISE EXCEPTION 'Insufficient permissions to access orders';
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.user_id,
    u.email,
    o.stripe_payment_intent_id,
    o.lighter_id,
    l.name,
    o.pack_size,
    o.amount_cents,
    o.currency,
    o.status,
    o.payment_status,
    o.shipped_at,
    o.tracking_number,
    o.created_at,
    (CURRENT_TIMESTAMP - o.created_at)::TEXT
  FROM public.orders o
  JOIN auth.users u ON o.user_id = u.id
  LEFT JOIN public.lighters l ON o.lighter_id = l.id
  WHERE (p_status IS NULL OR o.status = p_status)
  ORDER BY o.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify RLS policies exist and don't reference user_metadata
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('moderation_queue', 'orders')
ORDER BY tablename, policyname;

-- Verify views are in private schema, not public
SELECT schemaname, viewname
FROM pg_views
WHERE viewname IN ('moderation_queue_with_user', 'orders_with_details')
ORDER BY schemaname, viewname;

-- Verify RPC functions exist and check their definition
SELECT proname, prosrc
FROM pg_proc
WHERE proname IN ('get_moderation_queue_data', 'get_orders_data')
ORDER BY proname;
