-- ============================================================================
-- CRITICAL DATABASE FIXES
-- Fix broken trigger, add missing columns, and ensure proper schema
-- ============================================================================

-- ============================================================================
-- SECTION 1: FIX BROKEN FLAG COUNT TRIGGER
-- ============================================================================

-- Drop the broken trigger and function
DROP TRIGGER IF EXISTS increment_flag_count_trigger ON public.posts;
DROP FUNCTION IF EXISTS public.increment_flag_count();

-- Note: flag_count initialization logic is removed. The column should default to 0
-- and be incremented by trigger on moderation_queue inserts, not post inserts.

-- ============================================================================
-- SECTION 2: ADD MISSING COLUMNS TO LIGHTERS TABLE
-- ============================================================================

-- Add sticker customization columns if they don't exist
ALTER TABLE public.lighters
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#FF6B6B',
ADD COLUMN IF NOT EXISTS sticker_language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS sticker_design_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create update trigger for lighters.updated_at
DROP TRIGGER IF EXISTS update_lighters_timestamp ON public.lighters;
CREATE TRIGGER update_lighters_timestamp
BEFORE UPDATE ON public.lighters
FOR EACH ROW
EXECUTE FUNCTION public.moddatetime (updated_at);

-- ============================================================================
-- SECTION 3: ENSURE PROPER LIKES/POST_LIKES TABLE
-- ============================================================================

-- Check if table exists and has correct columns
-- The table should be named 'likes' (not 'post_likes' for consistency)
-- If it exists as 'post_likes', we'll create an alias

-- If likes table doesn't exist, create it:
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);

-- Create index for post likes queries
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

-- Enable RLS on likes table
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes table
DROP POLICY IF EXISTS likes_select_policy ON public.likes;
DROP POLICY IF EXISTS likes_insert_policy ON public.likes;
DROP POLICY IF EXISTS likes_delete_policy ON public.likes;

CREATE POLICY likes_select_policy ON public.likes
FOR SELECT USING (true);

CREATE POLICY likes_insert_policy ON public.likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY likes_delete_policy ON public.likes
FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 4: FIX PROFILES AUTO-CREATION TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SECTION 5: VERIFY AND FIX POSTS TABLE STRUCTURE
-- ============================================================================

-- Ensure all critical columns exist with correct types
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flagged_count INTEGER DEFAULT 0;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_lighter_id ON public.posts(lighter_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_public ON public.posts(is_public);
CREATE INDEX IF NOT EXISTS idx_posts_is_flagged ON public.posts(is_flagged);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- ============================================================================
-- SECTION 6: ENSURE LIGHTERS TABLE CONSTRAINTS
-- ============================================================================

-- Add unique constraint on pin_code if it doesn't exist
ALTER TABLE public.lighters
ADD CONSTRAINT lighters_pin_code_unique UNIQUE (pin_code);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lighters_saver_id ON public.lighters(saver_id);
CREATE INDEX IF NOT EXISTS idx_lighters_created_at ON public.lighters(created_at DESC);

-- ============================================================================
-- SECTION 7: SEED TROPHY DEFINITIONS (if table is empty)
-- ============================================================================

INSERT INTO public.trophies (id, name, description, icon_name)
VALUES
  (1, 'Fire Starter', 'Save your first lighter', 'personalise'),
  (2, 'Story Teller', 'Add your first post', 'telling_stories'),
  (3, 'Chronicles', 'Add 5 stories to lighters', 'telling_stories'),
  (4, 'Epic Saga', 'Add 10 stories to lighters', 'telling_stories'),
  (5, 'Collector', 'Save 5 different lighters', 'personalise'),
  (6, 'Community Builder', 'Contribute to 10 different lighters', 'around_the_world'),
  (7, 'Globe Trotter', 'Post from 5 different countries', 'around_the_world'),
  (8, 'Popular Contributor', 'Get 50 likes on your posts', 'personalise'),
  (9, 'Photographer', 'Add 10 photo posts', 'telling_stories'),
  (10, 'Musician', 'Add 5 song posts', 'telling_stories')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SECTION 8: CREATE MISSING MODERATION_QUEUE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'lighter_name', 'lighter_description', 'profile_bio', 'image')),
  content TEXT,
  content_url TEXT,
  post_id BIGINT REFERENCES public.posts(id) ON DELETE SET NULL,
  lighter_id UUID REFERENCES public.lighters(id) ON DELETE SET NULL,
  flagged BOOLEAN DEFAULT false,
  categories JSONB,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'appealed')),
  review_notes TEXT,
  action_taken TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for moderation_queue
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_user_id ON public.moderation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created_at ON public.moderation_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_post_id ON public.moderation_queue(post_id);

