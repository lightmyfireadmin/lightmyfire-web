-- Migration: Add missing order workflow RPC functions
-- Created: 2025-11-12
-- Purpose: Add create_bulk_lighters and update_order_payment_succeeded functions

-- ============================================================================
-- Function: create_bulk_lighters
-- Purpose: Creates multiple lighters in bulk from sticker order data
-- Called by: /app/api/process-sticker-order/route.ts
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_bulk_lighters(
  p_user_id UUID,
  p_lighter_data JSONB
)
RETURNS TABLE (
  lighter_id UUID,
  lighter_name TEXT,
  pin_code TEXT,
  background_color TEXT,
  sticker_language TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lighter JSONB;
  v_generated_pin TEXT;
  v_created_lighter RECORD;
  v_max_retries INT := 10;
  v_retry_count INT;
BEGIN
  -- Validate input
  IF p_lighter_data IS NULL OR jsonb_array_length(p_lighter_data) = 0 THEN
    RAISE EXCEPTION 'lighter_data cannot be null or empty';
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
  END IF;

  -- Verify user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User with ID % does not exist', p_user_id;
  END IF;

  -- Loop through each lighter in the array
  FOR v_lighter IN SELECT * FROM jsonb_array_elements(p_lighter_data)
  LOOP
    v_retry_count := 0;

    -- Generate unique PIN code with retry logic
    LOOP
      -- Generate 6-digit PIN code (e.g., "ABC123")
      v_generated_pin := UPPER(
        CHR(65 + floor(random() * 26)::int) ||  -- Random letter A-Z
        CHR(65 + floor(random() * 26)::int) ||  -- Random letter A-Z
        CHR(65 + floor(random() * 26)::int) ||  -- Random letter A-Z
        LPAD(floor(random() * 1000)::text, 3, '0') -- 3-digit number
      );

      -- Check if PIN is unique
      IF NOT EXISTS (SELECT 1 FROM public.lighters WHERE pin_code = v_generated_pin) THEN
        EXIT; -- PIN is unique, exit loop
      END IF;

      v_retry_count := v_retry_count + 1;

      IF v_retry_count >= v_max_retries THEN
        RAISE EXCEPTION 'Failed to generate unique PIN code after % attempts', v_max_retries;
      END IF;
    END LOOP;

    -- Insert lighter and return the created row
    INSERT INTO public.lighters (
      name,
      pin_code,
      saver_id,
      background_color,
      sticker_language,
      post_count,
      times_refueled,
      is_retired,
      show_saver_username,
      created_at,
      updated_at
    )
    VALUES (
      v_lighter->>'name',
      v_generated_pin,
      p_user_id,
      v_lighter->>'backgroundColor',
      v_lighter->>'language',
      0,  -- Initial post count
      0,  -- Initial times refueled
      false,  -- Not retired
      true,  -- Show saver username by default
      NOW(),
      NOW()
    )
    RETURNING id, name, pin_code, background_color, sticker_language
    INTO v_created_lighter;

    -- Return the created lighter data
    lighter_id := v_created_lighter.id;
    lighter_name := v_created_lighter.name;
    pin_code := v_created_lighter.pin_code;
    background_color := v_created_lighter.background_color;
    sticker_language := v_created_lighter.sticker_language;

    RETURN NEXT;
  END LOOP;

  RETURN;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_bulk_lighters(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_bulk_lighters(UUID, JSONB) TO service_role;

COMMENT ON FUNCTION public.create_bulk_lighters IS 'Creates multiple lighters in bulk from order data and returns their IDs and PIN codes';

-- ============================================================================
-- Function: update_order_payment_succeeded
-- Purpose: Updates sticker order status when Stripe payment succeeds
-- Called by: /app/api/webhooks/stripe/route.ts
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_order_payment_succeeded(
  p_payment_intent_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Validate input
  IF p_payment_intent_id IS NULL OR p_payment_intent_id = '' THEN
    RAISE EXCEPTION 'payment_intent_id cannot be null or empty';
  END IF;

  -- Find the order by payment intent ID
  SELECT id, user_id INTO v_order_id, v_user_id
  FROM public.sticker_orders
  WHERE payment_intent_id = p_payment_intent_id;

  -- If order doesn't exist, return error
  IF v_order_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found',
      'payment_intent_id', p_payment_intent_id
    );
  END IF;

  -- Update order status to indicate payment succeeded
  UPDATE public.sticker_orders
  SET
    status = CASE
      WHEN status = 'processing' THEN 'processing'  -- Keep processing if already set
      WHEN status = 'pending' THEN 'pending'        -- Keep pending if already set
      ELSE 'paid'                                    -- Otherwise mark as paid
    END,
    paid_at = COALESCE(paid_at, NOW()),              -- Set paid_at if not already set
    updated_at = NOW()
  WHERE id = v_order_id;

  -- Return success with order details
  v_result := jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'user_id', v_user_id,
    'payment_intent_id', p_payment_intent_id,
    'updated_at', NOW()
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to service role (webhooks use service key)
GRANT EXECUTE ON FUNCTION public.update_order_payment_succeeded(TEXT) TO service_role;

COMMENT ON FUNCTION public.update_order_payment_succeeded IS 'Updates sticker order status when Stripe webhook confirms payment success';
