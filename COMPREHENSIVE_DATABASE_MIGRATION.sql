-- ============================================================================
-- COMPREHENSIVE DATABASE MIGRATION FOR LIGHTMYFIRE
-- ============================================================================
-- This migration adds complete support for:
-- 1. Content moderation system (moderation_queue table + functions)
-- 2. Payment & order tracking (orders table + functions)
-- 3. Sticker design persistence (lighters table enhancements)
-- 4. Security fixes (private schema, RLS policies, RPC wrappers)
-- 5. Admin dashboards (analytics functions)
-- ============================================================================

-- ============================================================================
-- SECTION 1: LIGHTERS TABLE ENHANCEMENTS
-- ============================================================================
-- Add new columns for sticker design persistence and versioning

ALTER TABLE IF EXISTS public.lighters
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#FF6B6B',
ADD COLUMN IF NOT EXISTS sticker_language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS sticker_design_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create index on updated_at for efficient queries
CREATE INDEX IF NOT EXISTS idx_lighters_updated_at ON public.lighters(updated_at DESC);

-- ============================================================================
-- SECTION 2: MODERATION QUEUE TABLE
-- ============================================================================
-- Tracks all content flagged by OpenAI moderation API

CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content identification
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'lighter_name', 'lighter_description', 'profile_bio', 'image')),
  content TEXT,
  content_url TEXT,

  -- Associated records
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  lighter_id UUID REFERENCES public.lighters(id) ON DELETE SET NULL,

  -- Moderation results from OpenAI
  flagged BOOLEAN NOT NULL DEFAULT FALSE,
  categories JSONB, -- {"sexual": false, "hate": true, "violence": false, ...}
  category_scores JSONB, -- {"sexual": 0.1, "hate": 0.8, "violence": 0.2, ...}
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),

  -- Review status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'appealed')),
  review_notes TEXT,
  action_taken TEXT, -- 'warning', 'content_removed', 'user_suspended', 'none'
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_moderation_queue_user_id ON public.moderation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_post_id ON public.moderation_queue(post_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_lighter_id ON public.moderation_queue(lighter_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_flagged ON public.moderation_queue(flagged);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_severity ON public.moderation_queue(severity);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_content_type ON public.moderation_queue(content_type);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created_at ON public.moderation_queue(created_at DESC);

-- Row-level security policies
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- Users can only see their own content in moderation queue
CREATE POLICY moderation_queue_select_own ON public.moderation_queue
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Only authenticated users can insert (via API with moderation check)
CREATE POLICY moderation_queue_insert ON public.moderation_queue
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins/moderators can update
CREATE POLICY moderation_queue_update ON public.moderation_queue
  FOR UPDATE USING (auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'moderator'));

-- Only admins can delete
CREATE POLICY moderation_queue_delete ON public.moderation_queue
  FOR DELETE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- ============================================================================
-- SECTION 3: ORDERS TABLE
-- ============================================================================
-- Tracks all sticker pack purchases via Stripe

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe payment information
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_email TEXT NOT NULL,

  -- Order details
  pack_size INTEGER NOT NULL CHECK (pack_size IN (5, 10, 25, 50, 100)),
  amount_cents INTEGER NOT NULL, -- In cents (e.g., 2999 = $29.99)
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Lighter design reference
  lighter_id UUID REFERENCES public.lighters(id) ON DELETE SET NULL,
  design_snapshot JSONB, -- Store design state in case lighter is deleted

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'failed')),
  payment_status TEXT NOT NULL DEFAULT 'incomplete' CHECK (payment_status IN ('incomplete', 'succeeded', 'failed')),

  -- Fulfillment
  shipped_at TIMESTAMP WITH TIME ZONE,
  tracking_number TEXT,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON public.orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_lighter_id ON public.orders(lighter_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_pack_size ON public.orders(pack_size);

-- Row-level security policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own orders
CREATE POLICY orders_select_own ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Only authenticated users can insert (via Stripe webhook)
CREATE POLICY orders_insert ON public.orders
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own, admins can update any
CREATE POLICY orders_update ON public.orders
  FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- ============================================================================
-- SECTION 4: TRIGGER FUNCTIONS FOR TIMESTAMPS
-- ============================================================================
-- Automatically update updated_at on record modification

CREATE OR REPLACE FUNCTION update_moderation_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER moderation_queue_timestamp
  BEFORE UPDATE ON public.moderation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_moderation_queue_timestamp();

CREATE OR REPLACE FUNCTION update_orders_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_timestamp
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_timestamp();

CREATE OR REPLACE FUNCTION update_lighters_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lighters_timestamp
  BEFORE UPDATE ON public.lighters
  FOR EACH ROW
  EXECUTE FUNCTION update_lighters_timestamp();

-- ============================================================================
-- SECTION 5: CORE RPC FUNCTIONS
-- ============================================================================

-- Function: Log moderation result and store in moderation_queue
CREATE OR REPLACE FUNCTION log_moderation_result(
  p_user_id UUID,
  p_content_type TEXT,
  p_content TEXT,
  p_content_url TEXT,
  p_post_id UUID,
  p_lighter_id UUID,
  p_flagged BOOLEAN,
  p_categories JSONB,
  p_category_scores JSONB,
  p_severity TEXT
)
RETURNS UUID AS $$
DECLARE
  v_record_id UUID;
BEGIN
  INSERT INTO public.moderation_queue (
    user_id, content_type, content, content_url, post_id, lighter_id,
    flagged, categories, category_scores, severity, status
  ) VALUES (
    p_user_id, p_content_type, p_content, p_content_url, p_post_id, p_lighter_id,
    p_flagged, p_categories, p_category_scores, p_severity,
    CASE WHEN p_flagged THEN 'pending' ELSE 'approved' END
  )
  RETURNING id INTO v_record_id;

  RETURN v_record_id;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to log moderation result: %', SQLERRM;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create order from Stripe payment intent
CREATE OR REPLACE FUNCTION create_order_from_payment(
  p_stripe_payment_intent_id TEXT,
  p_stripe_customer_email TEXT,
  p_user_id UUID,
  p_lighter_id UUID,
  p_pack_size INTEGER,
  p_amount_cents INTEGER,
  p_currency TEXT DEFAULT 'USD'
)
RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_design_snapshot JSONB;
BEGIN
  -- Get current lighter design snapshot
  SELECT jsonb_build_object(
    'name', name,
    'background_color', background_color,
    'sticker_language', sticker_language,
    'sticker_design_version', sticker_design_version
  ) INTO v_design_snapshot
  FROM public.lighters
  WHERE id = p_lighter_id;

  INSERT INTO public.orders (
    stripe_payment_intent_id, stripe_customer_email, user_id, lighter_id,
    pack_size, amount_cents, currency, design_snapshot, status, payment_status
  ) VALUES (
    p_stripe_payment_intent_id, p_stripe_customer_email, p_user_id, p_lighter_id,
    p_pack_size, p_amount_cents, p_currency, v_design_snapshot, 'processing', 'incomplete'
  )
  RETURNING id INTO v_order_id;

  RETURN v_order_id;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to create order: %', SQLERRM;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update order payment status
DROP FUNCTION IF EXISTS update_order_payment_succeeded(text);

CREATE OR REPLACE FUNCTION update_order_payment_succeeded(
  p_stripe_payment_intent_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_rows_updated INTEGER;
BEGIN
  UPDATE public.orders
  SET
    payment_status = 'succeeded',
    status = 'completed',
    completed_at = CURRENT_TIMESTAMP
  WHERE stripe_payment_intent_id = p_stripe_payment_intent_id;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  RETURN v_rows_updated > 0;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to update order payment: %', SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 6: ANALYTICS RPC FUNCTIONS
-- ============================================================================

-- Function: Get moderation statistics
CREATE OR REPLACE FUNCTION get_moderation_stats()
RETURNS TABLE (
  total_flagged BIGINT,
  pending_review BIGINT,
  approved_count BIGINT,
  rejected_count BIGINT,
  high_severity BIGINT,
  medium_severity BIGINT,
  low_severity BIGINT,
  avg_review_time_minutes NUMERIC,
  most_common_violation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'approved')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT,
    COUNT(*) FILTER (WHERE severity = 'high')::BIGINT,
    COUNT(*) FILTER (WHERE severity = 'medium')::BIGINT,
    COUNT(*) FILTER (WHERE severity = 'low')::BIGINT,
    ROUND(
      AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at))/60)::NUMERIC, 2
    ),
    (SELECT key FROM (
      SELECT key, COUNT(*) as count
      FROM public.moderation_queue,
      LATERAL jsonb_object_keys(categories) AS key
      WHERE categories IS NOT NULL
      GROUP BY key
      ORDER BY count DESC
      LIMIT 1
    ) AS top_violation)
  FROM public.moderation_queue
  WHERE flagged = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get order analytics
