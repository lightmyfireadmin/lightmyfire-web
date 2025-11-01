-- ============================================================================
-- LightMyFire - FINAL CORRECTED SUPABASE SECURITY FIXES
-- ============================================================================
-- Based on ACTUAL function definitions from database
-- FIXED: Quote escaping in generate_random_pin
-- ============================================================================

-- ============================================================================
-- 1. FIX SECURITY DEFINER VIEW
-- ============================================================================
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
  p.flagged_count,
  u.username,
  u.nationality,
  u.show_nationality,
  u.role,
  l.name as lighter_name,
  l.custom_background_url,
  (SELECT COUNT(*)::bigint FROM public.likes pl WHERE pl.post_id = p.id) AS like_count
FROM public.posts p
LEFT JOIN public.profiles u ON u.id = p.user_id
LEFT JOIN public.lighters l ON l.id = p.lighter_id
WHERE p.is_flagged = FALSE;

GRANT SELECT ON public.detailed_posts TO authenticated, anon;

-- ============================================================================
-- 2. FIX FUNCTION SEARCH PATH MUTABLE
-- ============================================================================

-- 2.1 create_new_post - Version 1 (with auth.uid())
CREATE OR REPLACE FUNCTION public.create_new_post(
  p_lighter_id uuid,
  p_post_type text,
  p_title text,
  p_content_text text,
  p_content_url text,
  p_location_name text,
  p_location_lat numeric,
  p_location_lng numeric,
  p_is_find_location boolean,
  p_is_creation boolean,
  p_is_anonymous boolean,
  p_is_public boolean
)
RETURNS json
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.posts (
    lighter_id, user_id, post_type, title, content_text, content_url,
    location_name, location_lat, location_lng,
    is_find_location, is_creation, is_anonymous, is_public
  )
  VALUES (
    p_lighter_id, auth.uid(), p_post_type, p_title, p_content_text, p_content_url,
    p_location_name, p_location_lat, p_location_lng,
    p_is_find_location, p_is_creation, p_is_anonymous, p_is_public
  );

  RETURN json_build_object('success', true, 'message', 'Post created successfully');
END;
$function$;

GRANT EXECUTE ON FUNCTION public.create_new_post(uuid, text, text, text, text, text, numeric, numeric, boolean, boolean, boolean, boolean) TO authenticated;

-- 2.2 create_new_post - Version 2 (with explicit p_user_id)
CREATE OR REPLACE FUNCTION public.create_new_post(
  p_user_id uuid,
  p_lighter_id uuid,
  p_post_type text,
  p_title text,
  p_content_text text,
  p_content_url text,
  p_location_name text,
  p_location_lat numeric,
  p_location_lng numeric,
  p_is_find_location boolean,
  p_is_creation boolean,
  p_is_anonymous boolean,
  p_is_public boolean
)
RETURNS json
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    v_post_id bigint;
    v_lighter_exists boolean;
BEGIN
    SELECT EXISTS(SELECT 1 FROM public.lighters WHERE id = p_lighter_id)
    INTO v_lighter_exists;

    IF NOT v_lighter_exists THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Lighter not found'
        );
    END IF;

    INSERT INTO public.posts (
        lighter_id,
        user_id,
        post_type,
        title,
        content_text,
        content_url,
        location_name,
        location_lat,
        location_lng,
        is_find_location,
        is_creation,
        is_anonymous,
        is_public
    )
    VALUES (
        p_lighter_id,
        p_user_id,
        p_post_type,
        p_title,
        p_content_text,
        p_content_url,
        p_location_name,
        p_location_lat,
        p_location_lng,
        p_is_find_location,
        p_is_creation,
        p_is_anonymous,
        p_is_public
    )
    RETURNING id INTO v_post_id;

    RETURN json_build_object(
        'success', true,
        'post_id', v_post_id,
        'message', 'Post created successfully'
    );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.create_new_post(uuid, uuid, text, text, text, text, text, numeric, numeric, boolean, boolean, boolean, boolean) TO authenticated;

