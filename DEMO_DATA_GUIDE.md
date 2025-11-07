# LightMyFire Demo Data Guide

**Created:** 2025-11-07
**Purpose:** Comprehensive demo environment for testing and demonstration
**SQL Script:** `demo_data_seeds.sql`

---

## Overview

This demo data seed creates a complete testing environment with:
- 6 diverse users (4 regular, 1 moderator, 1 admin)
- 10 lighters with varied configurations
- 30+ posts covering all content types
- Cross-user engagement (likes)
- Progressive trophy achievements
- Multiple nationalities and languages

**Use Cases:**
- Local development and testing
- Feature demonstrations
- QA/testing scenarios
- Screenshots and marketing materials
- Training and onboarding

---

## Quick Start

### 1. Run the Seed Script

**Option A: Supabase SQL Editor (Recommended)**
```sql
-- Open Supabase Dashboard → SQL Editor → New Query
-- Copy and paste contents of demo_data_seeds.sql
-- Click "Run"
```

**Option B: psql Command Line**
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f demo_data_seeds.sql
```

### 2. Create Auth Users

**CRITICAL:** The seed script creates profiles, but you must create corresponding auth users in Supabase Dashboard.

**Steps:**
1. Open Supabase Dashboard → Authentication → Users
2. Click "Add User" for each demo user
3. Use the UUIDs and usernames from the table below

### 3. Test the Demo Data

Visit these URLs to see the demo data in action:
- `/lighter/DEMO001` - Paris Adventures lighter
- `/lighter/DEMO010` - Community Events (with pinned post)
- `/my-profile` - Log in as any demo user to see their profile

---

## Demo Users Reference

### Regular Users

| Username | UUID | Role | Nationality | Level | Points | Description |
|----------|------|------|-------------|-------|--------|-------------|
| **adventure_seeker** | `11111111-1111-1111-1111-111111111111` | user | FR (France) | 5 | 850 | Travel enthusiast, music festivals |
| **creative_soul** | `22222222-2222-2222-2222-222222222222` | user | CA (Canada) | 8 | 1,520 | Street art lover, food blogger |
| **global_wanderer** | `33333333-3333-3333-3333-333333333333` | user | JP (Japan) | 12 | 2,890 | **Most active user** - photographer, world traveler |
| **music_lover** | `44444444-4444-4444-4444-444444444444` | user | BR (Brazil) | 4 | 620 | Samba and indie music enthusiast |

### Staff Users

| Username | UUID | Role | Nationality | Level | Points | Description |
|----------|------|------|-------------|-------|--------|-------------|
| **community_guardian** | `55555555-5555-5555-5555-555555555555` | **moderator** | DE (Germany) | 15 | 3,450 | Community moderator, event organizer |
| **lightkeeper_admin** | `66666666-6666-6666-6666-666666666666` | **admin** | US (United States) | 20 | 5,000 | Platform administrator |

---

## Demo Lighters Catalog

### DEMO001: My Paris Adventures
- **Owner:** adventure_seeker (FR)
- **PIN:** PAR123
- **Language:** French (fr)
- **Show Username:** Yes
- **Content:** Travel stories, locations, text posts
- **Best For:** Testing French localization, location posts

### DEMO002: Summer Music Festival 2024
- **Owner:** adventure_seeker (FR)
- **PIN:** FES789
- **Language:** English (en)
- **Show Username:** Yes
- **Content:** Music posts, images, festival memories
- **Best For:** Testing song posts, YouTube integration

### DEMO003: Toronto Street Art
- **Owner:** creative_soul (CA)
- **PIN:** ART456
- **Language:** English (en)
- **Show Username:** Yes
- **Content:** Image posts, location posts, urban art
- **Best For:** Testing image uploads, location features

### DEMO004: Recipe Collection
- **Owner:** creative_soul (CA)
- **PIN:** FOOD99
- **Language:** English (en)
- **Show Username:** **No** (Hidden)
- **Content:** Text posts, anonymous posts, private posts
- **Best For:** Testing privacy settings, anonymous posting

### DEMO005: Tokyo Coffee Shops
- **Owner:** global_wanderer (JP)
- **PIN:** CAFE88
- **Language:** Japanese (ja)
- **Show Username:** Yes
- **Content:** Images, locations, café discoveries
- **Best For:** Testing Japanese localization, multi-language

### DEMO006: Travel Memories 2023
- **Owner:** global_wanderer (JP)
- **PIN:** TRVL23
- **Language:** English (en)
- **Show Username:** Yes
- **Content:** All post types, anonymous posts, refuel posts
- **Best For:** Testing comprehensive feature set

### DEMO007: Photography Journey
- **Owner:** global_wanderer (JP)
- **PIN:** PHOTO1
- **Language:** English (en)
- **Show Username:** Yes
- **Content:** Image posts, landscape photos
- **Best For:** Testing image-heavy lighters, photo features

### DEMO008: Samba Nights
- **Owner:** music_lover (BR)
- **PIN:** SAMBA7
- **Language:** Portuguese (pt)
- **Show Username:** Yes
- **Content:** Song posts, Brazilian music
- **Best For:** Testing Portuguese localization, music features

### DEMO009: Indie Discoveries
- **Owner:** music_lover (BR)
- **PIN:** INDIE5
- **Language:** English (en)
- **Show Username:** Yes
- **Content:** Song posts, music discoveries
- **Best For:** Testing song features, YouTube API

### DEMO010: Community Events
- **Owner:** community_guardian (DE) - **Moderator**
- **PIN:** EVENT0
- **Language:** German (de)
- **Show Username:** Yes
- **Content:** Text posts, **pinned post** (guidelines), refuel posts
- **Best For:** Testing moderation features, pinned posts, German localization

---

## Testing Scenarios

### Authentication & Authorization

**Regular User Testing:**
```
1. Log in as: adventure_seeker (11111111-1111-1111-1111-111111111111)
2. Test: View own lighters, create posts, like posts, edit profile
3. Verify: Cannot access moderation queue or admin features
```

**Moderator Testing:**
```
1. Log in as: community_guardian (55555555-5555-5555-5555-555555555555)
2. Test: Access moderation queue, review flagged posts, approve/reject
3. Navigate to: /moderation
4. Verify: Can see moderation interface but not admin features
```

**Admin Testing:**
```
1. Log in as: lightkeeper_admin (66666666-6666-6666-6666-666666666666)
2. Test: Full platform access, user management, system settings
3. Navigate to: /admin
4. Verify: Full administrative controls available
```

### Post Type Testing

**Text Posts:**
- Lighter: DEMO001 (Paris Adventures)
- Examples: "Climbing the Eiffel Tower", "Best Croissant Ever"
- Test: Character limits, moderation, public/private toggle

**Image Posts:**
- Lighter: DEMO003 (Toronto Street Art), DEMO007 (Photography Journey)
- Examples: Festival crowds, graffiti walls, landscapes
- Test: Image upload, URL input, moderation, optimization

**Song Posts:**
- Lighter: DEMO002 (Summer Music Festival), DEMO008 (Samba Nights)
- Examples: Festival anthems, Bossa Nova, indie music
- Test: YouTube integration, search functionality, embed display

**Location Posts:**
- Lighter: DEMO001 (Paris Adventures), DEMO005 (Tokyo Coffee Shops)
- Examples: Jardin du Luxembourg, Senso-ji Temple, CN Tower
- Test: Map integration, coordinates, "Find this location" toggle

**Refuel Posts:**
- Lighter: DEMO001, DEMO006, DEMO010
- Examples: Monday motivation, keep going, community spirit
- Test: Motivational content, image display

### Privacy & Anonymity Testing

**Anonymous Posts:**
```
Lighter: DEMO004 (Recipe Collection), DEMO006 (Travel Memories)
Examples:
  - "Secret Recipe Tip" (anonymous text)
  - "Vulnerability" (anonymous emotional post)