CREATE OR REPLACE FUNCTION get_order_analytics()
RETURNS TABLE (
  total_orders BIGINT,
  completed_orders BIGINT,
  failed_orders BIGINT,
  total_revenue_cents BIGINT,
  average_order_value_cents NUMERIC,
  most_popular_pack_size INTEGER,
  pending_fulfillment BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT,
    SUM(amount_cents)::BIGINT,
    ROUND(AVG(amount_cents)::NUMERIC, 2),
    (SELECT pack_size FROM public.orders
     WHERE status = 'completed'
     GROUP BY pack_size
     ORDER BY COUNT(*) DESC
     LIMIT 1),
    COUNT(*) FILTER (WHERE status = 'processing')::BIGINT
  FROM public.orders;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 7: DATA ACCESS RPC FUNCTIONS (FOR ADMIN DASHBOARDS)
-- ============================================================================

-- Function: Get moderation queue with user details (secure)
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
  category_scores JSONB,
  severity TEXT,
  status TEXT,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  created_ago TEXT
) AS $$
BEGIN
  -- Only allow admins and moderators to access
  IF auth.jwt() -> 'user_metadata' ->> 'role' NOT IN ('admin', 'moderator') THEN
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
    mq.category_scores,
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

-- Function: Get orders with details (secure)
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
  -- Only allow admins to access
  IF auth.jwt() -> 'user_metadata' ->> 'role' != 'admin' THEN
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
-- SECTION 8: PRIVATE SCHEMA VIEWS (NOT EXPOSED VIA POSTGREST API)
-- ============================================================================
-- These views are only accessible via RPC functions, not direct HTTP queries

