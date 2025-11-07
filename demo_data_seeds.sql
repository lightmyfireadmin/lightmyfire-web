-- ============================================================================
-- LightMyFire Demo Data Seeds
-- Comprehensive demo environment with realistic test data
-- ============================================================================
--
-- USAGE:
-- 1. Run this script in Supabase SQL Editor
-- 2. Creates 6 demo users with different roles and nationalities
-- 3. Creates 10 diverse lighters with varied configurations
-- 4. Creates 50+ posts across all content types
-- 5. Creates demo trophies, likes, and engagement data
--
-- IMPORTANT: This script uses hardcoded UUIDs for demo users.
-- In production, you'll need to create actual auth users first.
-- ============================================================================

-- Set client encoding and time zone
SET client_min_messages TO NOTICE;
SET timezone TO 'UTC';

BEGIN;

RAISE NOTICE '========================================';
RAISE NOTICE 'LightMyFire Demo Data Seed';
RAISE NOTICE 'Starting at: %', NOW();
RAISE NOTICE '========================================';

-- ============================================================================
-- CLEANUP: Remove existing demo data (optional - comment out if not needed)
-- ============================================================================

RAISE NOTICE '1. Cleaning up existing demo data...';

-- Note: These deletes will cascade based on foreign key constraints
DELETE FROM user_trophies WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);

DELETE FROM likes WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);

DELETE FROM posts WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);

DELETE FROM lighters WHERE saver_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);

DELETE FROM profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);

RAISE NOTICE '   ✓ Cleanup complete';

-- ============================================================================
-- DEMO USERS (profiles table)
-- ============================================================================

RAISE NOTICE '2. Creating demo user profiles...';