-- 2.3 toggle_like - Version 1 (with uuid, returns json)
CREATE OR REPLACE FUNCTION public.toggle_like(p_post_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id uuid;
  v_existing_like_id uuid;
  v_result json;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  SELECT id INTO v_existing_like_id
  FROM public.likes
  WHERE likes.post_id = p_post_id
    AND likes.user_id = v_user_id;

  IF v_existing_like_id IS NOT NULL THEN
    DELETE FROM public.likes WHERE likes.id = v_existing_like_id;
    v_result := json_build_object(
      'action', 'unliked',
      'post_id', p_post_id,
      'success', true
    );
  ELSE
    INSERT INTO public.likes (post_id, user_id)
    VALUES (p_post_id, v_user_id);
    v_result := json_build_object(
      'action', 'liked',
      'post_id', p_post_id,
      'success', true
    );
  END IF;

  RETURN v_result;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.toggle_like(uuid) TO authenticated;

-- 2.4 toggle_like - Version 2 (with bigint, returns void)
CREATE OR REPLACE FUNCTION public.toggle_like(post_to_like_id bigint)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  user_id uuid := auth.uid();
BEGIN
  IF EXISTS (SELECT 1 FROM public.likes WHERE public.likes.user_id = user_id AND public.likes.post_id = post_to_like_id) THEN
    DELETE FROM public.likes WHERE public.likes.user_id = user_id AND public.likes.post_id = post_to_like_id;
  ELSE
    INSERT INTO public.likes (user_id, post_id) VALUES (user_id, post_to_like_id);
  END IF;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.toggle_like(bigint) TO authenticated;

-- 2.5 flag_post
CREATE OR REPLACE FUNCTION public.flag_post(post_to_flag_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.posts
  SET flagged_count = flagged_count + 1
  WHERE id = post_to_flag_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.flag_post(bigint) TO authenticated;

-- 2.6 delete_post_by_moderator
CREATE OR REPLACE FUNCTION public.delete_post_by_moderator(post_id_to_delete bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    DELETE FROM public.posts
    WHERE id = post_id_to_delete;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.delete_post_by_moderator(bigint) TO authenticated;

-- 2.7 reinstate_post
CREATE OR REPLACE FUNCTION public.reinstate_post(post_id_to_reinstate bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    UPDATE public.posts
    SET is_flagged = FALSE
    WHERE id = post_id_to_reinstate;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.reinstate_post(bigint) TO authenticated;

-- 2.8 calculate_distance
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
RETURNS double precision
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  R integer = 6371;
  dLat float8 = radians(lat2 - lat1);
  dLon float8 = radians(lon2 - lon1);
  a float8;
  c float8;
BEGIN
    a := sin(dLat / 2) * sin(dLat / 2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon / 2) * sin(dLon / 2);
    c := 2 * asin(sqrt(a));
    RETURN R * c;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.calculate_distance(double precision, double precision, double precision, double precision) TO authenticated, anon;

-- 2.9 get_random_public_posts
CREATE OR REPLACE FUNCTION public.get_random_public_posts(limit_count integer)
RETURNS TABLE(
  id bigint,
  lighter_id uuid,
  user_id uuid,
  created_at timestamp with time zone,
  post_type text,
  title text,
  content_text text,
  content_url text,
  location_name text,
  location_lat numeric,
  location_lng numeric,
  is_find_location boolean,
  is_creation boolean,
  is_anonymous boolean,
  is_pinned boolean,
  username text,
  like_count bigint,
  user_has_liked boolean,
  nationality text,
  show_nationality boolean,
  is_public boolean,
  is_flagged boolean,
  flagged_count integer
)
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
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
    COALESCE(prof.username, 'Anonymous') AS username,
    (SELECT COUNT(*) FROM public.likes l WHERE l.post_id = p.id) AS like_count,
    EXISTS(SELECT 1 FROM public.likes l WHERE l.post_id = p.id AND l.user_id = auth.uid()) AS user_has_liked,
    prof.nationality,
    prof.show_nationality,
    p.is_public,
    p.is_flagged,
    p.flagged_count
  FROM public.posts p
  LEFT JOIN public.profiles prof ON p.user_id = prof.id
  WHERE p.is_public = true AND p.is_flagged = false
  ORDER BY random()
  LIMIT limit_count;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_random_public_posts(integer) TO authenticated, anon;

-- 2.10 create_new_lighter
CREATE OR REPLACE FUNCTION public.create_new_lighter(
  lighter_name text,
  background_url text,
  show_username boolean
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  new_pin text;
  new_lighter_id uuid;
BEGIN
  new_pin := public.generate_random_pin();

  WHILE EXISTS (SELECT 1 FROM public.lighters WHERE pin_code = new_pin) LOOP
    new_pin := public.generate_random_pin();
  END LOOP;

  INSERT INTO public.lighters (saver_id, name, pin_code, custom_background_url, show_saver_username)
  VALUES (auth.uid(), lighter_name, new_pin, background_url, show_username)
  RETURNING id INTO new_lighter_id;

  RETURN new_lighter_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.create_new_lighter(text, text, boolean) TO authenticated;

-- 2.11 get_lighter_id_from_pin
CREATE OR REPLACE FUNCTION public.get_lighter_id_from_pin(pin_to_check text)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  lighter_uuid uuid;
BEGIN
  SELECT id INTO lighter_uuid FROM public.lighters WHERE pin_code = pin_to_check;
  RETURN lighter_uuid;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_lighter_id_from_pin(text) TO authenticated, anon;

-- 2.12 generate_random_pin - FIXED QUOTE ESCAPING
CREATE OR REPLACE FUNCTION public.generate_random_pin()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text[] := ARRAY['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
  pin text := '';
  i integer;
BEGIN
  FOR i IN 1..3 LOOP
    pin := pin || chars[1 + floor(random() * 26)::int];
  END LOOP;
  pin := pin || '-';
  FOR i IN 1..3 LOOP
    pin := pin || chars[27 + floor(random() * 10)::int];
  END LOOP;
  RETURN pin;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_random_pin() TO authenticated, anon;

-- 2.13 get_my_stats
CREATE OR REPLACE FUNCTION public.get_my_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    stats_payload json;
BEGIN
    SELECT json_build_object(
        'total_contributions', (SELECT COUNT(*) FROM public.posts WHERE user_id = auth.uid()),
        'lighters_saved', (SELECT COUNT(*) FROM public.lighters WHERE saver_id = auth.uid()),
        'lighters_contributed_to', (SELECT COUNT(DISTINCT lighter_id) FROM public.posts WHERE user_id = auth.uid()),
        'likes_received', (SELECT COUNT(*) FROM public.likes l JOIN public.posts p ON l.post_id = p.id WHERE p.user_id = auth.uid())
    ) INTO stats_payload;

    RETURN stats_payload;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_my_stats() TO authenticated;

-- 2.14 grant_trophy
CREATE OR REPLACE FUNCTION public.grant_trophy(
  user_to_grant_id uuid,
  trophy_to_grant_id integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_trophies (user_id, trophy_id)
  VALUES (user_to_grant_id, trophy_to_grant_id)
  ON CONFLICT (user_id, trophy_id) DO NOTHING;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.grant_trophy(uuid, integer) TO authenticated;

-- 2.15 backfill_all_trophies
CREATE OR REPLACE FUNCTION public.backfill_all_trophies()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_record record;
  post_count int;
  lighter_count int;
  creation_count int;
  distinct_lighter_count int;
  refuel_count int;
BEGIN
  FOR user_record IN SELECT id FROM public.profiles LOOP

    SELECT COUNT(*) INTO lighter_count FROM public.lighters WHERE saver_id = user_record.id;
    IF lighter_count >= 1 THEN
      PERFORM public.grant_trophy(user_record.id, 1);
    END IF;

    SELECT COUNT(*) INTO post_count FROM public.posts WHERE user_id = user_record.id;
    IF post_count >= 1 THEN
      PERFORM public.grant_trophy(user_record.id, 2);
    END IF;

    SELECT COUNT(*) INTO creation_count FROM public.posts WHERE user_id = user_record.id AND is_creation = true;
    IF creation_count >= 1 THEN
      PERFORM public.grant_trophy(user_record.id, 3);
    END IF;

    SELECT COUNT(DISTINCT lighter_id) INTO distinct_lighter_count FROM public.posts WHERE user_id = user_record.id;
    IF distinct_lighter_count >= 5 THEN
      PERFORM public.grant_trophy(user_record.id, 4);
    END IF;

    SELECT COUNT(*) INTO refuel_count FROM public.posts WHERE user_id = user_record.id AND post_type = 'refuel';
    IF refuel_count >= 1 THEN
      PERFORM public.grant_trophy(user_record.id, 5);
    END IF;

  END LOOP;

  RETURN 'Trophy backfill complete for all users.';
END;
$function$;

GRANT EXECUTE ON FUNCTION public.backfill_all_trophies() TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT
  p.proname as function_name,
  CASE
    WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN '✓ FIXED'
    ELSE '✗ NEEDS FIX'
  END as status
FROM pg_proc p
WHERE p.proname IN (
  'create_new_post', 'flag_post', 'delete_post_by_moderator',
  'toggle_like', 'calculate_distance', 'reinstate_post',
  'get_random_public_posts', 'create_new_lighter', 'get_lighter_id_from_pin',
  'generate_random_pin', 'get_my_stats', 'grant_trophy',
  'backfill_all_trophies'
)
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY p.proname;

-- ============================================================================
-- COMPLETE
-- ============================================================================
-- ✓ SECURITY DEFINER removed from detailed_posts view
-- ✓ SET search_path = public added to 15 functions
-- ✓ Using correct column names and table references
-- ✓ Fixed quote escaping in generate_random_pin
--
-- REMAINING MANUAL STEP:
-- Enable Leaked Password Protection in Supabase Dashboard:
-- 1. Go to Authentication → Settings
-- 2. Under "Security", toggle "Leaked password protection" ON
-- 3. Click Save
