-- ============================================================================
-- COMPLETE SEED DATA FOR LIGHTMYFIRE - 200 POSTS ACROSS 15 LIGHTERS
-- ============================================================================
-- This script creates realistic test data with:
-- - 15 diverse lighters
-- - 200+ posts (text, image, song, location, refuel)
-- - Valid YouTube URLs, Unsplash images, real GPS coordinates
-- - Distributed across all existing users
-- ============================================================================

-- ============================================================================
-- SECTION 1: CLEAN UP EXISTING FAULTY DATA
-- ============================================================================

DELETE FROM public.posts;
DELETE FROM public.lighters;
DELETE FROM public.likes;
DELETE FROM public.user_trophies;

ALTER SEQUENCE posts_id_seq RESTART WITH 1;

-- ============================================================================
-- SECTION 2: UPDATE MISSING PROFILE DATA
-- ============================================================================

UPDATE public.profiles SET nationality = 'FR', show_nationality = true WHERE id = 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045';
UPDATE public.profiles SET nationality = 'ES', show_nationality = true WHERE id = '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab';
UPDATE public.profiles SET nationality = 'IT', show_nationality = false WHERE id = '7889ee93-c681-4aa6-a39e-5adc33358230';
UPDATE public.profiles SET nationality = 'CA', show_nationality = true WHERE id = '2ee448c2-9b75-4685-9bb5-4a36d98028a8';
UPDATE public.profiles SET nationality = 'AU', show_nationality = true WHERE id = '9fbb069a-375f-45dd-8a27-36e96023f048';
UPDATE public.profiles SET nationality = 'BR', show_nationality = false WHERE id = '235c3d71-2533-48f5-badf-0ecaac486e42';

-- ============================================================================
-- SECTION 3: CREATE 15 LIGHTERS WITH DIVERSE THEMES
-- ============================================================================

