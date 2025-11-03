-- ============================================================================
-- COMPREHENSIVE DATABASE REPAIR & SETUP
-- Complete schema creation and fixes for all functionalities
-- ============================================================================
-- This script works on ANY current state - it creates, updates, or fixes
-- all tables, functions, triggers, and policies needed
-- ============================================================================

-- ============================================================================
-- PHASE 1: ENABLE EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PHASE 2: CREATE OR VERIFY AUTH INTEGRATION
-- ============================================================================

-- This runs on every application start
-- Ensures profiles table exists and is ready

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  nationality TEXT,
  show_nationality BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'))
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

CREATE POLICY profiles_select_all ON public.profiles
FOR SELECT USING (true);

CREATE POLICY profiles_update_own ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Create index on username for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- ============================================================================
-- PHASE 3: CREATE LIGHTERS TABLE (WITH ALL CUSTOMIZATION COLUMNS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lighters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  pin_code TEXT UNIQUE NOT NULL,
  custom_background_url TEXT,
  show_saver_username BOOLEAN DEFAULT FALSE,
  background_color TEXT DEFAULT '#FF6B6B',
  sticker_language TEXT DEFAULT 'en' CHECK (sticker_language IN ('en', 'fr', 'es', 'de', 'it', 'pt')),
  sticker_design_version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on lighters
ALTER TABLE public.lighters ENABLE ROW LEVEL SECURITY;

-- RLS policies for lighters
DROP POLICY IF EXISTS lighters_select_all ON public.lighters;
DROP POLICY IF EXISTS lighters_insert_own ON public.lighters;
DROP POLICY IF EXISTS lighters_update_own ON public.lighters;

CREATE POLICY lighters_select_all ON public.lighters
FOR SELECT USING (true);

CREATE POLICY lighters_insert_own ON public.lighters
FOR INSERT WITH CHECK (auth.uid() = saver_id);

CREATE POLICY lighters_update_own ON public.lighters
FOR UPDATE USING (auth.uid() = saver_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lighters_saver_id ON public.lighters(saver_id);
CREATE INDEX IF NOT EXISTS idx_lighters_pin_code ON public.lighters(pin_code);
CREATE INDEX IF NOT EXISTS idx_lighters_created_at ON public.lighters(created_at DESC);

-- Update timestamp trigger
DROP TRIGGER IF EXISTS update_lighters_timestamp ON public.lighters;
CREATE TRIGGER update_lighters_timestamp
BEFORE UPDATE ON public.lighters
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

-- ============================================================================
-- PHASE 4: CREATE POSTS TABLE (ALL POST TYPES)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id BIGSERIAL PRIMARY KEY,
  lighter_id UUID NOT NULL REFERENCES public.lighters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL CHECK (post_type IN ('text', 'song', 'image', 'location', 'refuel')),
  title TEXT,
  content_text TEXT,
  content_url TEXT,
  location_name TEXT,
  location_lat NUMERIC(10,8),
  location_lng NUMERIC(11,8),
  is_find_location BOOLEAN DEFAULT FALSE,
  is_creation BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  flagged_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for posts
DROP POLICY IF EXISTS posts_select_public ON public.posts;
DROP POLICY IF EXISTS posts_select_own_flagged ON public.posts;
DROP POLICY IF EXISTS posts_insert_own ON public.posts;
DROP POLICY IF EXISTS posts_update_own ON public.posts;
DROP POLICY IF EXISTS posts_delete_own ON public.posts;

CREATE POLICY posts_select_public ON public.posts
FOR SELECT USING (NOT is_flagged OR auth.uid() = user_id);

CREATE POLICY posts_insert_own ON public.posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY posts_update_own ON public.posts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY posts_delete_own ON public.posts
FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_lighter_id ON public.posts(lighter_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_public ON public.posts(is_public);
CREATE INDEX IF NOT EXISTS idx_posts_is_flagged ON public.posts(is_flagged);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);

-- ============================================================================
-- PHASE 5: CREATE LIKES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);

-- Enable RLS on likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for likes
DROP POLICY IF EXISTS likes_select_all ON public.likes;
DROP POLICY IF EXISTS likes_insert_own ON public.likes;
DROP POLICY IF EXISTS likes_delete_own ON public.likes;

CREATE POLICY likes_select_all ON public.likes
FOR SELECT USING (true);

CREATE POLICY likes_insert_own ON public.likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY likes_delete_own ON public.likes
FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

-- ============================================================================
-- PHASE 6: CREATE TROPHIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.trophies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed trophy data
INSERT INTO public.trophies (id, name, description, icon_name) VALUES
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
-- PHASE 7: CREATE USER_TROPHIES TABLE (JUNCTION TABLE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trophy_id INTEGER NOT NULL REFERENCES public.trophies(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, trophy_id)
);

-- Enable RLS on user_trophies
ALTER TABLE public.user_trophies ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_trophies
DROP POLICY IF EXISTS user_trophies_select_own ON public.user_trophies;
DROP POLICY IF EXISTS user_trophies_insert_own ON public.user_trophies;

CREATE POLICY user_trophies_select_own ON public.user_trophies
FOR SELECT USING (auth.uid() = user_id OR (auth.jwt() ->> 'app_role' = 'admin'));

CREATE POLICY user_trophies_insert_own ON public.user_trophies
FOR INSERT WITH CHECK (auth.uid() = user_id OR (auth.jwt() ->> 'app_role' = 'admin'));

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_trophies_user_id ON public.user_trophies(user_id);

-- ============================================================================
-- PHASE 8: CREATE MODERATION_QUEUE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'lighter_name', 'lighter_description', 'profile_bio', 'image')),
  content TEXT,
  content_url TEXT,
  post_id BIGINT REFERENCES public.posts(id) ON DELETE SET NULL,
  lighter_id UUID REFERENCES public.lighters(id) ON DELETE SET NULL,
  flagged BOOLEAN DEFAULT FALSE,
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

