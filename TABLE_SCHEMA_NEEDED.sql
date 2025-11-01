-- Run this to get exact table column information
-- Copy results back to Claude

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('posts', 'lighters', 'profiles', 'post_likes', 'likes')
ORDER BY table_name, ordinal_position;