Test:
  - Username should be hidden
  - User can still edit/delete their anonymous posts
  - Others cannot see who posted
```

**Private Posts:**
```
Lighter: DEMO004 (Recipe Collection)
Example: "Personal Note" (private text)

Test:
  - Only post owner can see
  - Not visible in public lighter view
  - Not visible to other users
```

**Hidden Username Lighter:**
```
Lighter: DEMO004 (show_username = false)

Test:
  - Lighter owner username not displayed on lighter page
  - Posts still show username unless also anonymous
```

### Engagement & Social Features

**Like Testing:**
```
Demo data includes cross-user likes:
  - creative_soul, global_wanderer, music_lover → like adventure_seeker's posts
  - Users like posts in DEMO001, DEMO002, DEMO003

Test:
  - Like/unlike functionality
  - Like counter updates
  - User can only like once per post
  - Like button state persists
```

**Trophy Testing:**
```
Users with different trophy progressions:

adventure_seeker (2 trophies):
  - Fire Starter
  - Story Teller

global_wanderer (6 trophies) - Most achievements:
  - Fire Starter, Story Teller, Chronicles, Epic Saga, Collector, Photographer

music_lover (3 trophies):
  - Fire Starter, Story Teller, Musician

Test:
  - Trophy display on profile page
  - Locked vs unlocked states
  - Trophy progress bar
  - Trophy icons and descriptions