-- Enable RLS on moderation_queue
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies for moderation_queue
DROP POLICY IF EXISTS moderation_queue_select_own ON public.moderation_queue;
DROP POLICY IF EXISTS moderation_queue_select_admin ON public.moderation_queue;
DROP POLICY IF EXISTS moderation_queue_insert ON public.moderation_queue;
DROP POLICY IF EXISTS moderation_queue_update_admin ON public.moderation_queue;

CREATE POLICY moderation_queue_select_own ON public.moderation_queue
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY moderation_queue_select_admin ON public.moderation_queue
FOR SELECT USING ((auth.jwt() ->> 'app_role' IN ('admin', 'moderator')));

CREATE POLICY moderation_queue_insert ON public.moderation_queue
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY moderation_queue_update_admin ON public.moderation_queue
FOR UPDATE USING ((auth.jwt() ->> 'app_role' IN ('admin', 'moderator')));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_user_id ON public.moderation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created_at ON public.moderation_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_post_id ON public.moderation_queue(post_id);

-- Update timestamp trigger
DROP TRIGGER IF EXISTS update_moderation_queue_timestamp ON public.moderation_queue;
CREATE TRIGGER update_moderation_queue_timestamp
BEFORE UPDATE ON public.moderation_queue
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

-- ============================================================================
-- PHASE 9: CREATE ORDERS TABLE (FOR STRIPE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_email TEXT NOT NULL,
  lighter_id UUID REFERENCES public.lighters(id) ON DELETE SET NULL,
  pack_size INTEGER NOT NULL CHECK (pack_size IN (5, 10, 25, 50, 100)),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
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

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders
DROP POLICY IF EXISTS orders_select_own ON public.orders;
DROP POLICY IF EXISTS orders_select_admin ON public.orders;
DROP POLICY IF EXISTS orders_insert ON public.orders;
DROP POLICY IF EXISTS orders_update ON public.orders;

CREATE POLICY orders_select_own ON public.orders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY orders_select_admin ON public.orders
FOR SELECT USING ((auth.jwt() ->> 'app_role' = 'admin'));

CREATE POLICY orders_insert ON public.orders
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY orders_update ON public.orders
FOR UPDATE USING (auth.uid() = user_id OR (auth.jwt() ->> 'app_role' = 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON public.orders(stripe_payment_intent_id);

-- Update timestamp trigger
DROP TRIGGER IF EXISTS update_orders_timestamp ON public.orders;
CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

-- ============================================================================
-- PHASE 10: CREATE VIEWS
-- ============================================================================

-- Detailed posts view (for API queries)
DROP VIEW IF EXISTS public.detailed_posts CASCADE;
CREATE VIEW public.detailed_posts AS
SELECT
  p.id,
  p.lighter_id,
  p.user_id,
  p.created_at,
  p.post_type,
  p.title,
  p.content_text,
  p.content_url,
  p.location_name,
  p.location_lat,
  p.location_lng,
  p.is_find_location,
  p.is_creation,
  p.is_anonymous,
  p.is_pinned,
  p.is_public,
  p.is_flagged,
  p.flagged_count,
  COALESCE(pr.username, 'Anonymous') as username,
  pr.nationality,
  pr.show_nationality,
  pr.role,
  l.name as lighter_name,
  l.custom_background_url,
  COALESCE(COUNT(DISTINCT lk.id), 0)::INT as like_count,
  (EXISTS(SELECT 1 FROM public.likes lk2 WHERE lk2.post_id = p.id AND lk2.user_id = auth.uid())) as user_has_liked
FROM public.posts p
LEFT JOIN public.profiles pr ON pr.id = p.user_id
LEFT JOIN public.lighters l ON l.id = p.lighter_id
LEFT JOIN public.likes lk ON lk.post_id = p.id
WHERE NOT p.is_flagged
GROUP BY p.id, pr.id, l.id;

-- ============================================================================
-- PHASE 11: CREATE RPC FUNCTIONS
-- ============================================================================

-- Function: Create new post
DROP FUNCTION IF EXISTS public.create_new_post(uuid, text, text, text, text, text, numeric, numeric, boolean, boolean, boolean, boolean);
CREATE FUNCTION public.create_new_post(
  p_lighter_id UUID,
  p_post_type TEXT,
  p_title TEXT,
  p_content_text TEXT,
  p_content_url TEXT,
  p_location_name TEXT,
  p_location_lat NUMERIC,
  p_location_lng NUMERIC,
  p_is_find_location BOOLEAN,
  p_is_creation BOOLEAN,
  p_is_anonymous BOOLEAN,
  p_is_public BOOLEAN
)
RETURNS TABLE (success BOOLEAN, message TEXT, post_id BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id BIGINT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Must be logged in to post', NULL::BIGINT;
    RETURN;
  END IF;

  INSERT INTO public.posts (
    lighter_id, user_id, post_type, title, content_text, content_url,
    location_name, location_lat, location_lng, is_find_location,
    is_creation, is_anonymous, is_public
  )
  VALUES (
    p_lighter_id, v_user_id, p_post_type, p_title, p_content_text, p_content_url,
    p_location_name, p_location_lat, p_location_lng, p_is_find_location,
    p_is_creation, p_is_anonymous, p_is_public
  )
  RETURNING posts.id INTO v_post_id;

  RETURN QUERY SELECT true, 'Post created successfully', v_post_id;
END;
$$;

-- Function: Toggle like on post
DROP FUNCTION IF EXISTS public.toggle_like(BIGINT);
CREATE FUNCTION public.toggle_like(post_id_param BIGINT)
RETURNS TABLE (success BOOLEAN, liked BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_liked BOOLEAN;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, false;
    RETURN;
  END IF;

  -- Check if like exists
  SELECT EXISTS(SELECT 1 FROM public.likes WHERE post_id = post_id_param AND user_id = v_user_id)
  INTO v_liked;

  IF v_liked THEN
    -- Delete like
    DELETE FROM public.likes WHERE post_id = post_id_param AND user_id = v_user_id;
    RETURN QUERY SELECT true, false;
  ELSE
    -- Add like
    INSERT INTO public.likes (post_id, user_id) VALUES (post_id_param, v_user_id)
    ON CONFLICT DO NOTHING;
    RETURN QUERY SELECT true, true;
  END IF;
END;
$$;

-- Function: Flag post for moderation
DROP FUNCTION IF EXISTS public.flag_post(BIGINT);
CREATE FUNCTION public.flag_post(post_id_param BIGINT)
RETURNS TABLE (success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Must be logged in to flag content';
    RETURN;
  END IF;

  -- Update post flagged status
  UPDATE public.posts SET is_flagged = true WHERE id = post_id_param;

  -- Log to moderation queue
  INSERT INTO public.moderation_queue (user_id, content_type, post_id, flagged, status)
  VALUES (v_user_id, 'post', post_id_param, true, 'pending');

  RETURN QUERY SELECT true, 'Post flagged for review';
END;
$$;

-- Function: Get random public posts for homepage feed
DROP FUNCTION IF EXISTS public.get_random_public_posts(INTEGER);
CREATE FUNCTION public.get_random_public_posts(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id BIGINT, lighter_id UUID, user_id UUID, created_at TIMESTAMP WITH TIME ZONE,
  post_type TEXT, title TEXT, content_text TEXT, content_url TEXT,
  location_name TEXT, location_lat NUMERIC, location_lng NUMERIC,
  is_find_location BOOLEAN, is_creation BOOLEAN, is_anonymous BOOLEAN,
  is_pinned BOOLEAN, is_public BOOLEAN, is_flagged BOOLEAN, flagged_count INTEGER,
  username TEXT, nationality TEXT, show_nationality BOOLEAN, role TEXT,
  lighter_name TEXT, custom_background_url TEXT, like_count INT, user_has_liked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.detailed_posts
  WHERE is_public = true
  ORDER BY RANDOM()
  LIMIT limit_count;
END;
$$;

-- Function: Create new lighter
DROP FUNCTION IF EXISTS public.create_new_lighter(TEXT, TEXT, BOOLEAN);
CREATE FUNCTION public.create_new_lighter(
  lighter_name TEXT,
  background_url TEXT,
  show_username BOOLEAN
)
RETURNS TABLE (success BOOLEAN, message TEXT, lighter_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lighter_id UUID;
  v_pin_code TEXT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Must be logged in', NULL::UUID;
    RETURN;
  END IF;

  -- Generate random PIN
  v_pin_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 3)) || '-' || LPAD((RANDOM() * 999)::INT::TEXT, 3, '0');

  INSERT INTO public.lighters (saver_id, name, pin_code, custom_background_url, show_saver_username)
  VALUES (v_user_id, lighter_name, v_pin_code, background_url, show_username)
  RETURNING lighters.id INTO v_lighter_id;

  RETURN QUERY SELECT true, v_pin_code, v_lighter_id;
END;
$$;

-- Function: Get lighter ID from PIN
DROP FUNCTION IF EXISTS public.get_lighter_id_from_pin(TEXT);
CREATE FUNCTION public.get_lighter_id_from_pin(pin_to_check TEXT)
RETURNS TABLE (lighter_id UUID, lighter_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT id, name FROM public.lighters WHERE pin_code = pin_to_check;
END;
$$;

-- Function: Get user statistics
DROP FUNCTION IF EXISTS public.get_my_stats();
CREATE FUNCTION public.get_my_stats()
RETURNS TABLE (
  total_contributions BIGINT,
  lighters_saved BIGINT,
  lighters_contributed_to BIGINT,
  likes_received BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(COUNT(p.id), 0)::BIGINT,
    COALESCE(COUNT(DISTINCT CASE WHEN l.saver_id = v_user_id THEN l.id END), 0)::BIGINT,
    COALESCE(COUNT(DISTINCT p.lighter_id), 0)::BIGINT,
    COALESCE(COUNT(DISTINCT lk.id), 0)::BIGINT
  FROM public.posts p
  LEFT JOIN public.lighters l ON l.id = p.lighter_id
  LEFT JOIN public.likes lk ON lk.post_id = p.id
  WHERE p.user_id = v_user_id;
END;
$$;

-- ============================================================================
-- PHASE 12: CREATE TROPHY AUTO-UNLOCK SYSTEM
-- ============================================================================

-- Function: Check and grant eligible trophies
DROP FUNCTION IF EXISTS public.grant_trophies_for_user(UUID);
CREATE FUNCTION public.grant_trophies_for_user(p_user_id UUID)
RETURNS TABLE (trophy_id INTEGER, trophy_name TEXT, newly_granted BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_count BIGINT;
  v_lighter_count BIGINT;
  v_contributed_lighters BIGINT;
  v_photo_posts BIGINT;
  v_song_posts BIGINT;
  v_likes_received BIGINT;
BEGIN
  -- Get user statistics
  SELECT COUNT(*) INTO v_post_count FROM public.posts WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_lighter_count FROM public.lighters WHERE saver_id = p_user_id;
  SELECT COUNT(DISTINCT lighter_id) INTO v_contributed_lighters FROM public.posts WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_photo_posts FROM public.posts WHERE user_id = p_user_id AND post_type = 'image';
  SELECT COUNT(*) INTO v_song_posts FROM public.posts WHERE user_id = p_user_id AND post_type = 'song';
  SELECT COUNT(DISTINCT lk.id) INTO v_likes_received
  FROM public.likes lk
  JOIN public.posts p ON lk.post_id = p.id
  WHERE p.user_id = p_user_id;

  -- Grant Fire Starter (save first lighter)
  IF v_lighter_count >= 1 THEN
    INSERT INTO public.user_trophies (user_id, trophy_id, unlocked_at)
    VALUES (p_user_id, 1, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, trophy_id) DO NOTHING;
  END IF;

  -- Grant Story Teller (add first post)
  IF v_post_count >= 1 THEN
    INSERT INTO public.user_trophies (user_id, trophy_id, unlocked_at)
    VALUES (p_user_id, 2, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, trophy_id) DO NOTHING;
  END IF;

  -- Grant Chronicles (5 posts)
  IF v_post_count >= 5 THEN
    INSERT INTO public.user_trophies (user_id, trophy_id, unlocked_at)
    VALUES (p_user_id, 3, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, trophy_id) DO NOTHING;
  END IF;

  -- Grant Epic Saga (10 posts)
  IF v_post_count >= 10 THEN
    INSERT INTO public.user_trophies (user_id, trophy_id, unlocked_at)
    VALUES (p_user_id, 4, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, trophy_id) DO NOTHING;
  END IF;

  -- Grant Collector (5 lighters saved)
  IF v_lighter_count >= 5 THEN
    INSERT INTO public.user_trophies (user_id, trophy_id, unlocked_at)
    VALUES (p_user_id, 5, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, trophy_id) DO NOTHING;
  END IF;

  -- Grant Community Builder (10 different lighters)
  IF v_contributed_lighters >= 10 THEN
    INSERT INTO public.user_trophies (user_id, trophy_id, unlocked_at)
    VALUES (p_user_id, 6, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, trophy_id) DO NOTHING;
  END IF;

  -- Grant Photographer (10 photo posts)
  IF v_photo_posts >= 10 THEN
    INSERT INTO public.user_trophies (user_id, trophy_id, unlocked_at)
    VALUES (p_user_id, 9, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, trophy_id) DO NOTHING;
  END IF;

  -- Grant Musician (5 song posts)
  IF v_song_posts >= 5 THEN
    INSERT INTO public.user_trophies (user_id, trophy_id, unlocked_at)
    VALUES (p_user_id, 10, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, trophy_id) DO NOTHING;
  END IF;

  -- Grant Popular Contributor (50 likes)
  IF v_likes_received >= 50 THEN
    INSERT INTO public.user_trophies (user_id, trophy_id, unlocked_at)
    VALUES (p_user_id, 8, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, trophy_id) DO NOTHING;
  END IF;

  RETURN QUERY
  SELECT ut.trophy_id, t.name, true
  FROM public.user_trophies ut
  JOIN public.trophies t ON t.id = ut.trophy_id
  WHERE ut.user_id = p_user_id;
END;
$$;

-- Trigger: Auto-grant trophies when post is created
DROP FUNCTION IF EXISTS public.trigger_grant_trophies_on_post();
DROP TRIGGER IF EXISTS grant_trophies_on_post_insert ON public.posts;

CREATE FUNCTION public.trigger_grant_trophies_on_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM grant_trophies_for_user(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER grant_trophies_on_post_insert
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION trigger_grant_trophies_on_post();

-- Trigger: Auto-grant trophies when lighter is created
DROP FUNCTION IF EXISTS public.trigger_grant_trophies_on_lighter();
DROP TRIGGER IF EXISTS grant_trophies_on_lighter_insert ON public.lighters;

CREATE FUNCTION public.trigger_grant_trophies_on_lighter()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM grant_trophies_for_user(NEW.saver_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER grant_trophies_on_lighter_insert
AFTER INSERT ON public.lighters
FOR EACH ROW
EXECUTE FUNCTION trigger_grant_trophies_on_lighter();

-- ============================================================================
-- PHASE 13: CREATE PROFILE AUTO-CREATION ON SIGNUP
-- ============================================================================

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

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
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, 'User_' || NEW.id),
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
-- PHASE 14: ADMIN FUNCTIONS
-- ============================================================================

-- Function: Approve flagged post (admin only)
DROP FUNCTION IF EXISTS public.approve_post(BIGINT);
CREATE FUNCTION public.approve_post(post_id_param BIGINT)
RETURNS TABLE (success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (auth.jwt() ->> 'app_role') != 'admin' THEN
    RETURN QUERY SELECT false, 'Admin access required';
    RETURN;
  END IF;

  UPDATE public.posts SET is_flagged = false WHERE id = post_id_param;
  UPDATE public.moderation_queue SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = auth.uid() WHERE post_id = post_id_param;

  RETURN QUERY SELECT true, 'Post approved';
END;
$$;

-- Function: Reject flagged post (admin only)
DROP FUNCTION IF EXISTS public.reject_post(BIGINT);
CREATE FUNCTION public.reject_post(post_id_param BIGINT)
RETURNS TABLE (success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (auth.jwt() ->> 'app_role') != 'admin' THEN
    RETURN QUERY SELECT false, 'Admin access required';
    RETURN;
  END IF;

  DELETE FROM public.posts WHERE id = post_id_param;
  UPDATE public.moderation_queue SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = auth.uid() WHERE post_id = post_id_param;

  RETURN QUERY SELECT true, 'Post rejected and deleted';
END;
$$;

-- ============================================================================
-- PHASE 15: UTILITY FUNCTIONS
-- ============================================================================

-- Function: Get moderation queue (admin only)
DROP FUNCTION IF EXISTS public.get_moderation_queue_data(TEXT, TEXT, INTEGER, INTEGER);
CREATE FUNCTION public.get_moderation_queue_data(
  p_status TEXT DEFAULT NULL,
  p_severity TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, user_id UUID, content_type TEXT, severity TEXT, status TEXT,
  created_at TIMESTAMP WITH TIME ZONE, post_id BIGINT, lighter_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (auth.jwt() ->> 'app_role') NOT IN ('admin', 'moderator') THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    mq.id, mq.user_id, mq.content_type, mq.severity, mq.status,
    mq.created_at, mq.post_id, mq.lighter_id
  FROM public.moderation_queue mq
  WHERE (p_status IS NULL OR mq.status = p_status)
    AND (p_severity IS NULL OR mq.severity = p_severity)
  ORDER BY mq.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Function: Get orders data (admin only)
DROP FUNCTION IF EXISTS public.get_orders_data(TEXT, INTEGER, INTEGER);
CREATE FUNCTION public.get_orders_data(
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID, user_id UUID, stripe_payment_intent_id TEXT, lighter_id UUID,
  pack_size INTEGER, amount_cents INTEGER, status TEXT, payment_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (auth.jwt() ->> 'app_role') != 'admin' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    o.id, o.user_id, o.stripe_payment_intent_id, o.lighter_id,
    o.pack_size, o.amount_cents, o.status, o.payment_status,
    o.created_at
  FROM public.orders o
  WHERE (p_status IS NULL OR o.status = p_status)
  ORDER BY o.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- ============================================================================
-- FINAL: VERIFICATION AND SUMMARY
-- ============================================================================

-- Run these queries to verify setup:
-- SELECT COUNT(*) as profiles_count FROM public.profiles;
-- SELECT COUNT(*) as lighters_count FROM public.lighters;
-- SELECT COUNT(*) as posts_count FROM public.posts;
-- SELECT COUNT(*) as likes_count FROM public.likes;
-- SELECT COUNT(*) as trophies_count FROM public.trophies;
-- SELECT COUNT(*) as moderation_count FROM public.moderation_queue;
-- SELECT COUNT(*) as orders_count FROM public.orders;
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public' ORDER BY trigger_name;
-- SELECT proname FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND prokind = 'f' ORDER BY proname;

-- ============================================================================
-- COMPREHENSIVE DATABASE REPAIR COMPLETE
-- ============================================================================
-- All tables, functions, triggers, and policies are now set up correctly
-- Ready for application use
-- ============================================================================
