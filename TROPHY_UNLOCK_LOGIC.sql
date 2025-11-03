-- ============================================================================
-- TROPHY UNLOCK SYSTEM
-- Auto-unlock trophies based on user actions
-- ============================================================================

-- Function to check and unlock trophies for a user
CREATE OR REPLACE FUNCTION unlock_user_trophies(p_user_id UUID)
RETURNS TABLE (trophy_id INTEGER, trophy_name TEXT, newly_unlocked BOOLEAN) AS $$
DECLARE
  v_post_count INTEGER;
  v_lighter_count INTEGER;
  v_contributed_to_count INTEGER;
  v_likes_count INTEGER;
  v_photo_posts INTEGER;
  v_song_posts INTEGER;
BEGIN
  -- Get user's statistics
  SELECT COUNT(*)
  INTO v_post_count
  FROM posts
  WHERE user_id = p_user_id;

  SELECT COUNT(*)
  INTO v_lighter_count
  FROM lighters
  WHERE saver_id = p_user_id;

  SELECT COUNT(DISTINCT lighter_id)
  INTO v_contributed_to_count
  FROM posts
  WHERE user_id = p_user_id;

  SELECT COUNT(*)
  INTO v_photo_posts
  FROM posts
  WHERE user_id = p_user_id AND post_type = 'image';

  SELECT COUNT(*)
  INTO v_song_posts
  FROM posts
  WHERE user_id = p_user_id AND post_type = 'song';

  -- Get likes received on user's posts (assuming likes table exists)
  SELECT COUNT(*)
  INTO v_likes_count
  FROM post_likes pl
  JOIN posts p ON pl.post_id = p.id
  WHERE p.user_id = p_user_id;

  -- Return trophy unlock status
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    (NOT EXISTS(SELECT 1 FROM user_trophies ut WHERE ut.user_id = p_user_id AND ut.trophy_id = t.id)) as newly_unlocked
  FROM trophies t
  WHERE
    -- first_post: 1+ posts
    (t.id = 1 AND v_post_count >= 1)
    OR
    -- first_save: 1+ lighter saved
    (t.id = 2 AND v_lighter_count >= 1)
    OR
    -- five_posts: 5+ posts
    (t.id = 3 AND v_post_count >= 5)
    OR
    -- ten_posts: 10+ posts
    (t.id = 4 AND v_post_count >= 10)
    OR
    -- collector: 5+ lighters saved
    (t.id = 5 AND v_lighter_count >= 5)
    OR
    -- community_builder: 10+ different lighters contributed to
    (t.id = 6 AND v_contributed_to_count >= 10)
    OR
    -- photographer: 10+ photo posts
    (t.id = 7 AND v_photo_posts >= 10)
    OR
    -- musician: 5+ song posts
    (t.id = 8 AND v_song_posts >= 5);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-grant unlocked trophies
CREATE OR REPLACE FUNCTION grant_unlocked_trophies(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert new trophy unlocks
  INSERT INTO user_trophies (user_id, trophy_id, unlocked_at)
  SELECT
    p_user_id,
    (unlock_user_trophies(p_user_id)).trophy_id,
    NOW()
  FROM (
    SELECT DISTINCT (unlock_user_trophies(p_user_id)).trophy_id as trophy_id,
           (unlock_user_trophies(p_user_id)).newly_unlocked
    FROM unlock_user_trophies(p_user_id)
    WHERE newly_unlocked = TRUE
  ) t
  ON CONFLICT (user_id, trophy_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-unlock trophies when a post is created
CREATE OR REPLACE FUNCTION trigger_check_trophy_on_post()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM grant_unlocked_trophies(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_trophy_on_post_insert ON posts;
CREATE TRIGGER check_trophy_on_post_insert
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION trigger_check_trophy_on_post();

-- Trigger to auto-unlock trophies when a lighter is saved
CREATE OR REPLACE FUNCTION trigger_check_trophy_on_lighter()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM grant_unlocked_trophies(NEW.saver_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_trophy_on_lighter_insert ON lighters;
CREATE TRIGGER check_trophy_on_lighter_insert
AFTER INSERT ON lighters
FOR EACH ROW
EXECUTE FUNCTION trigger_check_trophy_on_lighter();

-- One-time function to unlock trophies for existing users
-- Run this once to sync all existing users' trophies
CREATE OR REPLACE FUNCTION sync_existing_user_trophies()
RETURNS TABLE (user_id UUID, trophies_granted INTEGER) AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER;
BEGIN
  FOR v_user_id IN
    SELECT DISTINCT user_id FROM posts
    UNION
    SELECT DISTINCT saver_id FROM lighters
  LOOP
    PERFORM grant_unlocked_trophies(v_user_id);

    SELECT COUNT(*)
    INTO v_count
    FROM user_trophies
    WHERE user_id = v_user_id;

    RETURN QUERY SELECT v_user_id, v_count;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