```

### Internationalization (i18n) Testing

**Languages Covered:**
| Language | User | Lighter(s) |
|----------|------|-----------|
| **French (fr)** | adventure_seeker | DEMO001 |
| **English (en)** | All users | DEMO002, DEMO003, DEMO004, DEMO006, DEMO007, DEMO009 |
| **Japanese (ja)** | global_wanderer | DEMO005 |
| **Portuguese (pt)** | music_lover | DEMO008 |
| **German (de)** | community_guardian | DEMO010 |

**i18n Test Cases:**
```
1. Switch locale to FR → Visit DEMO001 → Verify French UI
2. Switch locale to JA → Visit DEMO005 → Verify Japanese UI
3. Switch locale to PT → Visit DEMO008 → Verify Portuguese UI
4. Switch locale to DE → Visit DEMO010 → Verify German UI
5. Test sticker generation with non-English languages
```

### Nationality Display Testing

**Shows Nationality:**
- adventure_seeker (FR 🇫🇷)
- creative_soul (CA 🇨🇦)
- global_wanderer (JP 🇯🇵)
- community_guardian (DE 🇩🇪)
- lightkeeper_admin (US 🇺🇸)

**Hides Nationality:**
- music_lover (BR - flag hidden)

**Test:**
- Verify flag emoji displays correctly
- Test show_nationality toggle in profile settings
- Check flag rendering on different devices

### Moderation Queue Testing

**Flagged Content Setup:**
```
Currently demo data doesn't include pre-flagged posts.
To test moderation:

1. Log in as regular user
2. Create post with inappropriate content
3. OpenAI moderation API will flag it
4. Log in as community_guardian (moderator)
5. Navigate to /moderation
6. Review and approve/reject flagged post
```

**Moderator Actions:**
- View all flagged posts
- See moderation reason and severity
- Approve post (makes it public)
- Reject post (keeps it hidden, notifies user)
- Send email notification to post author

### Pin Management Testing

**Pinned Post Example:**
```
Lighter: DEMO010 (Community Events)
Post: "Community Guidelines" (is_pinned = true)

Test:
  - Pinned post appears at top of lighter
  - Only moderators/admins can pin posts
  - Visual indicator for pinned posts
  - Unpinning functionality
```

### Performance & Scale Testing

**Data Volumes:**
```
- 6 users (realistic active user base)
- 10 lighters (typical user has 1-3 lighters)
- 30+ posts (varied engagement levels)
- 20+ likes (cross-user interactions)
- 20+ trophies (progressive achievements)

Good for:
  - Testing query performance
  - Testing pagination
  - Testing real-world load scenarios
```

---

## User Stories & Workflows

### New User Onboarding
```
User: adventure_seeker
Story: New user discovers platform, saves first lighter