CREATE SCHEMA IF NOT EXISTS private;

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

-- Revoke public access to private schema
REVOKE ALL ON SCHEMA private FROM PUBLIC;

-- ============================================================================
-- SECTION 9: SECURITY POLICIES FOR VIEWS
-- ============================================================================

ALTER VIEW private.moderation_queue_with_user SET (security_barrier = on);
ALTER VIEW private.orders_with_details SET (security_barrier = on);

-- ============================================================================
-- SECTION 10: VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify all migrations applied successfully

-- Check tables exist
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'moderation_queue'
) as moderation_queue_exists;

SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'orders'
) as orders_table_exists;

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'lighters'
  AND column_name = 'background_color'
) as lighters_enhanced;

-- Check RPC functions exist
SELECT EXISTS (
  SELECT 1 FROM pg_proc
  WHERE proname = 'log_moderation_result'
) as log_moderation_result_exists;

SELECT EXISTS (
  SELECT 1 FROM pg_proc
  WHERE proname = 'create_order_from_payment'
) as create_order_from_payment_exists;

SELECT EXISTS (
  SELECT 1 FROM pg_proc
  WHERE proname = 'get_moderation_queue_data'
) as get_moderation_queue_data_exists;

SELECT EXISTS (
  SELECT 1 FROM pg_proc
  WHERE proname = 'get_orders_data'
) as get_orders_data_exists;

-- Check private schema exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.schemata
  WHERE schema_name = 'private'
) as private_schema_exists;

