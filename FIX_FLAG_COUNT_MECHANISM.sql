-- =====================================================
-- FIX FLAG COUNT MECHANISM
-- Critical Fix for Post Flagging System
-- Date: 2025-11-04
-- =====================================================

-- STEP 1: Create post_flags junction table
-- This tracks which users have flagged which posts
CREATE TABLE IF NOT EXISTS post_flags (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_post_flags_post_id ON post_flags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_flags_user_id ON post_flags(user_id);

-- Enable RLS
ALTER TABLE post_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_flags
CREATE POLICY "Users can flag posts" ON post_flags
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see their own flags" ON post_flags
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators can see all flags" ON post_flags
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('moderator', 'admin')
    )
  );

-- =====================================================
-- STEP 2: Create trigger function to increment flag count
-- =====================================================

CREATE OR REPLACE FUNCTION increment_post_flag_count()
RETURNS TRIGGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Increment the flag count
  UPDATE posts 
  SET flagged_count = flagged_count + 1
  WHERE id = NEW.post_id
  RETURNING flagged_count INTO new_count;

  -- Set is_flagged to true if count >= 3
  IF new_count >= 3 THEN
    UPDATE posts 
    SET is_flagged = true
    WHERE id = NEW.post_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_post_flagged ON post_flags;
CREATE TRIGGER on_post_flagged
  AFTER INSERT ON post_flags
  FOR EACH ROW
  EXECUTE FUNCTION increment_post_flag_count();

-- =====================================================
-- STEP 3: Update flag_post RPC function
-- =====================================================

CREATE OR REPLACE FUNCTION flag_post(post_to_flag_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert flag (will trigger increment_post_flag_count)
  -- ON CONFLICT prevents duplicate flags from same user
  INSERT INTO post_flags (user_id, post_id)
  VALUES (auth.uid(), post_to_flag_id)
  ON CONFLICT (user_id, post_id) DO NOTHING;
  
END;
$$;

-- =====================================================
-- STEP 4: Add helper function to unflag posts (for moderators)
-- =====================================================

CREATE OR REPLACE FUNCTION unflag_post(post_to_unflag_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is moderator or admin
  IF NOT (
    SELECT role IN ('moderator', 'admin')
    FROM profiles
    WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Remove all flags and reset counters
  DELETE FROM post_flags WHERE post_id = post_to_unflag_id;
  
  UPDATE posts 
  SET 
    flagged_count = 0,
    is_flagged = false
  WHERE id = post_to_unflag_id;
  
END;
$$;

-- =====================================================
-- STEP 5: Backfill existing flagged posts
-- =====================================================

-- Reset all flag counts to 0 (fresh start)
UPDATE posts SET flagged_count = 0, is_flagged = false;

-- Note: If you have existing flagging data elsewhere, 
-- migrate it to post_flags table here

-- =====================================================
-- STEP 6: Grant necessary permissions
-- =====================================================

GRANT SELECT ON post_flags TO authenticated;
GRANT INSERT ON post_flags TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Test 1: Check table exists
-- SELECT * FROM post_flags LIMIT 1;

-- Test 2: Test flag_post function
-- SELECT flag_post(1); -- Replace 1 with actual post ID

-- Test 3: Verify trigger increments count
-- SELECT id, flagged_count, is_flagged FROM posts WHERE id = 1;

-- Test 4: Test unflag_post (as moderator)
-- SELECT unflag_post(1);

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

-- To rollback this migration:
-- DROP TRIGGER IF EXISTS on_post_flagged ON post_flags;
-- DROP FUNCTION IF EXISTS increment_post_flag_count();
-- DROP FUNCTION IF EXISTS flag_post(BIGINT);
-- DROP FUNCTION IF EXISTS unflag_post(BIGINT);
-- DROP TABLE IF EXISTS post_flags CASCADE;

