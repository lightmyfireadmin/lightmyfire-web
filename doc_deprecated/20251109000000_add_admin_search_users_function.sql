-- Create a function to search all users by email (admin only)
-- This allows admins to find users even if they haven't placed orders

CREATE OR REPLACE FUNCTION admin_search_users_by_email(search_query TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Search users by email in auth.users (case-insensitive)
  RETURN QUERY
  SELECT
    au.id,
    au.email::TEXT,
    COALESCE(p.username, au.raw_user_meta_data->>'name', 'Unknown')::TEXT as username
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE au.email ILIKE '%' || search_query || '%'
  ORDER BY au.email
  LIMIT 50;
END;
$$;

-- Grant execute permission to authenticated users (the function itself checks for admin)
GRANT EXECUTE ON FUNCTION admin_search_users_by_email(TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION admin_search_users_by_email IS
'Searches all users by email address. Only accessible to admins. Returns user ID, email, and username.';