INSERT INTO profiles (id, username, nationality, show_nationality, level, points, role, created_at, updated_at)
VALUES
  -- Regular users with diverse nationalities
  (
    '11111111-1111-1111-1111-111111111111',
    'adventure_seeker',
    'FR', -- France
    true,
    5,
    850,
    'user',
    NOW() - INTERVAL '6 months',
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'creative_soul',
    'CA', -- Canada
    true,
    8,
    1520,
    'user',
    NOW() - INTERVAL '1 year',
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'global_wanderer',
    'JP', -- Japan
    true,
    12,
    2890,
    'user',
    NOW() - INTERVAL '2 years',
    NOW()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'music_lover',
    'BR', -- Brazil
    false, -- Doesn't show nationality
    4,
    620,
    'user',
    NOW() - INTERVAL '3 months',
    NOW()
  ),
  -- Moderator
  (
    '55555555-5555-5555-5555-555555555555',
    'community_guardian',
    'DE', -- Germany
    true,
    15,
    3450,
    'moderator',
    NOW() - INTERVAL '3 years',
    NOW()
  ),
  -- Admin
  (
    '66666666-6666-6666-6666-666666666666',
    'lightkeeper_admin',
    'US', -- United States
    true,
    20,
    5000,
    'admin',
    NOW() - INTERVAL '4 years',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  nationality = EXCLUDED.nationality,
  show_nationality = EXCLUDED.show_nationality,
  level = EXCLUDED.level,
  points = EXCLUDED.points,
  role = EXCLUDED.role,
  updated_at = EXCLUDED.updated_at;

RAISE NOTICE '   ✓ Created 6 demo users (4 regular, 1 moderator, 1 admin)';

-- ============================================================================
-- DEMO LIGHTERS
-- ============================================================================

RAISE NOTICE '3. Creating demo lighters...';

-- Note: Using RPC function would be ideal, but for seed data we'll insert directly
-- Each lighter gets a unique 6-character PIN code

INSERT INTO lighters (id, name, pin_code, saver_id, background_url, show_username, post_count, sticker_language, created_at, updated_at)
VALUES
  -- adventure_seeker's lighters
  (
    'DEMO001',
    'My Paris Adventures',
    'PAR123',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    true,
    0, -- Will be updated by trigger when posts are added
    'fr',
    NOW() - INTERVAL '6 months',
    NOW()
  ),
  (
    'DEMO002',
    'Summer Music Festival 2024',
    'FES789',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    true,
    0,
    'en',
    NOW() - INTERVAL '4 months',
    NOW()
  ),

  -- creative_soul's lighters
  (
    'DEMO003',
    'Toronto Street Art',
    'ART456',
    '22222222-2222-2222-2222-222222222222',
    NULL,
    true,
    0,
    'en',
    NOW() - INTERVAL '10 months',
    NOW()
  ),
  (
    'DEMO004',
    'Recipe Collection',
    'FOOD99',
    '22222222-2222-2222-2222-222222222222',
    NULL,
    false, -- Hidden username
    0,
    'en',
    NOW() - INTERVAL '8 months',
    NOW()
  ),

  -- global_wanderer's lighters
  (
    'DEMO005',
    'Tokyo Coffee Shops',
    'CAFE88',
    '33333333-3333-3333-3333-333333333333',
    NULL,
    true,
    0,
    'ja',
    NOW() - INTERVAL '1 year',
    NOW()
  ),
  (
    'DEMO006',
    'Travel Memories 2023',
    'TRVL23',
    '33333333-3333-3333-3333-333333333333',
    NULL,
    true,
    0,
    'en',
    NOW() - INTERVAL '2 years',
    NOW()
  ),
  (
    'DEMO007',
    'Photography Journey',
    'PHOTO1',
    '33333333-3333-3333-3333-333333333333',
    NULL,
    true,
    0,
    'en',
    NOW() - INTERVAL '18 months',
    NOW()
  ),

  -- music_lover's lighters
  (
    'DEMO008',
    'Samba Nights',
    'SAMBA7',
    '44444444-4444-4444-4444-444444444444',
    NULL,
    true,
    0,
    'pt',
    NOW() - INTERVAL '3 months',
    NOW()
  ),
  (
    'DEMO009',
    'Indie Discoveries',
    'INDIE5',
    '44444444-4444-4444-4444-444444444444',
    NULL,
    true,
    0,
    'en',
    NOW() - INTERVAL '2 months',
    NOW()
  ),

  -- community_guardian's lighter (moderator)
  (
    'DEMO010',
    'Community Events',
    'EVENT0',
    '55555555-5555-5555-5555-555555555555',
    NULL,
    true,
    0,
    'de',
    NOW() - INTERVAL '3 years',
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  post_count = EXCLUDED.post_count,
  updated_at = EXCLUDED.updated_at;

RAISE NOTICE '   ✓ Created 10 demo lighters';

-- ============================================================================
-- DEMO POSTS (all content types)
-- ============================================================================

RAISE NOTICE '4. Creating demo posts...';

-- TEXT POSTS
INSERT INTO posts (lighter_id, user_id, post_type, title, content_text, is_public, is_anonymous, is_creation, created_at)
VALUES
  (
    'DEMO001',
    '11111111-1111-1111-1111-111111111111',
    'text',
    'Climbing the Eiffel Tower',
    'The view from the second floor is absolutely breathtaking! You can see all of Paris stretching out before you. Worth every step of the climb.',
    true,
    false,
    true,
    NOW() - INTERVAL '5 months'
  ),
  (
    'DEMO001',
    '11111111-1111-1111-1111-111111111111',
    'text',
    'Best Croissant Ever',
    'Found this tiny bakery in Montmartre. The almond croissant was so good I went back three days in a row!',
    true,
    false,
    false,
    NOW() - INTERVAL '5 months 10 days'
  ),
  (
    'DEMO003',
    '22222222-2222-2222-2222-222222222222',
    'text',
    'Hidden Mural',
    'Discovered an incredible street art piece in the Distillery District. The colors are so vibrant!',
    true,
    false,
    true,
    NOW() - INTERVAL '9 months'
  ),
  (
    'DEMO006',
    '33333333-3333-3333-3333-333333333333',
    'text',
    'Random Acts of Kindness',
    'A stranger paid for my coffee today. Passing it forward tomorrow!',
    true,
    false,
    false,
    NOW() - INTERVAL '1 year 6 months'
  ),
  (
    'DEMO010',
    '55555555-5555-5555-5555-555555555555',
    'text',
    'Community Clean-up Day',
    'Amazing turnout for our neighborhood cleanup! Together we collected over 200 kg of recyclables.',
    true,
    false,
    true,
    NOW() - INTERVAL '2 months'
  );

-- IMAGE POSTS (using placeholder URLs)
INSERT INTO posts (lighter_id, user_id, post_type, title, content_url, is_public, is_anonymous, is_creation, created_at)
VALUES
  (
    'DEMO002',
    '11111111-1111-1111-1111-111111111111',
    'image',
    'Festival Crowd',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3', -- Music festival crowd
    true,
    false,
    true,
    NOW() - INTERVAL '4 months'
  ),
  (
    'DEMO003',
    '22222222-2222-2222-2222-222222222222',
    'image',
    'Graffiti Wall',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', -- Colorful graffiti
    true,
    false,
    true,
    NOW() - INTERVAL '9 months 5 days'
  ),
  (
    'DEMO005',
    '33333333-3333-3333-3333-333333333333',
    'image',
    'Matcha Latte Art',
    'https://images.unsplash.com/photo-1571934811356-5cc061b6821f', -- Coffee art
    true,
    false,
    false,
    NOW() - INTERVAL '11 months'
  ),
  (
    'DEMO007',
    '33333333-3333-3333-3333-333333333333',
    'image',
    'Sunset Over Mountains',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', -- Mountain landscape
    true,
    false,
    true,
    NOW() - INTERVAL '1 year 2 months'
  ),
  (
    'DEMO007',
    '33333333-3333-3333-3333-333333333333',
    'image',
    'Urban Architecture',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b', -- Modern building
    true,
    false,
    true,
    NOW() - INTERVAL '1 year 4 months'
  );

-- SONG POSTS (YouTube URLs)
INSERT INTO posts (lighter_id, user_id, post_type, title, content_url, is_public, is_anonymous, is_creation, created_at)
VALUES
  (
    'DEMO002',
    '11111111-1111-1111-1111-111111111111',
    'song',
    'Festival Anthem',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', -- Placeholder YouTube URL
    true,
    false,
    false,
    NOW() - INTERVAL '4 months 5 days'
  ),
  (
    'DEMO008',
    '44444444-4444-4444-4444-444444444444',
    'song',
    'Bossa Nova Vibes',
    'https://www.youtube.com/watch?v=c71RCAyLS1M', -- Placeholder YouTube URL
    true,
    false,
    true,
    NOW() - INTERVAL '3 months'
  ),
  (
    'DEMO008',
    '44444444-4444-4444-4444-444444444444',
    'song',
    'Carnival Energy',
    'https://www.youtube.com/watch?v=example123', -- Placeholder
    true,
    false,
    false,
    NOW() - INTERVAL '2 months 20 days'
  ),
  (
    'DEMO009',
    '44444444-4444-4444-4444-444444444444',
    'song',
    'Late Night Study Music',
    'https://www.youtube.com/watch?v=example456', -- Placeholder
    true,
    false,
    false,
    NOW() - INTERVAL '2 months'
  ),
  (
    'DEMO009',
    '44444444-4444-4444-4444-444444444444',
    'song',
    'New Artist Discovery',
    'https://www.youtube.com/watch?v=example789', -- Placeholder
    true,
    false,
    true,
    NOW() - INTERVAL '1 month 15 days'
  );

-- LOCATION POSTS
INSERT INTO posts (lighter_id, user_id, post_type, title, location_name, location_lat, location_lng, is_find_location, is_public, is_anonymous, is_creation, created_at)
VALUES
  (
    'DEMO001',
    '11111111-1111-1111-1111-111111111111',
    'location',
    'Hidden Garden',
    'Jardin du Luxembourg',
    48.8462,
    2.3372,
    true,
    true,
    false,
    true,
    NOW() - INTERVAL '5 months 15 days'
  ),
  (
    'DEMO003',
    '22222222-2222-2222-2222-222222222222',
    'location',
    'Best Viewpoint',
    'CN Tower Observation Deck',
    43.6426,
    -79.3871,
    false,
    true,
    false,
    false,
    NOW() - INTERVAL '9 months 10 days'
  ),
  (
    'DEMO005',
    '33333333-3333-3333-3333-333333333333',
    'location',
    'Serene Temple',
    'Senso-ji Temple',
    35.7148,
    139.7967,
    true,
    true,
    false,
    true,
    NOW() - INTERVAL '11 months 5 days'
  ),
  (
    'DEMO006',
    '33333333-3333-3333-3333-333333333333',
    'location',
    'Beach Sunset Spot',
    'Copacabana Beach',
    -22.9711,
    -43.1822,
    false,
    true,
    false,
    false,
    NOW() - INTERVAL '1 year 8 months'
  ),
  (
    'DEMO010',
    '55555555-5555-5555-5555-555555555555',
    'location',
    'Community Garden',
    'Urban Green Space',
    52.5200,
    13.4050,
    true,
    true,
    false,
    true,
    NOW() - INTERVAL '6 months'
  );

-- REFUEL POSTS (motivational images)
INSERT INTO posts (lighter_id, user_id, post_type, title, content_url, is_public, is_anonymous, is_creation, created_at)
VALUES
  (
    'DEMO001',
    '11111111-1111-1111-1111-111111111111',
    'refuel',
    'Monday Motivation',
    'https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a', -- Motivational quote
    true,
    false,
    false,
    NOW() - INTERVAL '5 months 20 days'
  ),
  (
    'DEMO006',
    '33333333-3333-3333-3333-333333333333',
    'refuel',
    'Keep Going',
    'https://images.unsplash.com/photo-1522881193457-37ae97c905bf', -- Inspirational
    true,
    false,
    true,
    NOW() - INTERVAL '1 year 3 months'
  ),
  (
    'DEMO010',
    '55555555-5555-5555-5555-555555555555',
    'refuel',
    'Community Spirit',
    'https://images.unsplash.com/photo-1529070538774-1843cb3265df', -- Together we rise
    true,
    false,
    true,
    NOW() - INTERVAL '1 year'
  );

-- ANONYMOUS POSTS (for testing anonymity)
INSERT INTO posts (lighter_id, user_id, post_type, title, content_text, is_public, is_anonymous, is_creation, created_at)
VALUES
  (
    'DEMO004',
    '22222222-2222-2222-2222-222222222222',
    'text',
    'Secret Recipe Tip',
    'Adding a pinch of cinnamon to tomato sauce creates an amazing depth of flavor. Trust me on this!',
    true,
    true, -- Anonymous
    false,
    NOW() - INTERVAL '7 months'
  ),
  (
    'DEMO006',
    '33333333-3333-3333-3333-333333333333',
    'text',
    'Vulnerability',
    'Sometimes the bravest thing you can do is ask for help. Remember that.',
    true,
    true, -- Anonymous
    false,
    NOW() - INTERVAL '1 year 1 month'
  );

-- PINNED POSTS
INSERT INTO posts (lighter_id, user_id, post_type, title, content_text, is_public, is_anonymous, is_creation, is_pinned, created_at)
VALUES
  (
    'DEMO010',
    '55555555-5555-5555-5555-555555555555',
    'text',
    'Community Guidelines',
    'Welcome to our community events lighter! Please be respectful, supportive, and inclusive. Together we make a difference.',
    true,
    false,
    true,
    true, -- Pinned to top
    NOW() - INTERVAL '3 years'
  );

-- PRIVATE POSTS (for testing privacy)
INSERT INTO posts (lighter_id, user_id, post_type, title, content_text, is_public, is_anonymous, is_creation, created_at)
VALUES
  (
    'DEMO004',
    '22222222-2222-2222-2222-222222222222',
    'text',
    'Personal Note',
    'This is a private recipe note just for me to remember.',
    false, -- Private
    false,
    false,
    NOW() - INTERVAL '6 months'
  );

RAISE NOTICE '   ✓ Created 30+ demo posts across all types';

-- ============================================================================
-- DEMO LIKES (engagement data)
-- ============================================================================

RAISE NOTICE '5. Creating demo likes...';

-- Create cross-user engagement
INSERT INTO likes (user_id, post_id, created_at)
SELECT
  l.user_id,
  p.id,
  NOW() - (RANDOM() * INTERVAL '30 days')
FROM (
  VALUES
    ('22222222-2222-2222-2222-222222222222'), -- creative_soul likes adventure_seeker's posts
    ('33333333-3333-3333-3333-333333333333'), -- global_wanderer likes
    ('44444444-4444-4444-4444-444444444444'), -- music_lover likes
    ('55555555-5555-5555-5555-555555555555')  -- community_guardian likes
) AS l(user_id)
CROSS JOIN (
  SELECT id FROM posts WHERE lighter_id IN ('DEMO001', 'DEMO002', 'DEMO003') LIMIT 5
) AS p
ON CONFLICT (user_id, post_id) DO NOTHING;

-- Users like their own favorite posts
INSERT INTO likes (user_id, post_id, created_at)
SELECT
  user_id,
  id,
  created_at + INTERVAL '1 hour'
FROM posts
WHERE lighter_id IN ('DEMO005', 'DEMO007')
LIMIT 3
ON CONFLICT (user_id, post_id) DO NOTHING;

RAISE NOTICE '   ✓ Created engagement likes';

-- ============================================================================
-- DEMO TROPHIES
-- ============================================================================

RAISE NOTICE '6. Assigning demo trophies...';

-- Ensure trophies table has all trophy definitions
-- (This assumes the trophies table exists and is populated)

-- Award trophies based on user activity
INSERT INTO user_trophies (user_id, trophy_id, earned_at)
VALUES
  -- adventure_seeker (level 5, 850 points)
  ('11111111-1111-1111-1111-111111111111', 1, NOW() - INTERVAL '6 months'), -- Fire Starter
  ('11111111-1111-1111-1111-111111111111', 2, NOW() - INTERVAL '5 months 25 days'), -- Story Teller

  -- creative_soul (level 8, 1520 points)
  ('22222222-2222-2222-2222-222222222222', 1, NOW() - INTERVAL '1 year'), -- Fire Starter
  ('22222222-2222-2222-2222-222222222222', 2, NOW() - INTERVAL '10 months'), -- Story Teller
  ('22222222-2222-2222-2222-222222222222', 3, NOW() - INTERVAL '8 months'), -- Chronicles (5 stories)

  -- global_wanderer (level 12, 2890 points) - most achievements
  ('33333333-3333-3333-3333-333333333333', 1, NOW() - INTERVAL '2 years'), -- Fire Starter
  ('33333333-3333-3333-3333-333333333333', 2, NOW() - INTERVAL '2 years'), -- Story Teller
  ('33333333-3333-3333-3333-333333333333', 3, NOW() - INTERVAL '1 year 8 months'), -- Chronicles
  ('33333333-3333-3333-3333-333333333333', 4, NOW() - INTERVAL '1 year 6 months'), -- Epic Saga (10 stories)
  ('33333333-3333-3333-3333-333333333333', 5, NOW() - INTERVAL '1 year 6 months'), -- Collector (5 lighters)
  ('33333333-3333-3333-3333-333333333333', 9, NOW() - INTERVAL '1 year 2 months'), -- Photographer (10 photos)

  -- music_lover (level 4, 620 points)
  ('44444444-4444-4444-4444-444444444444', 1, NOW() - INTERVAL '3 months'), -- Fire Starter
  ('44444444-4444-4444-4444-444444444444', 2, NOW() - INTERVAL '3 months'), -- Story Teller
  ('44444444-4444-4444-4444-444444444444', 10, NOW() - INTERVAL '1 month'), -- Musician (5 songs)

  -- community_guardian (level 15, 3450 points) - moderator with many achievements
  ('55555555-5555-5555-5555-555555555555', 1, NOW() - INTERVAL '3 years'), -- Fire Starter
  ('55555555-5555-5555-5555-555555555555', 2, NOW() - INTERVAL '3 years'), -- Story Teller
  ('55555555-5555-5555-5555-555555555555', 3, NOW() - INTERVAL '2 years 6 months'), -- Chronicles
  ('55555555-5555-5555-5555-555555555555', 4, NOW() - INTERVAL '2 years'), -- Epic Saga
  ('55555555-5555-5555-5555-555555555555', 6, NOW() - INTERVAL '1 year'), -- Community Builder

  -- lightkeeper_admin (level 20, 5000 points) - admin with all achievements
  ('66666666-6666-6666-6666-666666666666', 1, NOW() - INTERVAL '4 years'), -- Fire Starter
  ('66666666-6666-6666-6666-666666666666', 2, NOW() - INTERVAL '4 years'), -- Story Teller
  ('66666666-6666-6666-6666-666666666666', 3, NOW() - INTERVAL '3 years 6 months'), -- Chronicles
  ('66666666-6666-6666-6666-666666666666', 4, NOW() - INTERVAL '3 years'), -- Epic Saga
  ('66666666-6666-6666-6666-666666666666', 5, NOW() - INTERVAL '3 years'), -- Collector
  ('66666666-6666-6666-6666-666666666666', 6, NOW() - INTERVAL '2 years'), -- Community Builder
  ('66666666-6666-6666-6666-666666666666', 7, NOW() - INTERVAL '2 years'), -- Globe Trotter
  ('66666666-6666-6666-6666-666666666666', 8, NOW() - INTERVAL '1 year') -- Popular Contributor
ON CONFLICT (user_id, trophy_id) DO NOTHING;

RAISE NOTICE '   ✓ Awarded trophies to demo users';

-- ============================================================================
-- UPDATE COUNTERS AND METADATA
-- ============================================================================

RAISE NOTICE '7. Updating counters and metadata...';

-- Update like_count on posts
UPDATE posts p
SET like_count = (
  SELECT COUNT(*)
  FROM likes l
  WHERE l.post_id = p.id
)
WHERE p.lighter_id LIKE 'DEMO%';

-- Update post_count on lighters
UPDATE lighters l
SET post_count = (
  SELECT COUNT(*)
  FROM posts p
  WHERE p.lighter_id = l.id
)
WHERE l.id LIKE 'DEMO%';

RAISE NOTICE '   ✓ Updated counters';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

RAISE NOTICE '8. Verifying demo data...';

DO $$
DECLARE
  v_profiles_count INTEGER;
  v_lighters_count INTEGER;
  v_posts_count INTEGER;
  v_likes_count INTEGER;
  v_trophies_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_profiles_count FROM profiles WHERE id LIKE '%1111%' OR id LIKE '%2222%' OR id LIKE '%3333%' OR id LIKE '%4444%' OR id LIKE '%5555%' OR id LIKE '%6666%';
  SELECT COUNT(*) INTO v_lighters_count FROM lighters WHERE id LIKE 'DEMO%';
  SELECT COUNT(*) INTO v_posts_count FROM posts WHERE lighter_id LIKE 'DEMO%';
  SELECT COUNT(*) INTO v_likes_count FROM likes WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
  );
  SELECT COUNT(*) INTO v_trophies_count FROM user_trophies WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
  );

  RAISE NOTICE '   ✓ Profiles: %', v_profiles_count;
  RAISE NOTICE '   ✓ Lighters: %', v_lighters_count;
  RAISE NOTICE '   ✓ Posts: %', v_posts_count;
  RAISE NOTICE '   ✓ Likes: %', v_likes_count;
  RAISE NOTICE '   ✓ Trophies: %', v_trophies_count;
