-- Function to create multiple lighters at once for sticker orders
-- Returns array of created lighters with their PIN codes

CREATE OR REPLACE FUNCTION public.create_bulk_lighters(
  p_user_id UUID,
  p_lighter_data JSONB  -- Array of {name: string, backgroundColor: string}
)
RETURNS TABLE(
  lighter_id UUID,
  lighter_name TEXT,
  pin_code TEXT,
  background_color TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lighter JSONB;
  v_new_lighter RECORD;
BEGIN
  -- Validate user is authenticated
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Loop through each lighter in the array
  FOR v_lighter IN SELECT * FROM jsonb_array_elements(p_lighter_data)
  LOOP
    -- Insert new lighter with auto-generated PIN
    INSERT INTO lighters (saver_id, name, pin_code, created_at)
    VALUES (
      p_user_id,
      v_lighter->>'name',
      generate_random_pin(),
      NOW()
    )
    RETURNING id, name, pin_code INTO v_new_lighter;

    -- Return the created lighter details
    lighter_id := v_new_lighter.id;
    lighter_name := v_new_lighter.name;
    pin_code := v_new_lighter.pin_code;
    background_color := v_lighter->>'backgroundColor';

    RETURN NEXT;
  END LOOP;

  -- Grant any unlocked trophies to the user
  PERFORM grant_unlocked_trophies(p_user_id);

  RETURN;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_bulk_lighters(UUID, JSONB) TO authenticated;

COMMENT ON FUNCTION public.create_bulk_lighters IS 'Creates multiple lighters for a user and returns their details with PIN codes. Automatically checks for trophy unlocks.';