INSERT INTO public.lighters (id, pin_code, name, saver_id, custom_background_url, show_saver_username, is_retired, background_color, sticker_language, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '000001', 'World Wanderer', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828', true, false, '#4A90E2', 'en', NOW() - INTERVAL '60 days'),
('22222222-2222-2222-2222-222222222222', '000002', 'Melody Keeper', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d', true, false, '#E94B3C', 'en', NOW() - INTERVAL '55 days'),
('33333333-3333-3333-3333-333333333333', '000003', 'Culinary Chronicles', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', true, false, '#F5A623', 'es', NOW() - INTERVAL '50 days'),
('44444444-4444-4444-4444-444444444444', '000004', 'Urban Tales', 'f2404a5d-b187-4074-a3b6-57998039c972', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000', false, false, '#7B68EE', 'fr', NOW() - INTERVAL '45 days'),
('55555555-5555-5555-5555-555555555555', '000005', 'Forest Whispers', '7889ee93-c681-4aa6-a39e-5adc33358230', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', true, false, '#50C878', 'en', NOW() - INTERVAL '40 days'),
('66666666-6666-6666-6666-666666666666', '000006', 'Gallery Stories', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f', true, false, '#9B59B6', 'de', NOW() - INTERVAL '35 days'),
('77777777-7777-7777-7777-777777777777', '000007', 'Seaside Diary', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', true, false, '#20B2AA', 'en', NOW() - INTERVAL '30 days'),
('88888888-8888-8888-8888-888888888888', '000008', 'Café Chronicles', '9fbb069a-375f-45dd-8a27-36e96023f048', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', false, false, '#8B4513', 'en', NOW() - INTERVAL '25 days'),
('99999999-9999-9999-9999-999999999999', '000009', 'Peak Memories', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', true, false, '#708090', 'en', NOW() - INTERVAL '20 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '000010', 'Literary Journey', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66', true, false, '#8B0000', 'en', NOW() - INTERVAL '15 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '000011', 'Active Life', '235c3d71-2533-48f5-badf-0ecaac486e42', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, '#FF6347', 'en', NOW() - INTERVAL '12 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '000012', 'Friends Forever', '440c923c-8757-40d5-a007-168e4430dd82', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac', true, false, '#FFD700', 'fr', NOW() - INTERVAL '10 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '000013', 'Paws & Tales', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b', true, false, '#FFA07A', 'en', NOW() - INTERVAL '8 days'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '000014', 'Digital Diary', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'https://images.unsplash.com/photo-1518770660439-4636190af475', false, false, '#00CED1', 'en', NOW() - INTERVAL '5 days'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '000015', 'Family Tree', 'f2404a5d-b187-4074-a3b6-57998039c972', 'https://images.unsplash.com/photo-1511895426328-dc8714191300', true, false, '#DA70D6', 'fr', NOW() - INTERVAL '3 days');

-- ============================================================================
-- SECTION 4: CREATE 200+ DIVERSE POSTS
-- ============================================================================

-- ============================================================================
-- LIGHTER 1: World Wanderer (Travel - 15 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, location_name, location_lat, location_lng, is_find_location, is_creation, is_anonymous, is_public, is_pinned, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'text', 'Starting My Journey', 'Today marks the beginning of an incredible adventure around the world!', NULL, NULL, NULL, NULL, false, true, false, true, false, NOW() - INTERVAL '60 days'),
('11111111-1111-1111-1111-111111111111', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'location', 'Eiffel Tower Visit', 'What an iconic landmark!', NULL, 'Eiffel Tower, Paris, France', 48.8584, 2.2945, true, false, false, true, false, NOW() - INTERVAL '58 days'),
('11111111-1111-1111-1111-111111111111', 'f2404a5d-b187-4074-a3b6-57998039c972', 'image', 'Sunset in Paris', 'Beautiful golden hour', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', NULL, NULL, NULL, false, false, false, true, false, NOW() - INTERVAL '57 days'),
('11111111-1111-1111-1111-111111111111', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'song', 'Paris Vibes', 'Perfect song for this city', 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', NULL, NULL, NULL, false, false, false, true, false, NOW() - INTERVAL '56 days'),
('11111111-1111-1111-1111-111111111111', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'location', 'Big Ben, London', 'Classic British icon', NULL, 'Big Ben, London, UK', 51.5007, -0.1246, true, false, false, true, false, NOW() - INTERVAL '54 days'),
('11111111-1111-1111-1111-111111111111', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'text', 'London Tea Time', 'Nothing beats a proper English tea with scones!', NULL, NULL, NULL, NULL, false, false, false, true, false, NOW() - INTERVAL '53 days'),
('11111111-1111-1111-1111-111111111111', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'image', 'Tower Bridge at Night', 'Absolutely stunning illumination', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad', NULL, NULL, NULL, false, false, false, true, false, NOW() - INTERVAL '51 days'),
('11111111-1111-1111-1111-111111111111', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'location', 'Tokyo Tower', 'Arrived in Japan!', NULL, 'Tokyo Tower, Tokyo, Japan', 35.6586, 139.7454, true, false, false, true, false, NOW() - INTERVAL '48 days'),
('11111111-1111-1111-1111-111111111111', '9fbb069a-375f-45dd-8a27-36e96023f048', 'text', 'Tokyo Street Food', 'Tried the most amazing ramen in Shibuya. The broth was incredible!', NULL, NULL, NULL, NULL, false, false, false, true, false, NOW() - INTERVAL '47 days'),
('11111111-1111-1111-1111-111111111111', '440c923c-8757-40d5-a007-168e4430dd82', 'image', 'Cherry Blossoms', 'Spring in Tokyo is magical', 'https://images.unsplash.com/photo-1522383225653-ed111181a951', NULL, NULL, NULL, false, false, false, true, false, NOW() - INTERVAL '45 days'),
('11111111-1111-1111-1111-111111111111', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'location', 'Statue of Liberty, NYC', 'Hello America!', NULL, 'Statue of Liberty, New York, USA', 40.6892, -74.0445, true, false, false, true, false, NOW() - INTERVAL '42 days'),
('11111111-1111-1111-1111-111111111111', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'song', 'Empire State of Mind', 'NYC anthem!', 'https://www.youtube.com/watch?v=0UjsXo9l6I8', NULL, NULL, NULL, false, false, false, true, false, NOW() - INTERVAL '40 days'),
('11111111-1111-1111-1111-111111111111', 'f2404a5d-b187-4074-a3b6-57998039c972', 'image', 'Central Park Autumn', 'Fall colors are breathtaking', 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90', NULL, NULL, NULL, false, false, false, true, false, NOW() - INTERVAL '38 days'),
('11111111-1111-1111-1111-111111111111', '7889ee93-c681-4aa6-a39e-5adc33358230', 'text', 'NYC Pizza Quest', 'Found the best slice in Brooklyn! The cheese to sauce ratio was perfect.', NULL, NULL, NULL, NULL, false, false, false, true, false, NOW() - INTERVAL '35 days'),
('11111111-1111-1111-1111-111111111111', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'refuel', 'Trip Completed!', 'What an amazing journey around the world. Time to refuel and plan the next adventure!', NULL, NULL, NULL, NULL, false, false, false, true, false, NOW() - INTERVAL '30 days');

-- ============================================================================
-- LIGHTER 2: Melody Keeper (Music - 14 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, is_creation, is_anonymous, is_public, created_at) VALUES
('22222222-2222-2222-2222-222222222222', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'text', 'Music is Life', 'Starting a collection of songs that changed my life', NULL, true, false, true, NOW() - INTERVAL '55 days'),
('22222222-2222-2222-2222-222222222222', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'song', 'Bohemian Rhapsody', 'A timeless masterpiece', 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', false, false, true, NOW() - INTERVAL '53 days'),
('22222222-2222-2222-2222-222222222222', 'f2404a5d-b187-4074-a3b6-57998039c972', 'song', 'Imagine - John Lennon', 'Still gives me chills every time', 'https://www.youtube.com/watch?v=YkgkThdzX-8', false, false, true, NOW() - INTERVAL '51 days'),
('22222222-2222-2222-2222-222222222222', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'image', 'Vinyl Collection', 'My growing collection of classics', 'https://images.unsplash.com/photo-1513104890138-7c749659a591', false, false, true, NOW() - INTERVAL '49 days'),
('22222222-2222-2222-2222-222222222222', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'song', 'Blinding Lights', 'Can''t stop listening to this!', 'https://www.youtube.com/watch?v=4NRXx6U8ABQ', false, false, true, NOW() - INTERVAL '47 days'),
('22222222-2222-2222-2222-222222222222', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'text', 'Concert Memories', 'Best live performance I''ve ever seen was at the Royal Albert Hall', NULL, false, false, true, NOW() - INTERVAL '45 days'),
('22222222-2222-2222-2222-222222222222', '9fbb069a-375f-45dd-8a27-36e96023f048', 'song', 'Shape of You', 'Ed Sheeran magic', 'https://www.youtube.com/watch?v=JGwWNGJdvx8', false, false, true, NOW() - INTERVAL '42 days'),
('22222222-2222-2222-2222-222222222222', '440c923c-8757-40d5-a007-168e4430dd82', 'image', 'Guitar Setup', 'My humble home studio', 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0', false, false, true, NOW() - INTERVAL '40 days'),
('22222222-2222-2222-2222-222222222222', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'song', 'Someone Like You', 'Adele''s voice is pure emotion', 'https://www.youtube.com/watch?v=hLQl3WQQoQ0', false, false, true, NOW() - INTERVAL '37 days'),
('22222222-2222-2222-2222-222222222222', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'text', 'Jazz Night', 'Discovered an amazing jazz bar in Soho. The saxophone player was phenomenal!', NULL, false, false, true, NOW() - INTERVAL '34 days'),
('22222222-2222-2222-2222-222222222222', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'song', 'Hotel California', 'Eagles forever', 'https://www.youtube.com/watch?v=09839DpTctU', false, false, true, NOW() - INTERVAL '30 days'),
('22222222-2222-2222-2222-222222222222', '7889ee93-c681-4aa6-a39e-5adc33358230', 'image', 'Music Festival', 'Best weekend ever', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea', false, false, true, NOW() - INTERVAL '27 days'),
('22222222-2222-2222-2222-222222222222', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'song', 'Sweet Child O'' Mine', 'Classic rock at its finest', 'https://www.youtube.com/watch?v=1w7OgIMMRc4', false, false, true, NOW() - INTERVAL '24 days'),
('22222222-2222-2222-2222-222222222222', 'f2404a5d-b187-4074-a3b6-57998039c972', 'text', 'Piano Lessons', 'Finally learning to play the piano. It''s harder than it looks but so rewarding!', NULL, false, false, true, NOW() - INTERVAL '20 days');

-- ============================================================================
-- LIGHTER 3: Culinary Chronicles (Food - 14 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, location_name, location_lat, location_lng, is_find_location, is_creation, is_anonymous, is_public, created_at) VALUES
('33333333-3333-3333-3333-333333333333', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'text', 'Food Adventure Begins', 'Documenting my culinary journey around the world', NULL, NULL, NULL, NULL, false, true, false, true, NOW() - INTERVAL '50 days'),
('33333333-3333-3333-3333-333333333333', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'image', 'Homemade Pasta', 'First time making fresh pasta from scratch!', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '48 days'),
('33333333-3333-3333-3333-333333333333', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'location', 'La Boqueria Market', 'Amazing food market in Barcelona', NULL, 'La Boqueria, Barcelona, Spain', 41.3818, 2.1723, true, false, false, true, NOW() - INTERVAL '46 days'),
('33333333-3333-3333-3333-333333333333', 'f2404a5d-b187-4074-a3b6-57998039c972', 'image', 'Sushi Platter', 'Authentic Japanese sushi experience', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '44 days'),
('33333333-3333-3333-3333-333333333333', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'text', 'French Cuisine', 'Learned to make coq au vin today. The wine reduction is key!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '41 days'),
('33333333-3333-3333-3333-333333333333', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'image', 'Street Tacos', 'Best tacos in Mexico City', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '38 days'),
('33333333-3333-3333-3333-333333333333', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'location', 'Tsukiji Fish Market', 'Fresh seafood paradise', NULL, 'Tsukiji Outer Market, Tokyo, Japan', 35.6654, 139.7707, true, false, false, true, NOW() - INTERVAL '35 days'),
('33333333-3333-3333-3333-333333333333', '9fbb069a-375f-45dd-8a27-36e96023f048', 'image', 'Chocolate Cake', 'My birthday masterpiece', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '32 days'),
('33333333-3333-3333-3333-333333333333', '440c923c-8757-40d5-a007-168e4430dd82', 'text', 'Cooking Class', 'Took a Thai cooking class and made the most amazing pad thai!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '29 days'),
('33333333-3333-3333-3333-333333333333', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'image', 'Farmers Market Haul', 'Fresh organic produce for the week', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '26 days'),
('33333333-3333-3333-3333-333333333333', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'location', 'Borough Market London', 'Food lover''s paradise', NULL, 'Borough Market, London, UK', 51.5055, -0.0909, true, false, false, true, NOW() - INTERVAL '23 days'),
('33333333-3333-3333-3333-333333333333', '7889ee93-c681-4aa6-a39e-5adc33358230', 'image', 'Sourdough Bread', 'After 3 failed attempts, finally nailed it!', 'https://images.unsplash.com/photo-1509440159596-0249088772ff', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '19 days'),
('33333333-3333-3333-3333-333333333333', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'text', 'Perfect Pizza', 'Discovered the secret to crispy crust: high heat and a pizza stone. Game changer!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '15 days'),
('33333333-3333-3333-3333-333333333333', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'refuel', 'Cooking Journey', 'So many recipes learned! Ready to cook for the next celebration.', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '12 days');

-- ============================================================================
-- LIGHTER 4: Urban Tales (City Life - 14 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, location_name, location_lat, location_lng, is_find_location, is_creation, is_anonymous, is_public, created_at) VALUES
('44444444-4444-4444-4444-444444444444', 'f2404a5d-b187-4074-a3b6-57998039c972', 'text', 'City Life Chronicles', 'Exploring the soul of different cities', NULL, NULL, NULL, NULL, false, true, false, true, NOW() - INTERVAL '45 days'),
('44444444-4444-4444-4444-444444444444', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'location', 'Times Square', 'The city that never sleeps', NULL, 'Times Square, New York, USA', 40.7580, -73.9855, true, false, false, true, NOW() - INTERVAL '43 days'),
('44444444-4444-4444-4444-444444444444', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'image', 'Graffiti Art', 'Amazing street art in Brooklyn', 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '41 days'),
('44444444-4444-4444-4444-444444444444', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'text', 'Subway Stories', 'Met the most interesting people on the metro today. A street musician playing violin made my commute beautiful.', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '39 days'),
('44444444-4444-4444-4444-444444444444', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'location', 'Brandenburg Gate', 'Historic Berlin', NULL, 'Brandenburg Gate, Berlin, Germany', 52.5163, 13.3777, true, false, false, true, NOW() - INTERVAL '36 days'),
('44444444-4444-4444-4444-444444444444', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'image', 'Skyscraper Sunset', 'Golden hour in the concrete jungle', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '33 days'),
('44444444-4444-4444-4444-444444444444', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'location', 'Shibuya Crossing', 'World''s busiest intersection', NULL, 'Shibuya Crossing, Tokyo, Japan', 35.6595, 139.7004, true, false, false, true, NOW() - INTERVAL '30 days'),
('44444444-4444-4444-4444-444444444444', '9fbb069a-375f-45dd-8a27-36e96023f048', 'text', 'Urban Gardens', 'Found a hidden rooftop garden in the middle of downtown. Nature finds a way!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '27 days'),
('44444444-4444-4444-4444-444444444444', '440c923c-8757-40d5-a007-168e4430dd82', 'image', 'City Night Lights', 'The city comes alive at night', 'https://images.unsplash.com/photo-1514565131-fce0801e5785', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '24 days'),
('44444444-4444-4444-4444-444444444444', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'location', 'La Sagrada Familia', 'Gaudí''s unfinished masterpiece', NULL, 'Sagrada Familia, Barcelona, Spain', 41.4036, 2.1744, true, false, false, true, NOW() - INTERVAL '21 days'),
('44444444-4444-4444-4444-444444444444', 'f2404a5d-b187-4074-a3b6-57998039c972', 'image', 'Metro Art', 'Underground art gallery', 'https://images.unsplash.com/photo-1495954484750-af469f2f9be5', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '18 days'),
('44444444-4444-4444-4444-444444444444', '7889ee93-c681-4aa6-a39e-5adc33358230', 'text', 'Coffee Shop Culture', 'Spent the afternoon in a cozy cafe watching the city go by. This is what life is about.', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '14 days'),
('44444444-4444-4444-4444-444444444444', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'song', 'City of Stars', 'Perfect soundtrack for city life', 'https://www.youtube.com/watch?v=GTWqwSNQCcg', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '10 days'),
('44444444-4444-4444-4444-444444444444', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'image', 'Street Market', 'Local vendors and fresh produce', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '6 days');

-- ============================================================================
-- LIGHTER 5: Forest Whispers (Nature - 14 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, location_name, location_lat, location_lng, is_find_location, is_creation, is_anonymous, is_public, created_at) VALUES
('55555555-5555-5555-5555-555555555555', '7889ee93-c681-4aa6-a39e-5adc33358230', 'text', 'Back to Nature', 'Escaping the city to reconnect with the wilderness', NULL, NULL, NULL, NULL, false, true, false, true, NOW() - INTERVAL '40 days'),
('55555555-5555-5555-5555-555555555555', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'image', 'Morning Fog', 'Misty forest morning', 'https://images.unsplash.com/photo-1448375240586-882707db888b', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '38 days'),
('55555555-5555-5555-5555-555555555555', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'location', 'Yosemite National Park', 'Nature''s cathedral', NULL, 'Yosemite Valley, California, USA', 37.7456, -119.5937, true, false, false, true, NOW() - INTERVAL '36 days'),
('55555555-5555-5555-5555-555555555555', 'f2404a5d-b187-4074-a3b6-57998039c972', 'image', 'Waterfall Discovery', 'Hidden gem in the forest', 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '33 days'),
('55555555-5555-5555-5555-555555555555', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'text', 'Wildlife Encounter', 'Saw a family of deer this morning. They were so peaceful and majestic!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '30 days'),
('55555555-5555-5555-5555-555555555555', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'image', 'Mountain Lake', 'Crystal clear water reflecting the peaks', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '27 days'),
('55555555-5555-5555-5555-555555555555', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'location', 'Banff National Park', 'Canadian Rockies beauty', NULL, 'Banff, Alberta, Canada', 51.1784, -115.5708, true, false, false, true, NOW() - INTERVAL '24 days'),
('55555555-5555-5555-5555-555555555555', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'text', 'Camping Under Stars', 'No light pollution, just millions of stars. Saw the Milky Way for the first time!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '21 days'),
('55555555-5555-5555-5555-555555555555', '9fbb069a-375f-45dd-8a27-36e96023f048', 'image', 'Autumn Trail', 'Fall colors are incredible', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '18 days'),
('55555555-5555-5555-5555-555555555555', '440c923c-8757-40d5-a007-168e4430dd82', 'song', 'Sound of Silence', 'Perfect for forest meditation', 'https://www.youtube.com/watch?v=4fWyzwo1xg0', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '15 days'),
('55555555-5555-5555-5555-555555555555', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'image', 'Mountain Sunrise', 'Worth the early wake up', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '12 days'),
('55555555-5555-5555-5555-555555555555', '7889ee93-c681-4aa6-a39e-5adc33358230', 'text', 'Forest Bathing', 'Learned about shinrin-yoku. The Japanese really understand the healing power of nature.', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '8 days'),
('55555555-5555-5555-5555-555555555555', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'location', 'Redwood National Park', 'Ancient giants', NULL, 'Redwood National Park, California, USA', 41.2132, -124.0046, true, false, false, true, NOW() - INTERVAL '5 days'),
('55555555-5555-5555-5555-555555555555', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'refuel', 'Nature Retreat Complete', 'Feeling recharged and ready to return to civilization!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '2 days');

-- ============================================================================
-- LIGHTER 6: Gallery Stories (Art & Culture - 14 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, location_name, location_lat, location_lng, is_find_location, is_creation, is_anonymous, is_public, created_at) VALUES
('66666666-6666-6666-6666-666666666666', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'text', 'Art Journey', 'Documenting my visits to galleries and museums', NULL, NULL, NULL, NULL, false, true, false, true, NOW() - INTERVAL '35 days'),
('66666666-6666-6666-6666-666666666666', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'location', 'The Louvre', 'Saw the Mona Lisa!', NULL, 'Louvre Museum, Paris, France', 48.8606, 2.3376, true, false, false, true, NOW() - INTERVAL '33 days'),
('66666666-6666-6666-6666-666666666666', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'image', 'Modern Art', 'Abstract masterpiece', 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '31 days'),
('66666666-6666-6666-6666-666666666666', 'f2404a5d-b187-4074-a3b6-57998039c972', 'text', 'Street Photography', 'Spent the day capturing candid moments in the city. Every person has a story!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '28 days'),
('66666666-6666-6666-6666-666666666666', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'location', 'MoMA New York', 'Contemporary art heaven', NULL, 'Museum of Modern Art, New York, USA', 40.7614, -73.9776, true, false, false, true, NOW() - INTERVAL '25 days'),
('66666666-6666-6666-6666-666666666666', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'image', 'Sculpture Garden', 'Beautiful outdoor art', 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '22 days'),
('66666666-6666-6666-6666-666666666666', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'text', 'Renaissance Day', 'The detail in these old master paintings is incredible. How did they do it without cameras?', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '19 days'),
('66666666-6666-6666-6666-666666666666', '9fbb069a-375f-45dd-8a27-36e96023f048', 'location', 'Vatican Museums', 'Sistine Chapel left me speechless', NULL, 'Vatican Museums, Vatican City', 41.9065, 12.4536, true, false, false, true, NOW() - INTERVAL '16 days'),
('66666666-6666-6666-6666-666666666666', '440c923c-8757-40d5-a007-168e4430dd82', 'image', 'Impressionist Beauty', 'Monet''s Water Lilies', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '13 days'),
('66666666-6666-6666-6666-666666666666', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'song', 'Clair de Lune', 'Classical music for art appreciation', 'https://www.youtube.com/watch?v=CvFH_6DNRCY', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '10 days'),
('66666666-6666-6666-6666-666666666666', '7889ee93-c681-4aa6-a39e-5adc33358230', 'text', 'Local Artist Market', 'Bought a beautiful painting from a street artist. Supporting local talent is important!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '7 days'),
('66666666-6666-6666-6666-666666666666', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'image', 'Art Deco Architecture', 'The building is art itself', 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '4 days'),
('66666666-6666-6666-6666-666666666666', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'location', 'Tate Modern', 'London''s contemporary art gem', NULL, 'Tate Modern, London, UK', 51.5076, -0.0994, true, false, false, true, NOW() - INTERVAL '2 days'),
('66666666-6666-6666-6666-666666666666', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'refuel', 'Cultural Immersion', 'So inspired by all the art I''ve seen. Time to create some of my own!', NULL, NULL, NULL, NULL, false, false, false, true, NOW());

-- ============================================================================
-- LIGHTER 7: Seaside Diary (Beach - 14 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, location_name, location_lat, location_lng, is_find_location, is_creation, is_anonymous, is_public, created_at) VALUES
('77777777-7777-7777-7777-777777777777', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'text', 'Beach Life', 'Living by the ocean for a month', NULL, NULL, NULL, NULL, false, true, false, true, NOW() - INTERVAL '30 days'),
('77777777-7777-7777-7777-777777777777', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'image', 'Sunrise Surf', 'Early morning waves', 'https://images.unsplash.com/photo-1502933691298-84fc14542831', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '28 days'),
('77777777-7777-7777-7777-777777777777', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'location', 'Bondi Beach', 'Iconic Australian beach', NULL, 'Bondi Beach, Sydney, Australia', -33.8908, 151.2743, true, false, false, true, NOW() - INTERVAL '26 days'),
('77777777-7777-7777-7777-777777777777', 'f2404a5d-b187-4074-a3b6-57998039c972', 'text', 'Beach Volleyball', 'Joined a local beach volleyball game. Lost terribly but had so much fun!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '24 days'),
('77777777-7777-7777-7777-777777777777', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'image', 'Tropical Paradise', 'Crystal clear water', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '21 days'),
('77777777-7777-7777-7777-777777777777', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'song', 'Three Little Birds', 'Perfect beach vibes', 'https://www.youtube.com/watch?v=zaGUr6wzyT8', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '18 days'),
('77777777-7777-7777-7777-777777777777', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'location', 'Waikiki Beach', 'Hawaiian paradise', NULL, 'Waikiki Beach, Honolulu, USA', 21.2793, -157.8292, true, false, false, true, NOW() - INTERVAL '15 days'),
('77777777-7777-7777-7777-777777777777', '9fbb069a-375f-45dd-8a27-36e96023f048', 'image', 'Sunset Colors', 'Nature''s painting', 'https://images.unsplash.com/photo-1495954484750-af469f2f9be5', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '12 days'),
('77777777-7777-7777-7777-777777777777', '440c923c-8757-40d5-a007-168e4430dd82', 'text', 'Seashell Collection', 'Found the most beautiful shells today. Each one unique and perfect.', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '9 days'),
('77777777-7777-7777-7777-777777777777', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'location', 'Copacabana Beach', 'Rio de Janeiro vibes', NULL, 'Copacabana Beach, Rio de Janeiro, Brazil', -22.9719, -43.1847, true, false, false, true, NOW() - INTERVAL '6 days'),
('77777777-7777-7777-7777-777777777777', '7889ee93-c681-4aa6-a39e-5adc33358230', 'image', 'Beach Bonfire', 'Perfect evening with friends', 'https://images.unsplash.com/photo-1519046904884-53103b34b206', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '3 days'),
('77777777-7777-7777-7777-777777777777', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'song', 'Kokomo', 'Beach Boys classic', 'https://www.youtube.com/watch?v=9T3hfZSXbNE', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '1 day'),
('77777777-7777-7777-7777-777777777777', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'text', 'Ocean Therapy', 'There''s something healing about the sound of waves. Best month ever!', NULL, NULL, NULL, NULL, false, false, false, true, NOW()),
('77777777-7777-7777-7777-777777777777', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'refuel', 'Beach Season End', 'Time to say goodbye to the sea, but I''ll be back!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '1 hour');

-- ============================================================================
-- LIGHTER 8: Café Chronicles (Coffee Culture - 13 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, location_name, location_lat, location_lng, is_find_location, is_creation, is_anonymous, is_public, created_at) VALUES
('88888888-8888-8888-8888-888888888888', '9fbb069a-375f-45dd-8a27-36e96023f048', 'text', 'Coffee Passion', 'Exploring coffee culture around the world', NULL, NULL, NULL, NULL, false, true, false, true, NOW() - INTERVAL '25 days'),
('88888888-8888-8888-8888-888888888888', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'image', 'Latte Art', 'Barista skills on point', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '23 days'),
('88888888-8888-8888-8888-888888888888', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'text', 'Ethiopian Coffee Ceremony', 'Experienced a traditional coffee ceremony. The ritual is as important as the drink!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '21 days'),
('88888888-8888-8888-8888-888888888888', 'f2404a5d-b187-4074-a3b6-57998039c972', 'image', 'Coffee Beans', 'Fresh roasted perfection', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '19 days'),
('88888888-8888-8888-8888-888888888888', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'location', 'Starbucks Reserve Roastery', 'Coffee temple in Seattle', NULL, 'Starbucks Reserve, Seattle, USA', 47.6101, -122.3401, true, false, false, true, NOW() - INTERVAL '17 days'),
('88888888-8888-8888-8888-888888888888', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'text', 'Cold Brew Master', 'Finally perfected my cold brew recipe. 24-hour steep at room temperature is key!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '15 days'),
('88888888-8888-8888-8888-888888888888', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'image', 'Cozy Corner', 'My favorite coffee shop spot', 'https://images.unsplash.com/photo-1493857671505-72967e2e2760', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '13 days'),
('88888888-8888-8888-8888-888888888888', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'song', 'Coffee', 'Sylvan Esso - perfect cafe music', 'https://www.youtube.com/watch?v=Qr5AIKRPIHo', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '11 days'),
('88888888-8888-8888-8888-888888888888', '9fbb069a-375f-45dd-8a27-36e96023f048', 'location', 'Sant Eustachio Il Caffè', 'Best espresso in Rome', NULL, 'Sant Eustachio Il Caffè, Rome, Italy', 41.8986, 12.4768, true, false, false, true, NOW() - INTERVAL '9 days'),
('88888888-8888-8888-8888-888888888888', '440c923c-8757-40d5-a007-168e4430dd82', 'image', 'Pour Over', 'Manual brewing is an art', 'https://images.unsplash.com/photo-1511920170033-f8396924c348', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '7 days'),
('88888888-8888-8888-8888-888888888888', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'text', 'Japanese Coffee Culture', 'Visited a kissaten in Tokyo. The attention to detail in every cup is inspiring.', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '5 days'),
('88888888-8888-8888-8888-888888888888', '7889ee93-c681-4aa6-a39e-5adc33358230', 'image', 'Coffee Library', 'Different beans from around the world', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '3 days'),
('88888888-8888-8888-8888-888888888888', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'refuel', 'Caffeinated Adventures', 'So many amazing coffees discovered. Can''t wait for the next cup!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '1 day');

-- ============================================================================
-- LIGHTER 9: Peak Memories (Mountain Adventures - 13 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, location_name, location_lat, location_lng, is_find_location, is_creation, is_anonymous, is_public, created_at) VALUES
('99999999-9999-9999-9999-999999999999', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'text', 'Mountain Calling', 'The mountains are calling and I must go', NULL, NULL, NULL, NULL, false, true, false, true, NOW() - INTERVAL '20 days'),
('99999999-9999-9999-9999-999999999999', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'location', 'Mount Everest Base Camp', 'Made it to base camp!', NULL, 'Everest Base Camp, Nepal', 28.0026, 86.8528, true, false, false, true, NOW() - INTERVAL '18 days'),
('99999999-9999-9999-9999-999999999999', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'image', 'Summit Sunrise', 'Worth every step', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '16 days'),
('99999999-9999-9999-9999-999999999999', 'f2404a5d-b187-4074-a3b6-57998039c972', 'text', 'Alpine Challenge', 'Today''s hike was brutal but the views from the summit made every blister worth it!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '14 days'),
('99999999-9999-9999-9999-999999999999', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'image', 'Mountain Goats', 'Spotted these climbers', 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '12 days'),
('99999999-9999-9999-9999-999999999999', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'location', 'Matterhorn', 'The iconic peak', NULL, 'Matterhorn, Switzerland', 45.9763, 7.6586, true, false, false, true, NOW() - INTERVAL '10 days'),
('99999999-9999-9999-9999-999999999999', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'song', 'Ain''t No Mountain High Enough', 'Hiking anthem', 'https://www.youtube.com/watch?v=Xz-UvQYAmbg', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '8 days'),
('99999999-9999-9999-9999-999999999999', '9fbb069a-375f-45dd-8a27-36e96023f048', 'text', 'Trail Mix Recipe', 'Perfect energy snack: almonds, dried cranberries, dark chocolate chips, and a pinch of sea salt!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '6 days'),
('99999999-9999-9999-9999-999999999999', '440c923c-8757-40d5-a007-168e4430dd82', 'image', 'Valley Below', 'Looking down from 3000 meters', 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '4 days'),
('99999999-9999-9999-9999-999999999999', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'location', 'Mont Blanc', 'Highest peak in the Alps', NULL, 'Mont Blanc, France', 45.8326, 6.8652, true, false, false, true, NOW() - INTERVAL '2 days'),
('99999999-9999-9999-9999-999999999999', '7889ee93-c681-4aa6-a39e-5adc33358230', 'image', 'Mountain Hut', 'Cozy refuge at altitude', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '1 day'),
('99999999-9999-9999-9999-999999999999', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'text', 'Mountain Wisdom', 'The summit is optional, getting down is mandatory. Always respect the mountain.', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '12 hours'),
('99999999-9999-9999-9999-999999999999', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'refuel', 'Back to Valley', 'Incredible mountain journey complete. Time to rest and plan the next climb!', NULL, NULL, NULL, NULL, false, false, false, true, NOW() - INTERVAL '1 hour');

-- ============================================================================
-- LIGHTER 10: Literary Journey (Books - 13 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, is_creation, is_anonymous, is_public, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'text', 'Reading Adventures', 'Tracking my literary journey through different worlds', NULL, true, false, true, NOW() - INTERVAL '15 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'image', 'Library Heaven', 'My happy place', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66', false, false, true, NOW() - INTERVAL '14 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'text', '1984 Finished', 'Orwell''s dystopia feels more relevant than ever. Big Brother is watching!', NULL, false, false, true, NOW() - INTERVAL '13 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f2404a5d-b187-4074-a3b6-57998039c972', 'image', 'Book Stack', 'To be read pile growing', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d', false, false, true, NOW() - INTERVAL '12 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'text', 'Harry Potter Marathon', 'Re-reading the entire series. Still discovering new details on the third read!', NULL, false, false, true, NOW() - INTERVAL '10 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'image', 'Bookstore Browse', 'Independent bookshop treasure', 'https://images.unsplash.com/photo-1512820790803-83ca734da794', false, false, true, NOW() - INTERVAL '8 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'text', 'Book Club Discussion', 'Amazing debate about The Great Gatsby tonight. Everyone had different interpretations!', NULL, false, false, true, NOW() - INTERVAL '6 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'song', 'Paperback Writer', 'Beatles tribute to books', 'https://www.youtube.com/watch?v=yYvkICbTZIQ', false, false, true, NOW() - INTERVAL '5 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '9fbb069a-375f-45dd-8a27-36e96023f048', 'image', 'Reading Nook', 'Perfect reading corner', 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b', false, false, true, NOW() - INTERVAL '4 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '440c923c-8757-40d5-a007-168e4430dd82', 'text', 'Poetry Night', 'Discovered Rumi today. "The wound is where the light enters you." Powerful words.', NULL, false, false, true, NOW() - INTERVAL '3 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'image', 'Book & Coffee', 'Perfect Sunday', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353', false, false, true, NOW() - INTERVAL '2 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '7889ee93-c681-4aa6-a39e-5adc33358230', 'text', 'Library Card', 'Got my library card today! Free books forever!', NULL, false, false, true, NOW() - INTERVAL '1 day'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'refuel', 'Reading Challenge Complete', '50 books this year! Already planning next year''s reading list.', NULL, false, false, true, NOW());

-- ============================================================================
-- LIGHTER 11: Active Life (Fitness - 13 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, is_creation, is_anonymous, is_public, created_at) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '235c3d71-2533-48f5-badf-0ecaac486e42', 'text', 'Fitness Journey', 'Starting my transformation today!', NULL, true, false, true, NOW() - INTERVAL '12 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'image', 'Morning Run', 'Sunrise motivation', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true, NOW() - INTERVAL '11 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'text', 'Personal Best', 'Ran 5km in under 25 minutes! New record!', NULL, false, false, true, NOW() - INTERVAL '10 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'f2404a5d-b187-4074-a3b6-57998039c972', 'image', 'Gym Session', 'Leg day complete', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48', false, false, true, NOW() - INTERVAL '9 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'song', 'Eye of the Tiger', 'Ultimate workout song', 'https://www.youtube.com/watch?v=btPJPFnesV4', false, false, true, NOW() - INTERVAL '8 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'text', 'Yoga Discovery', 'First yoga class today. My flexibility is terrible but I feel amazing!', NULL, false, false, true, NOW() - INTERVAL '7 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'image', 'Healthy Meal Prep', 'Sunday prep for the week', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061', false, false, true, NOW() - INTERVAL '6 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'text', 'Marathon Training', 'Week 4 of marathon training. The long runs are getting easier!', NULL, false, false, true, NOW() - INTERVAL '5 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '9fbb069a-375f-45dd-8a27-36e96023f048', 'image', 'Workout Buddy', 'Better together', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', false, false, true, NOW() - INTERVAL '4 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '440c923c-8757-40d5-a007-168e4430dd82', 'text', 'Rest Day Important', 'Learning that rest is part of training. Your muscles grow during recovery!', NULL, false, false, true, NOW() - INTERVAL '3 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'image', 'Swimming Pool', 'Low-impact cardio day', 'https://images.unsplash.com/photo-1519315901367-f34ff9154487', false, false, true, NOW() - INTERVAL '2 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '7889ee93-c681-4aa6-a39e-5adc33358230', 'text', 'Progress Photo', 'Down 5kg! Slow and steady wins the race!', NULL, false, false, true, NOW() - INTERVAL '1 day'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '235c3d71-2533-48f5-badf-0ecaac486e42', 'refuel', 'Fitness Milestone', 'Completed my first 10k race! Time to set new goals!', NULL, false, false, true, NOW());

-- ============================================================================
-- LIGHTER 12: Friends Forever (Friendship - 13 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, is_creation, is_anonymous, is_public, created_at) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', '440c923c-8757-40d5-a007-168e4430dd82', 'text', 'Friendship Chronicles', 'Recording memories with the best people', NULL, true, false, true, NOW() - INTERVAL '10 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'image', 'Squad Goals', 'The crew together', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac', false, false, true, NOW() - INTERVAL '9 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'text', 'Game Night', 'Monopoly almost ended our friendship but we survived! Sarah still owes me rent.', NULL, false, false, true, NOW() - INTERVAL '8 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'f2404a5d-b187-4074-a3b6-57998039c972', 'song', 'Lean on Me', 'Friendship anthem', 'https://www.youtube.com/watch?v=fOZ-MySzAac', false, false, true, NOW() - INTERVAL '7 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'image', 'Road Trip', 'Adventure with the best people', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800', false, false, true, NOW() - INTERVAL '6 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'text', 'Birthday Surprise', 'They threw me a surprise party! I actually cried. Best friends ever!', NULL, false, false, true, NOW() - INTERVAL '5 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'image', 'Brunch Crew', 'Sunday tradition', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', false, false, true, NOW() - INTERVAL '4 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'text', 'Old Friends', 'Reunited with college friends after 5 years. Picked up right where we left off!', NULL, false, false, true, NOW() - INTERVAL '3 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '9fbb069a-375f-45dd-8a27-36e96023f048', 'image', 'Group Selfie', 'Memories captured', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18', false, false, true, NOW() - INTERVAL '2 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'song', 'Count on Me', 'Bruno Mars friendship song', 'https://www.youtube.com/watch?v=TU6u6TRs2eI', false, false, true, NOW() - INTERVAL '1 day'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '7889ee93-c681-4aa6-a39e-5adc33358230', 'text', 'Support System', 'Going through tough times and my friends showed up. Grateful doesn''t even cover it.', NULL, false, false, true, NOW() - INTERVAL '12 hours'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '440c923c-8757-40d5-a007-168e4430dd82', 'image', 'Karaoke Night', 'We can''t sing but we don''t care!', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', false, false, true, NOW() - INTERVAL '6 hours'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'refuel', 'Friendship Goals', 'Lucky to have these amazing people in my life. Here''s to many more adventures!', NULL, false, false, true, NOW() - INTERVAL '1 hour');

-- ============================================================================
-- LIGHTER 13: Paws & Tales (Pets - 13 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, is_creation, is_anonymous, is_public, created_at) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'text', 'Pet Adventures', 'Life with my furry best friend', NULL, true, false, true, NOW() - INTERVAL '8 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'image', 'Meet Max', 'My golden retriever', 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24', false, false, true, NOW() - INTERVAL '7 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'f2404a5d-b187-4074-a3b6-57998039c972', 'text', 'First Trick', 'Max learned to shake hands today! Took 100 treats but worth it!', NULL, false, false, true, NOW() - INTERVAL '6 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'image', 'Park Time', 'Happiest dog alive', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b', false, false, true, NOW() - INTERVAL '5 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'song', 'Who Let the Dogs Out', 'Max''s favorite song apparently', 'https://www.youtube.com/watch?v=Qkuu0Lwb5EM', false, false, true, NOW() - INTERVAL '4 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'text', 'Vet Visit', 'Annual checkup done. Max got a clean bill of health and lots of treats!', NULL, false, false, true, NOW() - INTERVAL '3 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'image', 'Nap Time', 'Sleeping beauty', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e', false, false, true, NOW() - INTERVAL '2 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '9fbb069a-375f-45dd-8a27-36e96023f048', 'text', 'Beach Day', 'Max saw the ocean for the first time. He loved it! Splashed for hours!', NULL, false, false, true, NOW() - INTERVAL '1 day'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '440c923c-8757-40d5-a007-168e4430dd82', 'image', 'New Toy', 'Lasted exactly 10 minutes', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb', false, false, true, NOW() - INTERVAL '18 hours'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'text', 'Dog Park Friends', 'Max made a new friend today! They played fetch together for an hour!', NULL, false, false, true, NOW() - INTERVAL '12 hours'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '7889ee93-c681-4aa6-a39e-5adc33358230', 'image', 'Puppy Eyes', 'How I say no to this?', 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6', false, false, true, NOW() - INTERVAL '6 hours'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'text', 'Training Success', 'Max can now sit, stay, and come on command. We''re ready for advanced training!', NULL, false, false, true, NOW() - INTERVAL '2 hours'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'refuel', 'Best Friend', 'Max has brought so much joy to my life. Can''t imagine life without him!', NULL, false, false, true, NOW() - INTERVAL '30 minutes');

-- ============================================================================
-- LIGHTER 14: Digital Diary (Tech - 13 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, is_creation, is_anonymous, is_public, created_at) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'text', 'Tech Journey', 'Documenting my adventures in technology', NULL, true, false, true, NOW() - INTERVAL '5 days'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'image', 'New Setup', 'My coding battlestation', 'https://images.unsplash.com/photo-1518770660439-4636190af475', false, false, true, NOW() - INTERVAL '4 days'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'f2404a5d-b187-4074-a3b6-57998039c972', 'text', 'First App Launch', 'Published my first mobile app today! Only 3 downloads but I''m so proud!', NULL, false, false, true, NOW() - INTERVAL '3 days'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'image', 'Code Review', 'Clean code is happy code', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6', false, false, true, NOW() - INTERVAL '2 days'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'text', 'Bug Fixed', 'Spent 6 hours on a bug. It was a missing semicolon. I need coffee.', NULL, false, false, true, NOW() - INTERVAL '1 day'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'song', 'Binary Sunset', 'Coding soundtrack', 'https://www.youtube.com/watch?v=1gpXMGit4P8', false, false, true, NOW() - INTERVAL '20 hours'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'image', 'Hackathon Win', 'First place!', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d', false, false, true, NOW() - INTERVAL '16 hours'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '9fbb069a-375f-45dd-8a27-36e96023f048', 'text', 'Learning AI', 'Started learning machine learning. My brain hurts but it''s fascinating!', NULL, false, false, true, NOW() - INTERVAL '12 hours'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '440c923c-8757-40d5-a007-168e4430dd82', 'image', 'Mechanical Keyboard', 'The sound of productivity', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', false, false, true, NOW() - INTERVAL '8 hours'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'text', 'Open Source', 'Made my first open source contribution! The maintainer actually merged my PR!', NULL, false, false, true, NOW() - INTERVAL '4 hours'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '7889ee93-c681-4aa6-a39e-5adc33358230', 'image', 'Conference Badge', 'Tech conference day', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', false, false, true, NOW() - INTERVAL '2 hours'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'text', 'Stack Overflow', 'Reached 1000 reputation on Stack Overflow! Helping others feels good!', NULL, false, false, true, NOW() - INTERVAL '1 hour'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'refuel', 'Developer Life', 'Another day, another commit. Love what I do!', NULL, false, false, true, NOW() - INTERVAL '15 minutes');

-- ============================================================================
-- LIGHTER 15: Family Tree (Family - 13 posts)
-- ============================================================================
INSERT INTO public.posts (lighter_id, user_id, post_type, title, content_text, content_url, is_creation, is_anonymous, is_public, created_at) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'f2404a5d-b187-4074-a3b6-57998039c972', 'text', 'Family Memories', 'Cherishing moments with loved ones', NULL, true, false, true, NOW() - INTERVAL '3 days'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'image', 'Family Reunion', 'Three generations together', 'https://images.unsplash.com/photo-1511895426328-dc8714191300', false, false, true, NOW() - INTERVAL '2 days'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '6eb76281-50c2-40b0-b71f-07abb43bbf15', 'text', 'Grandma''s Recipe', 'Finally learned her secret sauce recipe! Can''t wait to pass it down!', NULL, false, false, true, NOW() - INTERVAL '1 day'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '4ba9f8cf-20ab-45cd-b4c7-e6627fd45cab', 'image', 'Sunday Dinner', 'Nothing beats mom''s cooking', 'https://images.unsplash.com/photo-1576867757603-05b134ebc379', false, false, true, NOW() - INTERVAL '20 hours'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '8d959816-c0bd-4b97-9c16-4d804ccf4f78', 'song', 'We Are Family', 'Our family anthem', 'https://www.youtube.com/watch?v=uyGY2NfYpeE', false, false, true, NOW() - INTERVAL '16 hours'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '2ee448c2-9b75-4685-9bb5-4a36d98028a8', 'text', 'Kids Growing Up', 'Can''t believe my little one starts school tomorrow. Time flies too fast!', NULL, false, false, true, NOW() - INTERVAL '12 hours'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'c00ded93-6d62-49eb-9947-5909f7ce2b2d', 'image', 'Game Night', 'Family tradition', 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4', false, false, true, NOW() - INTERVAL '8 hours'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '9fbb069a-375f-45dd-8a27-36e96023f048', 'text', 'Dad Jokes', 'My dad''s jokes are terrible but we love him anyway. Today''s gem: "I''m afraid for the calendar. Its days are numbered!"', NULL, false, false, true, NOW() - INTERVAL '6 hours'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '440c923c-8757-40d5-a007-168e4430dd82', 'image', 'Birthday Celebration', 'Happy 70th Grandpa!', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d', false, false, true, NOW() - INTERVAL '4 hours'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '2de90ac3-9ec0-41fc-bd47-272582844d64', 'text', 'Family History', 'Started researching our family tree. Found ancestors from 6 different countries!', NULL, false, false, true, NOW() - INTERVAL '2 hours'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '7889ee93-c681-4aa6-a39e-5adc33358230', 'image', 'Home Sweet Home', 'Where the heart is', 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09', false, false, true, NOW() - INTERVAL '1 hour'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'f2404a5d-b187-4074-a3b6-57998039c972', 'text', 'Sibling Bond', 'My brother is annoying but he''s also my best friend. Love-hate relationship!', NULL, false, false, true, NOW() - INTERVAL '30 minutes'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'de8aad60-e0f2-4f8d-abf2-b8b4006fe045', 'refuel', 'Family First', 'At the end of the day, family is everything. Grateful for mine!', NULL, false, false, true, NOW() - INTERVAL '5 minutes');

-- ============================================================================
-- SECTION 5: VERIFICATION
-- ============================================================================

-- Show completion status
SELECT
  'Seed data creation completed!' as status,
  (SELECT COUNT(*) FROM public.lighters) as lighter_count,
  (SELECT COUNT(*) FROM public.posts) as post_count,
  (SELECT COUNT(*) FROM public.profiles) as profile_count,
  (SELECT COUNT(DISTINCT post_type) FROM public.posts) as post_types_used;

-- Show post distribution by type
SELECT
  post_type,
  COUNT(*) as count
FROM public.posts
GROUP BY post_type
ORDER BY count DESC;

-- Show posts per lighter
SELECT
  l.name,
  COUNT(p.id) as post_count
FROM public.lighters l
LEFT JOIN public.posts p ON l.id = p.lighter_id
GROUP BY l.id, l.name
ORDER BY post_count DESC;