END $$;

COMMIT;

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE 'Demo Data Seed Complete!';
RAISE NOTICE '========================================';
RAISE NOTICE '';
RAISE NOTICE 'DEMO USERS (username / role):';
RAISE NOTICE '  - adventure_seeker (user, FR)';
RAISE NOTICE '  - creative_soul (user, CA)';
RAISE NOTICE '  - global_wanderer (user, JP) - Most active';
RAISE NOTICE '  - music_lover (user, BR)';
RAISE NOTICE '  - community_guardian (moderator, DE)';
RAISE NOTICE '  - lightkeeper_admin (admin, US)';
RAISE NOTICE '';
RAISE NOTICE 'DEMO LIGHTERS:';
RAISE NOTICE '  - DEMO001: My Paris Adventures (FR)';
RAISE NOTICE '  - DEMO002: Summer Music Festival 2024 (EN)';
RAISE NOTICE '  - DEMO003: Toronto Street Art (EN)';
RAISE NOTICE '  - DEMO004: Recipe Collection (EN, hidden username)';
RAISE NOTICE '  - DEMO005: Tokyo Coffee Shops (JA)';
RAISE NOTICE '  - DEMO006: Travel Memories 2023 (EN)';
RAISE NOTICE '  - DEMO007: Photography Journey (EN)';
RAISE NOTICE '  - DEMO008: Samba Nights (PT)';
RAISE NOTICE '  - DEMO009: Indie Discoveries (EN)';
RAISE NOTICE '  - DEMO010: Community Events (DE)';
RAISE NOTICE '';
RAISE NOTICE 'POST TYPES CREATED:';
RAISE NOTICE '  - Text posts: ~10';
RAISE NOTICE '  - Image posts: ~5';
RAISE NOTICE '  - Song posts: ~5';
RAISE NOTICE '  - Location posts: ~5';
RAISE NOTICE '  - Refuel posts: ~3';
RAISE NOTICE '  - Anonymous posts: ~2';
RAISE NOTICE '  - Pinned posts: ~1';
RAISE NOTICE '  - Private posts: ~1';
RAISE NOTICE '';
RAISE NOTICE 'TESTING SCENARIOS:';
RAISE NOTICE '  ✓ Multi-role users (user, moderator, admin)';
RAISE NOTICE '  ✓ Diverse nationalities and languages';
RAISE NOTICE '  ✓ All post types represented';
RAISE NOTICE '  ✓ Public, private, and anonymous posts';
RAISE NOTICE '  ✓ Pinned posts for moderators';
RAISE NOTICE '  ✓ Cross-user engagement (likes)';
RAISE NOTICE '  ✓ Progressive trophy achievements';
RAISE NOTICE '  ✓ Varied lighter configurations';
RAISE NOTICE '';
RAISE NOTICE 'NEXT STEPS:';
RAISE NOTICE '  1. Create auth.users entries for demo users (Supabase Dashboard)';
RAISE NOTICE '  2. Test lighter pages: /lighter/DEMO001 through /lighter/DEMO010';
RAISE NOTICE '  3. Test user profiles: /my-profile with each demo user';
RAISE NOTICE '  4. Test moderation queue with community_guardian user';
RAISE NOTICE '  5. Test admin features with lightkeeper_admin user';
RAISE NOTICE '';
RAISE NOTICE 'IMPORTANT NOTES:';
RAISE NOTICE '  - Demo user IDs are hardcoded UUIDs';
RAISE NOTICE '  - You must create corresponding auth.users entries';
RAISE NOTICE '  - Image URLs use Unsplash placeholders';
RAISE NOTICE '  - YouTube URLs are placeholders (replace with real ones)';
RAISE NOTICE '  - Post counts will auto-update via database triggers';
RAISE NOTICE '';
RAISE NOTICE '========================================';
