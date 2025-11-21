-- =====================================================
-- Missing Database Functions Fix
-- Created: 2025-11-12
-- Purpose: Add missing admin and post creation functions
-- =====================================================

-- =====================================================
-- FUNCTION 1: admin_get_moderators
-- =====================================================
-- Returns all users with admin or moderator roles
CREATE OR REPLACE FUNCTION admin_get_moderators()
RETURNS TABLE (
  user_id TEXT,
  email TEXT,
  username TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Return all users with admin or moderator roles
  RETURN QUERY
  SELECT
    p.id::TEXT as user_id,
    COALESCE(u.email, '')::TEXT as email,
    p.username::TEXT,
    p.role::TEXT,
    p.created_at
  FROM profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  WHERE p.role IN ('admin', 'moderator')
  ORDER BY
    CASE p.role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      ELSE 3
    END,
    p.created_at ASC;
END;
$$;

-- =====================================================
-- FUNCTION 2: admin_grant_moderator
-- =====================================================
-- Grants moderator role to a user by email
CREATE OR REPLACE FUNCTION admin_grant_moderator(p_user_email TEXT)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_current_role TEXT;
  v_result JSON;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Access denied. Admin privileges required.'
    );
  END IF;

  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_user_email;

  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found with email: ' || p_user_email
    );
  END IF;

  -- Get current role
  SELECT role INTO v_current_role
  FROM profiles
  WHERE id = v_user_id;

  -- Check if already admin
  IF v_current_role = 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User is already an admin. Cannot demote to moderator.'
    );
  END IF;

  -- Check if already moderator
  IF v_current_role = 'moderator' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User is already a moderator.'
    );
  END IF;

  -- Grant moderator role
  UPDATE profiles
  SET role = 'moderator'
  WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Moderator role granted successfully to ' || p_user_email
  );
END;
$$;

-- =====================================================
-- FUNCTION 3: admin_revoke_moderator
-- =====================================================
-- Revokes moderator role from a user
CREATE OR REPLACE FUNCTION admin_revoke_moderator(p_user_id TEXT)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_role TEXT;
  v_user_email TEXT;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Access denied. Admin privileges required.'
    );
  END IF;

  -- Get current role and email
  SELECT p.role, u.email
  INTO v_current_role, v_user_email
  FROM profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  WHERE p.id = p_user_id::UUID;

  IF v_current_role IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found.'
    );
  END IF;

  -- Check if user is admin
  IF v_current_role = 'admin' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot revoke admin role. This operation is only for moderators.'
    );
  END IF;

  -- Check if user is not a moderator
  IF v_current_role != 'moderator' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User is not a moderator.'
    );
  END IF;

  -- Revoke moderator role (set to user)
  UPDATE profiles
  SET role = 'user'
  WHERE id = p_user_id::UUID;

  RETURN json_build_object(
    'success', true,
    'message', 'Moderator role revoked successfully from ' || COALESCE(v_user_email, 'user')
  );
END;
$$;

-- =====================================================
-- FUNCTION 4: create_new_post
-- =====================================================
-- Creates a new post with proper validation and moderation support
CREATE OR REPLACE FUNCTION create_new_post(
  p_lighter_id TEXT,
  p_post_type TEXT,
  p_content_text TEXT DEFAULT NULL,
  p_content_url TEXT DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_location_name TEXT DEFAULT NULL,
  p_location_lat FLOAT DEFAULT NULL,
  p_location_lng FLOAT DEFAULT NULL,
  p_is_creation BOOLEAN DEFAULT FALSE,
  p_is_find_location BOOLEAN DEFAULT FALSE,
  p_is_anonymous BOOLEAN DEFAULT FALSE,
  p_is_public BOOLEAN DEFAULT TRUE,
  p_requires_review BOOLEAN DEFAULT FALSE
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_post_id INT;
  v_user_id UUID;
  v_lighter_exists BOOLEAN;
  v_result JSON;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized. Please sign in to create a post.'
    );
  END IF;

  -- Validate lighter exists
  SELECT EXISTS(SELECT 1 FROM lighters WHERE id = p_lighter_id)
  INTO v_lighter_exists;

  IF NOT v_lighter_exists THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Lighter not found.'
    );
  END IF;

  -- Validate post type
  IF p_post_type NOT IN ('text', 'song', 'image', 'location', 'refuel') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid post type.'
    );
  END IF;

  -- Validate content based on post type
  IF p_post_type = 'text' AND (p_content_text IS NULL OR TRIM(p_content_text) = '') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Text content is required for text posts.'
    );
  END IF;

  IF p_post_type IN ('song', 'image') AND (p_content_url IS NULL OR TRIM(p_content_url) = '') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Content URL is required for ' || p_post_type || ' posts.'
    );
  END IF;

  IF p_post_type = 'location' AND (p_location_lat IS NULL OR p_location_lng IS NULL) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Location coordinates are required for location posts.'
    );
  END IF;

  -- Insert the post
  INSERT INTO posts (
    lighter_id,
    user_id,
    post_type,
    content_text,
    content_url,
    title,
    location_name,
    location_lat,
    location_lng,
    is_creation,
    is_find_location,
    is_anonymous,
    is_public,
    requires_review,
    created_at
  ) VALUES (
    p_lighter_id,
    v_user_id,
    p_post_type,
    p_content_text,
    p_content_url,
    p_title,
    p_location_name,
    p_location_lat,
    p_location_lng,
    p_is_creation,
    p_is_find_location,
    p_is_anonymous,
    p_is_public,
    p_requires_review,
    NOW()
  )
  RETURNING id INTO v_post_id;

  -- If flagged for review, add to moderation queue
  IF p_requires_review THEN
    INSERT INTO moderation_queue (
      post_id,
      user_id,
      lighter_id,
      content_type,
      content,
      content_url,
      status,
      severity,
      flagged,
      created_at
    ) VALUES (
      v_post_id,
      v_user_id,
      p_lighter_id,
      p_post_type,
      COALESCE(p_content_text, p_title, p_location_name, ''),
      p_content_url,
      'pending',
      'medium',
      true,
      NOW()
    );
  END IF;

  -- Update lighter post count
  UPDATE lighters
  SET
    post_count = post_count + 1,
    updated_at = NOW()
  WHERE id = p_lighter_id;

  -- Update lighter_contributions
  INSERT INTO lighter_contributions (lighter_id, user_id, last_post_at)
  VALUES (p_lighter_id, v_user_id, NOW())
  ON CONFLICT (lighter_id, user_id)
  DO UPDATE SET last_post_at = NOW();

  RETURN json_build_object(
    'success', true,
    'post_id', v_post_id,
    'requires_review', p_requires_review,
    'message', CASE
      WHEN p_requires_review THEN 'Post created and queued for moderation review.'
      ELSE 'Post created successfully.'
    END
  );
END;
$$;

-- =====================================================
-- Grant necessary permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION admin_get_moderators() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_grant_moderator(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_revoke_moderator(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_new_post(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, FLOAT, FLOAT, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON FUNCTION admin_get_moderators() IS 'Returns all users with admin or moderator roles. Requires admin privileges.';
COMMENT ON FUNCTION admin_grant_moderator(TEXT) IS 'Grants moderator role to a user by email. Requires admin privileges.';
COMMENT ON FUNCTION admin_revoke_moderator(TEXT) IS 'Revokes moderator role from a user. Requires admin privileges.';
COMMENT ON FUNCTION create_new_post IS 'Creates a new post with validation and moderation support. Handles all post types and adds flagged content to moderation queue.';