1. Sign up as new user
2. Visit /save-lighter
3. Create "My Paris Adventures" lighter
4. Earn "Fire Starter" trophy
5. Add first post about Eiffel Tower
6. Earn "Story Teller" trophy
7. Get likes from other users
```

### Content Creator Journey
```
User: global_wanderer
Story: Active user with diverse content across multiple lighters

1. Has 3 lighters (coffee shops, travel memories, photography)
2. Posts regularly across different content types
3. Achieved 6 trophies (highest in demo)
4. Receives consistent engagement (likes)
5. Uses both public and anonymous posts
```

### Community Moderator Workflow
```
User: community_guardian
Story: Moderator managing community events lighter

1. Created community-focused lighter
2. Pinned community guidelines at top
3. Posts regular refuel/motivational content
4. Monitors moderation queue for flagged content
5. Approves/rejects posts based on guidelines
```

### Music Enthusiast Experience
```
User: music_lover
Story: User focused on music discovery and sharing

1. Created two music-themed lighters
2. Posts primarily song content (YouTube links)
3. Earned "Musician" trophy (5 songs)
4. Shares Samba and indie music
5. Hides nationality flag for privacy
```

---

## Data Relationships & Dependencies

### User → Lighters
```
adventure_seeker:
  → DEMO001 (My Paris Adventures)
  → DEMO002 (Summer Music Festival 2024)

creative_soul:
  → DEMO003 (Toronto Street Art)
  → DEMO004 (Recipe Collection)

global_wanderer:
  → DEMO005 (Tokyo Coffee Shops)
  → DEMO006 (Travel Memories 2023)
  → DEMO007 (Photography Journey)

music_lover:
  → DEMO008 (Samba Nights)
  → DEMO009 (Indie Discoveries)

community_guardian:
  → DEMO010 (Community Events)
```

### Lighters → Posts
```
Each lighter has 2-5 posts covering different types
Total: 30+ posts across 10 lighters

Post Type Distribution:
  - Text: ~40%
  - Image: ~25%
  - Song: ~20%
  - Location: ~10%
  - Refuel: ~5%
```

### Users → Trophies
```
Progressive achievement levels:

adventure_seeker: 2 trophies (beginner)
creative_soul: 3 trophies (active)
music_lover: 3 trophies (specialized)
global_wanderer: 6 trophies (power user)
community_guardian: 5 trophies (community leader)
lightkeeper_admin: 8 trophies (completionist)
```

---

## Cleanup & Reset

### Remove All Demo Data
```sql
-- Run this to completely remove demo data
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

DELETE FROM posts WHERE lighter_id LIKE 'DEMO%';
DELETE FROM lighters WHERE id LIKE 'DEMO%';
DELETE FROM profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);
```

### Re-run Seed Script
```sql
-- After cleanup, simply re-run demo_data_seeds.sql
-- Script includes cleanup at the beginning, so safe to run multiple times
```

---

## Known Limitations & Notes

### Auth Users Not Created
**Issue:** SQL script only creates profiles, not auth.users entries
**Solution:** Manually create auth users in Supabase Dashboard with matching UUIDs

**Steps:**
1. Dashboard → Authentication → Users → Add User
2. Use email: `adventure_seeker@example.com`
3. Use UUID: `11111111-1111-1111-1111-111111111111`
4. Repeat for all 6 demo users

### Placeholder URLs
**Issue:** Image and YouTube URLs are placeholders
**Solution:** Replace with real URLs for better demo experience

**Images (Unsplash):**
- Already configured with real Unsplash URLs
- Images should load correctly

**YouTube:**
- URLs are placeholders (`example123`, etc.)
- Replace with real YouTube video IDs for working embeds

### RPC Functions Required
**Issue:** Script assumes RPC functions exist (`create_new_post`, `create_new_lighter`)
**Solution:** Ensure database migrations are applied before running seed script

**Check:**
```sql
-- Verify RPC functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('create_new_post', 'create_new_lighter');
```

### Timestamps Are Relative
**Issue:** Post timestamps use `NOW() - INTERVAL` for chronological order
**Solution:** Re-running script updates timestamps to current date

**Impact:**
- Posts will always appear recent
- Relative chronology is maintained
- Good for demonstrations

---

## Advanced Testing Scenarios

### Sticker Order Testing
```
User: adventure_seeker
Lighter: DEMO001 (My Paris Adventures)