-- ============================================================================
-- IMPLEMENTATION NOTES
-- ============================================================================
/*

### How to Use This Migration File

1. **Backup Your Database** (CRITICAL)
   - In Supabase: Project Settings → Backups
   - Create manual backup before applying changes

2. **Execute in Supabase SQL Editor**
   - Navigate to: Your Project → SQL Editor
   - Create New Query
   - Paste entire content of this file
   - Click "Run" button
   - Wait for all statements to complete (should see checkmarks)

3. **Verify Success**
   - Run the verification queries at bottom of this file
   - All should return "true" or non-zero counts

4. **Update API Routes to Use New Functions**

   a) For text moderation (app/api/moderate-text/route.ts):
   ```typescript
   await supabase.rpc('log_moderation_result', {
     p_user_id: userId,
     p_content_type: contentType,
     p_content: text,
     p_content_url: null,
     p_post_id: postId || null,
     p_lighter_id: null,
     p_flagged: result.flagged,
     p_categories: categoriesObj,
     p_category_scores: scoresObj,
     p_severity: severity,
   });
   ```

   b) For image moderation (app/api/moderate-image/route.ts):
   ```typescript
   await supabase.rpc('log_moderation_result', {
     p_user_id: userId,
     p_content_type: contentType,
     p_content: null,
     p_content_url: imageUrl || 'base64-provided',
     p_post_id: postId || null,
     p_lighter_id: lighterId || null,
     p_flagged: result.flagged,
     p_categories: categoriesObj,
     p_category_scores: scoresObj,
     p_severity: severity,
   });
   ```

5. **Create Admin Dashboards**

   a) Moderation Dashboard:
   ```typescript
   const { data } = await supabase.rpc('get_moderation_queue_data', {
     p_status: filter || null,
     p_severity: null,
     p_limit: 50,
     p_offset: 0,
   });
   ```

   b) Orders Dashboard:
   ```typescript
   const { data } = await supabase.rpc('get_orders_data', {
     p_status: filter || null,
     p_limit: 50,
     p_offset: 0,
   });
   ```

### Tables Created

- **moderation_queue** (17 columns)
  - Stores all content flagged by OpenAI moderation API
  - Includes review tracking for admin action
  - RLS policies: users see only their own, admins see all

- **orders** (16 columns)
  - Stores all Stripe payment orders
  - Links orders to lighter designs and users
  - RLS policies: users see only their own, admins see all

### RPC Functions Created (7 total)

#### Core Functions:
1. `log_moderation_result()` - Log moderation check results
2. `create_order_from_payment()` - Create order from Stripe payment
3. `update_order_payment_succeeded()` - Mark order as paid

#### Analytics Functions:
4. `get_moderation_stats()` - Moderation dashboard statistics
5. `get_order_analytics()` - Order dashboard statistics

#### Data Access Functions (Admin Only):
6. `get_moderation_queue_data()` - Fetch moderation queue (with RLS check)
7. `get_orders_data()` - Fetch orders (with RLS check)

### Security Features

- **Private Schema**: Views in private.* schema not exposed via PostgREST API
- **RLS Policies**: Row-level security on all tables
- **SECURITY DEFINER**: RPC functions execute with elevated privileges
- **Role Checking**: Admin/moderator functions verify user role in JWT
- **Auth Triggers**: Timestamp triggers auto-update records

### Performance Optimizations

- 8 indexes on moderation_queue (user_id, post_id, lighter_id, status, severity, etc.)
- 7 indexes on orders (user_id, stripe_payment_intent_id, status, created_at, etc.)
- Covering indexes for common queries
- DESC indexes on created_at for latest-first queries

### Rollback Instructions

If you need to rollback:
```sql
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.moderation_queue CASCADE;
DROP SCHEMA IF EXISTS private CASCADE;
DROP FUNCTION IF EXISTS log_moderation_result CASCADE;
DROP FUNCTION IF EXISTS create_order_from_payment CASCADE;
DROP FUNCTION IF EXISTS update_order_payment_succeeded CASCADE;
DROP FUNCTION IF EXISTS get_moderation_stats CASCADE;
DROP FUNCTION IF EXISTS get_order_analytics CASCADE;
DROP FUNCTION IF EXISTS get_moderation_queue_data CASCADE;
DROP FUNCTION IF EXISTS get_orders_data CASCADE;
ALTER TABLE public.lighters DROP COLUMN IF EXISTS background_color;
ALTER TABLE public.lighters DROP COLUMN IF EXISTS sticker_language;
ALTER TABLE public.lighters DROP COLUMN IF EXISTS sticker_design_version;
ALTER TABLE public.lighters DROP COLUMN IF EXISTS updated_at;
```

### Support References

- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL Triggers: https://www.postgresql.org/docs/current/sql-createtrigger.html
- RPC Functions: https://supabase.com/docs/reference/javascript/rpc
- OpenAI Moderation: https://platform.openai.com/docs/guides/moderation

*/