-- Enable RLS
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS moderation_queue_select_own ON public.moderation_queue;
DROP POLICY IF EXISTS moderation_queue_insert ON public.moderation_queue;
DROP POLICY IF EXISTS moderation_queue_admin_update ON public.moderation_queue;
DROP POLICY IF EXISTS moderation_queue_admin_delete ON public.moderation_queue;

CREATE POLICY moderation_queue_select_own ON public.moderation_queue
FOR SELECT USING (auth.uid() = user_id OR (auth.jwt() ->> 'app_role' IN ('admin', 'moderator')));

CREATE POLICY moderation_queue_insert ON public.moderation_queue
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY moderation_queue_admin_update ON public.moderation_queue
FOR UPDATE USING ((auth.jwt() ->> 'app_role' IN ('admin', 'moderator')));

CREATE POLICY moderation_queue_admin_delete ON public.moderation_queue
FOR DELETE USING ((auth.jwt() ->> 'app_role' = 'admin'));

-- Update timestamp trigger
DROP TRIGGER IF EXISTS update_moderation_queue_timestamp ON public.moderation_queue;
CREATE TRIGGER update_moderation_queue_timestamp
BEFORE UPDATE ON public.moderation_queue
FOR EACH ROW
EXECUTE FUNCTION public.moddatetime (updated_at);

-- ============================================================================
-- SECTION 9: CREATE MISSING ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_email TEXT NOT NULL,
  lighter_id UUID REFERENCES public.lighters(id) ON DELETE SET NULL,
  pack_size INTEGER NOT NULL CHECK (pack_size IN (5, 10, 25, 50, 100)),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'failed')),
  payment_status TEXT DEFAULT 'incomplete' CHECK (payment_status IN ('incomplete', 'succeeded', 'failed')),
  design_snapshot JSONB,
  shipped_at TIMESTAMP WITH TIME ZONE,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON public.orders(stripe_payment_intent_id);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS orders_select_own ON public.orders;
DROP POLICY IF EXISTS orders_insert ON public.orders;
DROP POLICY IF EXISTS orders_update_own ON public.orders;

CREATE POLICY orders_select_own ON public.orders
FOR SELECT USING (auth.uid() = user_id OR (auth.jwt() ->> 'app_role' = 'admin'));

CREATE POLICY orders_insert ON public.orders
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY orders_update_own ON public.orders
FOR UPDATE USING (auth.uid() = user_id OR (auth.jwt() ->> 'app_role' = 'admin'));

-- Update timestamp trigger
DROP TRIGGER IF EXISTS update_orders_timestamp ON public.orders;
CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.moddatetime (updated_at);

-- ============================================================================
-- SECTION 10: VERIFY PROPER FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- These constraints may already exist, but we verify they're set up correctly
-- The ON DELETE CASCADE ensures referential integrity

-- Check posts table constraints
ALTER TABLE public.posts
DROP CONSTRAINT IF EXISTS posts_lighter_id_fkey,
DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

ALTER TABLE public.posts
ADD CONSTRAINT posts_lighter_id_fkey FOREIGN KEY (lighter_id) REFERENCES public.lighters(id) ON DELETE CASCADE,
ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================================================
-- SECTION 11: FIX POSTS RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS posts_select_all ON public.posts;
DROP POLICY IF EXISTS posts_select_own ON public.posts;
DROP POLICY IF EXISTS posts_insert_own ON public.posts;
DROP POLICY IF EXISTS posts_update_own ON public.posts;
DROP POLICY IF EXISTS posts_delete_own ON public.posts;

-- Everyone can see non-flagged posts
CREATE POLICY posts_select_all ON public.posts
FOR SELECT USING (NOT is_flagged OR auth.uid() = user_id);

-- Users can insert own posts
CREATE POLICY posts_insert_own ON public.posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own posts
CREATE POLICY posts_update_own ON public.posts
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete own posts
CREATE POLICY posts_delete_own ON public.posts
FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify setup:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') ORDER BY proname;
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT * FROM information_schema.table_constraints WHERE table_schema = 'public';