Test Flow:
  1. Navigate to /lighter/DEMO001
  2. Click "Order Stickers"
  3. Select pack size (10, 20, 50)
  4. Preview sticker sheet with French language
  5. Process test Stripe payment
  6. Verify order in sticker_orders table
  7. Check email notification (if RESEND_API_KEY configured)
```

### Search & Discovery
```
Test Cases:
  - Search for "Paris" → Should find DEMO001 posts
  - Search for "music" → Should find DEMO002, DEMO008, DEMO009
  - Search by location → Find DEMO001, DEMO003, DEMO005 location posts
  - Filter by post type → Image posts, song posts, etc.
```

### Real-time Updates
```
User A: adventure_seeker
User B: creative_soul

Test Flow:
  1. User A creates post in DEMO001
  2. User B visits /lighter/DEMO001
  3. Verify new post appears (may require refresh)
  4. User B likes the post
  5. User A sees like count increment
```

### Mobile Responsiveness
```
Test with demo data on mobile devices:
  - Lighter grid layout
  - Post cards stacking
  - Touch targets for likes
  - Image optimization
  - Navigation menu
```

---

## Troubleshooting

### "User not found" Error
**Cause:** auth.users entry doesn't exist for demo UUID
**Fix:** Create auth user in Supabase Dashboard with exact UUID from demo data

### "RPC function not found" Error
**Cause:** Database migrations not applied
**Fix:** Run all migrations in `supabase/migrations/` folder

### Posts Not Appearing
**Cause:** RLS policies preventing read access
**Fix:** Check RLS policies on `posts` table allow authenticated users to read

### Like Button Not Working
**Cause:** User not authenticated or RLS policy blocking
**Fix:** Ensure user is logged in and `likes` table has proper RLS policies

### Images Not Loading
**Cause:** Unsplash rate limit or CORS issue
**Fix:** Replace with local images or different CDN

---

## Production Considerations

**DO NOT use demo data in production:**
- Hardcoded UUIDs create security risks
- Placeholder content not suitable for public
- Demo users have weak/no passwords

**Safe Practices:**
- Only run demo seeds in development/staging
- Delete demo data before production deploy
- Use separate database for testing
- Never expose demo user credentials

---

## Extending Demo Data

### Add More Users
```sql
-- Template for new demo user
INSERT INTO profiles (id, username, nationality, show_nationality, level, points, role)
VALUES (
  'NEWUSER-UUID-HERE',
  'new_username',
  'XX', -- Country code
  true,
  1,
  0,
  'user'
);
```

### Add More Lighters
```sql
-- Template for new demo lighter
INSERT INTO lighters (id, name, pin_code, saver_id, sticker_language)
VALUES (
  'DEMO011',
  'New Lighter Name',
  'CODE11',
  'USER-UUID-HERE',
  'en'
);
```

### Add More Posts
```sql
-- Template for new demo post
INSERT INTO posts (lighter_id, user_id, post_type, title, content_text, is_public)
VALUES (
  'DEMO001',
  'USER-UUID-HERE',
  'text',
  'Post Title',
  'Post content here',
  true
);
```

---

## Summary

The demo data seed provides:
- ✅ Realistic user personas across different roles
- ✅ Comprehensive content coverage (all post types)
- ✅ Multi-language testing scenarios
- ✅ Progressive trophy achievements
- ✅ Cross-user engagement patterns
- ✅ Privacy and moderation testing
- ✅ Production-like data structure

**Perfect for:**
- Feature development and testing
- QA/testing workflows
- Product demonstrations
- Screenshot/marketing materials
- User training and onboarding

**Next Steps:**
1. Run `demo_data_seeds.sql` in Supabase SQL Editor
2. Create auth.users entries for demo UUIDs
3. Log in as demo users and explore!

---

**Created:** 2025-11-07
**Maintained by:** LightMyFire Development Team
**Version:** 1.0.0
