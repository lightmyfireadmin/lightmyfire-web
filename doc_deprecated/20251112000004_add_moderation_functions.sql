-- Migration: Add missing moderation workflow RPC functions
-- Created: 2025-11-12
-- Purpose: Add approve_post and reject_post functions for moderation workflow

-- ============================================================================
-- Function: approve_post
-- Purpose: Approves a flagged post, making it visible to the public
-- Called by: /app/[locale]/moderation/ModerationPostCard.tsx
-- ============================================================================

CREATE OR REPLACE FUNCTION public.approve_post(
  p_post_id BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_moderator_id UUID;
  v_moderator_role TEXT;
  v_post_exists BOOLEAN;
  v_result JSONB;
BEGIN
  -- Get current user's ID from auth context
  v_moderator_id := auth.uid();

  -- Verify moderator is authenticated
  IF v_moderator_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Check if user is moderator or admin
  SELECT role INTO v_moderator_role
  FROM public.profiles
  WHERE id = v_moderator_id;

  IF v_moderator_role NOT IN ('moderator', 'admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient permissions - moderator or admin role required'
    );
  END IF;

  -- Verify post exists
  SELECT EXISTS(SELECT 1 FROM public.posts WHERE id = p_post_id) INTO v_post_exists;

  IF NOT v_post_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Post not found'
    );
  END IF;

  -- Update post to approved status
  UPDATE public.posts
  SET
    requires_review = false,
    is_flagged = false,
    updated_at = NOW()
  WHERE id = p_post_id;

  -- Remove from moderation queue
  DELETE FROM public.moderation_queue
  WHERE post_id = p_post_id;

  -- Log moderation action
  INSERT INTO public.moderator_actions (
    moderator_id,
    action_type,
    target_type,
    target_id,
    details
  ) VALUES (
    v_moderator_id,
    'approve',
    'post',
    p_post_id::TEXT,
    jsonb_build_object(
      'post_id', p_post_id,
      'action', 'approved',
      'timestamp', NOW()
    )
  );

  v_result := jsonb_build_object(
    'success', true,
    'post_id', p_post_id,
    'action', 'approved',
    'moderator_id', v_moderator_id
  );

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_post(BIGINT) TO authenticated;

COMMENT ON FUNCTION public.approve_post IS 'Approves a flagged post and removes it from moderation queue';

-- ============================================================================
-- Function: reject_post
-- Purpose: Rejects a flagged post, keeping it hidden and optionally deleting
-- Called by: /app/[locale]/moderation/ModerationPostCard.tsx
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reject_post(
  p_post_id BIGINT,
  p_reason TEXT DEFAULT NULL,
  p_delete_post BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_moderator_id UUID;
  v_moderator_role TEXT;
  v_post_exists BOOLEAN;
  v_post_user_id UUID;
  v_result JSONB;
BEGIN
  -- Get current user's ID from auth context
  v_moderator_id := auth.uid();

  -- Verify moderator is authenticated
  IF v_moderator_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not authenticated'
    );
  END IF;

  -- Check if user is moderator or admin
  SELECT role INTO v_moderator_role
  FROM public.profiles
  WHERE id = v_moderator_id;

  IF v_moderator_role NOT IN ('moderator', 'admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient permissions - moderator or admin role required'
    );
  END IF;

  -- Verify post exists and get user_id
  SELECT EXISTS(SELECT 1 FROM public.posts WHERE id = p_post_id), user_id
  INTO v_post_exists, v_post_user_id
  FROM public.posts
  WHERE id = p_post_id;

  IF NOT v_post_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Post not found'
    );
  END IF;

  -- If delete flag is true, delete the post entirely
  IF p_delete_post THEN
    DELETE FROM public.posts WHERE id = p_post_id;

    -- Log deletion action
    INSERT INTO public.moderator_actions (
      moderator_id,
      action_type,
      target_type,
      target_id,
      details
    ) VALUES (
      v_moderator_id,
      'delete',
      'post',
      p_post_id::TEXT,
      jsonb_build_object(
        'post_id', p_post_id,
        'action', 'deleted',
        'reason', p_reason,
        'timestamp', NOW()
      )
    );

    v_result := jsonb_build_object(
      'success', true,
      'post_id', p_post_id,
      'action', 'deleted',
      'moderator_id', v_moderator_id
    );
  ELSE
    -- Keep post but mark as rejected (hidden)
    UPDATE public.posts
    SET
      requires_review = true,
      is_flagged = true,
      updated_at = NOW()
    WHERE id = p_post_id;

    -- Update moderation queue with rejection reason
    UPDATE public.moderation_queue
    SET
      status = 'rejected',
      resolution = p_reason,
      resolved_at = NOW(),
      resolved_by = v_moderator_id
    WHERE post_id = p_post_id;

    -- Log rejection action
    INSERT INTO public.moderator_actions (
      moderator_id,
      action_type,
      target_type,
      target_id,
      details
    ) VALUES (
      v_moderator_id,
      'reject',
      'post',
      p_post_id::TEXT,
      jsonb_build_object(
        'post_id', p_post_id,
        'action', 'rejected',
        'reason', p_reason,
        'timestamp', NOW()
      )
    );

    v_result := jsonb_build_object(
      'success', true,
      'post_id', p_post_id,
      'action', 'rejected',
      'reason', p_reason,
      'moderator_id', v_moderator_id
    );
  END IF;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reject_post(BIGINT, TEXT, BOOLEAN) TO authenticated;

COMMENT ON FUNCTION public.reject_post IS 'Rejects a flagged post with optional reason and deletion';
