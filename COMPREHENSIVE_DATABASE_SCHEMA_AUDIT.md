# LightMyFire - Comprehensive Database Schema Audit Report

**Date:** November 3, 2025
**Project:** lightmyfire-web
**Database:** Supabase (PostgreSQL)
**Status:** Partially Migrated - Payment Orders and Advanced Moderation Schema PLANNED

---

## EXECUTIVE SUMMARY

The LightMyFire application has a **hybrid database structure**:

1. **EXISTING TABLES** - Core functionality (5 tables)
2. **IMPLEMENTED FUNCTIONS** - RPC endpoints for operations (13+ functions)
3. **PLANNED MIGRATIONS** - Moderation and payment systems (2 new tables, 5 new functions)
4. **MISSING COMPONENTS** - Payment order tracking, comprehensive moderation audit trail

---

## PART 1: EXISTING DATABASE SCHEMA

### 1.1 EXISTING TABLES (5 Total)

#### Table: `profiles`
**Purpose:** User accounts and social information
**Source:** Supabase auth integration

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | PRIMARY KEY | FK to auth.users(id) |
| `username` | TEXT | NO | - | Unique |
| `nationality` | TEXT | YES | NULL | ISO 3166-1 alpha-2 country code |
| `show_nationality` | BOOLEAN | YES | false | Display flag on profile |
| `created_at` | TIMESTAMP | YES | NOW() | - |
| `level` | INTEGER | YES | 1 | User level (future feature) |
| `points` | INTEGER | YES | 0 | Experience points (future) |
| `role` | TEXT | YES | 'user' | 'user', 'moderator', 'admin' |

**Triggers:**
- `on_auth_user_created` - Auto-creates profile when user signs up

**RLS Policies:**
- SELECT: Everyone can see all profiles
- INSERT: Users can only create own profile
- UPDATE: Users can only update own profile
- DELETE: Users can only delete own profile

---

#### Table: `posts`
**Purpose:** User contributions (stories, songs, images, locations)
**Type:** Core content table

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | BIGINT | NO | PRIMARY KEY | Auto-increment |
| `user_id` | UUID | NO | - | FK to profiles(id) ON DELETE CASCADE |
| `lighter_id` | UUID | NO | - | FK to lighters(id) |
| `post_type` | TEXT | NO | - | 'text', 'song', 'image', 'location', 'refuel' |
| `title` | TEXT | YES | NULL | Post headline |
| `content_text` | TEXT | YES | NULL | Text content |
| `content_url` | TEXT | YES | NULL | URL to image/video |
| `location_name` | TEXT | YES | NULL | Location description |
| `location_lat` | NUMERIC | YES | NULL | Latitude coordinate |
| `location_lng` | NUMERIC | YES | NULL | Longitude coordinate |
| `is_find_location` | BOOLEAN | YES | false | Mark as location discovery |
| `is_creation` | BOOLEAN | YES | false | Mark as original creation |
| `is_anonymous` | BOOLEAN | YES | false | Hide author identity |
| `is_public` | BOOLEAN | YES | true | Visible to others |
| `is_flagged` | BOOLEAN | YES | false | Moderation flag |
| `flagged_count` | INTEGER | YES | 0 | Number of flags received |
| `is_pinned` | BOOLEAN | YES | false | Admin feature pin |
| `created_at` | TIMESTAMP | YES | NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on id
- FK indexes on user_id, lighter_id

**RLS Policies:**
- SELECT: Everyone can see all public, non-flagged posts
- INSERT: Authenticated users can create posts
- UPDATE: Users can only update own posts
- DELETE: Users can only delete own posts

---

#### Table: `lighters`
**Purpose:** User-saved lighter designs and PIN codes
**Type:** User asset table

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | PRIMARY KEY | gen_random_uuid() |
| `saver_id` | UUID | NO | - | FK to profiles(id) ON DELETE CASCADE |
| `name` | TEXT | NO | - | Lighter name/design |
| `pin_code` | TEXT | NO | - | Unique PIN to access lighter (ABC-123 format) |
| `custom_background_url` | TEXT | YES | NULL | Custom image URL |
| `show_saver_username` | BOOLEAN | YES | false | Display creator on stickers |
| `created_at` | TIMESTAMP | YES | NOW() | Creation timestamp |
| **PLANNED:** `background_color` | TEXT | - | '#FF6B6B' | Hex color for sticker |
| **PLANNED:** `sticker_language` | TEXT | - | 'en' | Language for sticker text |
| **PLANNED:** `sticker_design_version` | INTEGER | - | 1 | Design version number |
| **PLANNED:** `updated_at` | TIMESTAMP | - | NOW() | Last modification |

**Indexes:**
- PRIMARY KEY on id
- UNIQUE on pin_code
- FK index on saver_id

**RLS Policies:**
- SELECT: Everyone can see all lighters
- INSERT: Authenticated users can create lighters
- UPDATE: Only saver can update
- DELETE: Only saver can delete

---

#### Table: `likes`
**Purpose:** User engagement - post reactions
**Type:** Relationship table

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | PRIMARY KEY | gen_random_uuid() |
| `post_id` | BIGINT | NO | - | FK to posts(id) ON DELETE CASCADE |
| `user_id` | UUID | NO | - | FK to profiles(id) ON DELETE CASCADE |
| `created_at` | TIMESTAMP | YES | NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on id
- UNIQUE composite on (post_id, user_id)
- FK indexes on post_id, user_id

**RLS Policies:**
- SELECT: Everyone can see all likes
- INSERT: Authenticated users can like posts
- DELETE: Users can only unlike their own likes

---

#### Table: `user_trophies`
**Purpose:** Gamification - user achievement tracking
**Type:** Relationship table

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | PRIMARY KEY | gen_random_uuid() |
| `user_id` | UUID | NO | - | FK to profiles(id) ON DELETE CASCADE |
| `trophy_id` | INTEGER | NO | - | Reference to trophy definitions |
| `granted_at` | TIMESTAMP | YES | NOW() | When trophy was awarded |
| `created_at` | TIMESTAMP | YES | NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY on id
- UNIQUE composite on (user_id, trophy_id)
- FK index on user_id

**Trophy IDs (hardcoded):**
1. First Lighter Saved
2. First Contribution
3. First Creation
4. Lighter Explorer (5+ different lighters)
5. Refuel Master

---

#### Table: `detailed_posts` (VIEW)
**Purpose:** Pre-joined query for feed performance
**Type:** Materialized view

**Definition:**
```sql
SELECT
  p.id, p.user_id, p.lighter_id, p.title, p.post_type,
  p.content_text, p.content_url, p.location_name,
  p.location_lat, p.location_lng, p.created_at,
  p.is_flagged, p.flagged_count,
  u.username, u.nationality, u.show_nationality, u.role,
  l.name as lighter_name, l.custom_background_url,
  (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count
FROM posts p
LEFT JOIN profiles u ON u.id = p.user_id
LEFT JOIN lighters l ON l.id = p.lighter_id
WHERE p.is_flagged = FALSE
```

**Grants:** authenticated, anon (SELECT only)

---

### 1.2 EXISTING RPC FUNCTIONS (13 Functions)

#### Core Post Management Functions

**1. `create_new_post()` - 2 Overloads**

**Signature 1:**
```sql
create_new_post(
  p_lighter_id uuid,
  p_post_type text,
  p_title text,
  p_content_text text,
  p_content_url text,
  p_location_name text,
  p_location_lat numeric,
  p_location_lng numeric,
  p_is_find_location boolean,
  p_is_creation boolean,
  p_is_anonymous boolean,
  p_is_public boolean
) RETURNS json
```

**Signature 2:**
```sql
create_new_post(
  p_user_id uuid,
  p_lighter_id uuid,
  p_post_type text,
  p_title text,
  p_content_text text,
  p_content_url text,
  p_location_name text,
  p_location_lat numeric,
  p_location_lng numeric,
  p_is_find_location boolean,
  p_is_creation boolean,
  p_is_anonymous boolean,
  p_is_public boolean
) RETURNS json
```

**Returns:** `{success: boolean, post_id?: bigint, message: string}`
**Permissions:** authenticated
**Security:** SET search_path = public
**Notes:** Signature 1 uses auth.uid() for user_id

---

**2. `toggle_like()` - 2 Overloads**

**Signature 1:**
```sql
toggle_like(p_post_id uuid) RETURNS json
```

**Signature 2:**
```sql
toggle_like(post_to_like_id bigint) RETURNS void
```

**Behavior:** Insert like if not exists, DELETE if exists
**Returns (Sig 1):** `{action: 'liked'|'unliked', post_id: uuid, success: boolean}`
**Returns (Sig 2):** void
**Permissions:** authenticated
**Security:** SECURITY DEFINER, SET search_path = public

---

**3. `flag_post()`**

```sql
flag_post(post_to_flag_id bigint) RETURNS void
```

**Purpose:** Increment flagged_count, used for moderation flags
**Permissions:** authenticated
**Security:** SECURITY DEFINER, SET search_path = public

---

**4. `delete_post_by_moderator()`**

```sql
delete_post_by_moderator(post_id_to_delete bigint) RETURNS void
```

**Purpose:** Admin-only post deletion
**Permissions:** authenticated (admin check in code)
**Security:** SECURITY DEFINER, SET search_path = public

---

**5. `reinstate_post()`**

```sql
reinstate_post(post_id_to_reinstate bigint) RETURNS void
```

**Purpose:** Unflag a previously flagged post
**Permissions:** authenticated (admin check in code)
**Security:** SECURITY DEFINER, SET search_path = public

---

#### Lighter Management Functions

**6. `create_new_lighter()`**

```sql
create_new_lighter(
  lighter_name text,
  background_url text,
  show_username boolean
) RETURNS uuid
```

**Behavior:**
1. Generates random PIN code (ABC-123 format)
2. Loops until unique PIN found
3. Inserts new lighter with current user as saver_id
4. Returns new lighter UUID

**Returns:** UUID of created lighter
**Permissions:** authenticated
**Security:** SET search_path = public

---

**7. `get_lighter_id_from_pin()`**

```sql
get_lighter_id_from_pin(pin_to_check text) RETURNS uuid
```

**Purpose:** Convert PIN code to lighter UUID (for accessing lighter pages)
**Returns:** UUID or NULL
**Permissions:** authenticated, anon
**Security:** SET search_path = public

---

**8. `generate_random_pin()`**

```sql
generate_random_pin() RETURNS text
```

**Behavior:**
- Generates 3 random letters (A-Z)
- Adds dash (-)
- Generates 3 random numbers (0-9)
- Format: ABC-123

**Returns:** PIN string
**Permissions:** authenticated, anon
**Security:** SET search_path = public

---

#### User Stats & Gamification Functions

**9. `get_my_stats()`**

```sql
get_my_stats() RETURNS json
```

**Returns:**
```json
{
  "total_contributions": integer,
  "lighters_saved": integer,
  "lighters_contributed_to": integer,
  "likes_received": integer
}
```

**Permissions:** authenticated
**Security:** SECURITY DEFINER, SET search_path = public

---

**10. `grant_trophy()`**

```sql
grant_trophy(
  user_to_grant_id uuid,
  trophy_to_grant_id integer
) RETURNS void
```

**Behavior:**
- Inserts into user_trophies
- ON CONFLICT (user_id, trophy_id) DO NOTHING

**Permissions:** authenticated (admin check in code)
**Security:** SECURITY DEFINER, SET search_path = public

---

**11. `backfill_all_trophies()`**

```sql
backfill_all_trophies() RETURNS text
```

**Purpose:** Bulk grant trophies based on user achievements
**Checks:**
- Trophy 1: If lighters >= 1
- Trophy 2: If posts >= 1
- Trophy 3: If creation posts >= 1
- Trophy 4: If distinct lighters >= 5
- Trophy 5: If refuel posts >= 1

**Returns:** Success message
**Permissions:** authenticated (admin check in code)
**Security:** SECURITY DEFINER, SET search_path = public

---

#### Location & Distance Functions

**12. `calculate_distance()`**

```sql
calculate_distance(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
) RETURNS double precision
```

**Algorithm:** Haversine formula
**Returns:** Distance in kilometers
**Permissions:** authenticated, anon
**Security:** SET search_path = public

---

#### Feed Functions

**13. `get_random_public_posts()`**

```sql
get_random_public_posts(limit_count integer)
RETURNS TABLE(
  id bigint,
  lighter_id uuid,
  user_id uuid,
  created_at timestamp with time zone,
  post_type text,
  title text,
  content_text text,
  content_url text,
  location_name text,
  location_lat numeric,
  location_lng numeric,
  is_find_location boolean,
  is_creation boolean,
  is_anonymous boolean,
  is_pinned boolean,
  username text,
  like_count bigint,
  user_has_liked boolean,
  nationality text,
  show_nationality boolean,
  is_public boolean,
  is_flagged boolean,
  flagged_count integer
)
```

**Purpose:** Randomized public feed
**Filters:** WHERE is_public = true AND is_flagged = false
**Permissions:** authenticated, anon
**Security:** SET search_path = public

---

### 1.3 EXISTING TRIGGERS (1 Trigger)

#### Trigger: `on_auth_user_created`
**Table:** auth.users
**Event:** AFTER INSERT
**Function:** `handle_new_user()`
**Action:** Creates corresponding profile record

---

### 1.4 EXISTING INDEXES (Summary)

**Profiles Table:**
- PRIMARY KEY (id)
- UNIQUE (username)

**Posts Table:**
- PRIMARY KEY (id)
- FK (user_id)
- FK (lighter_id)

**Lighters Table:**
- PRIMARY KEY (id)
- UNIQUE (pin_code)
- FK (saver_id)

**Likes Table:**
- PRIMARY KEY (id)
- UNIQUE COMPOSITE (post_id, user_id)
- FK (post_id)
- FK (user_id)

**User_Trophies Table:**
- PRIMARY KEY (id)
- UNIQUE COMPOSITE (user_id, trophy_id)
- FK (user_id)

---

## PART 2: PLANNED DATABASE MIGRATIONS

### 2.1 PLANNED TABLE: `moderation_queue`
**Status:** SCHEMA DOCUMENTED in MODERATION_SCHEMA.md
**Implementation:** PENDING

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who created content (FK) |
| `content_type` | TEXT | 'post', 'comment', 'lighter_name', 'profile' |
| `content` | TEXT | Actual content moderated |
| `content_url` | TEXT | URL if image |
| `post_id` | UUID | Reference to post |
| `flagged` | BOOLEAN | OpenAI flagged it |
| `categories` | JSONB | `{hate: false, harassment: true, ...}` |
| `scores` | JSONB | `{hate: 0.05, harassment: 0.72, ...}` |
| `severity` | TEXT | 'low', 'medium', 'high' |
| `status` | TEXT | 'pending', 'approved', 'rejected', 'under_review' |
| `review_notes` | TEXT | Admin notes |
| `action_taken` | TEXT | 'none', 'warning', 'content_removed', 'account_suspended' |
| `reviewed_by` | UUID | Admin who reviewed |
| `reviewed_at` | TIMESTAMP | Review timestamp |
| `created_at` | TIMESTAMP | Moderation check time |
| `updated_at` | TIMESTAMP | Last update |

**Indexes Planned:** 8 performance indexes
**RLS Policies Planned:** Users see own; admins/mods see all
**Triggers Planned:** Auto-update `updated_at`
**Functions Planned:** `log_moderation_result()`, `get_moderation_stats()`

---

### 2.2 PLANNED TABLE: `orders`
**Status:** SCHEMA DOCUMENTED in DATABASE_MIGRATION_GUIDE.md
**Implementation:** PENDING

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Who placed order (FK) |
| `stripe_payment_intent_id` | TEXT | Stripe reference |
| `stripe_customer_email` | TEXT | Email at order time |
| `pack_size` | INTEGER | 5, 10, 25, or 50 stickers |
| `amount_cents` | INTEGER | Price in cents |
| `currency` | TEXT | 'eur', 'usd', 'gbp', 'jpy' |
| `lighter_id` | UUID | Which lighter design |
| `design_snapshot` | JSONB | Design at order time |
| `status` | TEXT | 'pending', 'processing', 'completed', 'failed', 'refunded' |
| `payment_status` | TEXT | Stripe status |
| `shipped_at` | TIMESTAMP | Fulfillment timestamp |
| `tracking_number` | TEXT | Courier tracking |
| `notes` | TEXT | Admin notes |
| `created_at` | TIMESTAMP | Order placement |
| `updated_at` | TIMESTAMP | Last update |
| `completed_at` | TIMESTAMP | Payment success |

**Indexes Planned:** 7 performance indexes
**RLS Policies Planned:** Users see own; admins see all
**Triggers Planned:** Auto-update `updated_at`
**Functions Planned:** `create_order_from_payment()`, `update_order_payment_succeeded()`, `get_order_analytics()`

---

### 2.3 PLANNED LIGHTERS TABLE ENHANCEMENTS
**Status:** DOCUMENTED in DATABASE_MIGRATION_GUIDE.md
**Implementation:** PENDING

**New Columns to Add:**
```sql
ALTER TABLE lighters ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#FF6B6B';
ALTER TABLE lighters ADD COLUMN IF NOT EXISTS sticker_language TEXT DEFAULT 'en';
ALTER TABLE lighters ADD COLUMN IF NOT EXISTS sticker_design_version INTEGER DEFAULT 1;
ALTER TABLE lighters ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

**Purpose:** Persist sticker design properties for regeneration

---

### 2.4 PLANNED RPC FUNCTIONS

**1. `log_moderation_result()`**
- Logs OpenAI moderation checks
- Called by `/api/moderate-text` and `/api/moderate-image`
- Returns UUID of created record

**2. `create_order_from_payment()`**
- Creates order when payment initiated
- Called by `/api/create-payment-intent`
- Captures design_snapshot JSONB

**3. `update_order_payment_succeeded()`**
- Updates order status after Stripe confirms payment
- Called by Stripe webhook handler
- Returns success/error JSON

**4. `get_moderation_stats()`**
- Dashboard analytics
- Configurable time period
- Returns: total_flagged, pending_review, approved_count, etc.

**5. `get_order_analytics()`**
- Order dashboard analytics
- Configurable time period
- Returns: total_orders, completed_orders, revenue, avg_value, etc.

---

## PART 3: MISSING COMPONENTS ANALYSIS

### 3.1 CONTENT MODERATION SYSTEM

**Status:** PARTIALLY IMPLEMENTED
**Completion:** 40%

**What Exists:**
- ✅ OpenAI moderation API endpoints (`/api/moderate-text`, `/api/moderate-image`)
- ✅ `useContentModeration` hook
- ✅ Moderation checks in AddPostForm component
- ✅ ModerationsQueue UI component (`/app/[locale]/moderation/`)
- ✅ MODERATION_SCHEMA.md documentation

**What's Missing:**
- ❌ `moderation_queue` table (pending SQL migration)
- ❌ `log_moderation_result()` RPC function (pending)
- ❌ Database logging in moderation endpoints (needs implementation)
- ❌ `get_moderation_stats()` RPC for dashboard (pending)
- ❌ View: `moderation_queue_with_user` (pending)
- ❌ Admin moderation dashboard queries (pending implementation)

**Next Steps:**
1. Execute moderation_queue table migration
2. Update `/api/moderate-text` to call `log_moderation_result()`
3. Update `/api/moderate-image` to call `log_moderation_result()`
4. Build admin dashboard for moderators

---

### 3.2 PAYMENT & ORDER SYSTEM

**Status:** PARTIALLY IMPLEMENTED
**Completion:** 30%

**What Exists:**
- ✅ Stripe integration (`/api/create-payment-intent`)
- ✅ StripePaymentForm component
- ✅ Sticker PDF generation (`/api/generate-sticker-pdf`)
- ✅ DATABASE_MIGRATION_GUIDE.md documentation
- ✅ Order schema design documented

**What's Missing:**
- ❌ `orders` table (pending SQL migration)
- ❌ `create_order_from_payment()` RPC (pending)
- ❌ `update_order_payment_succeeded()` RPC (pending)
- ❌ `get_order_analytics()` RPC (pending)
- ❌ Order creation in `/api/create-payment-intent` (needs implementation)
- ❌ Stripe webhook handler for payment.intent.succeeded
- ❌ View: `orders_with_details` (pending)
- ❌ Admin order management dashboard (pending)

**Next Steps:**
1. Execute orders table migration
2. Update `/api/create-payment-intent` to call `create_order_from_payment()`
3. Implement Stripe webhook endpoint
4. Build admin order management page

---

### 3.3 STICKER DESIGN PERSISTENCE

**Status:** PARTIALLY IMPLEMENTED
**Completion:** 50%

**What Exists:**
- ✅ Sticker PDF generation endpoint (`/api/generate-sticker-pdf`)
- ✅ StickerDesign interface defined
- ✅ StickerPreview component
- ✅ `background_color`, `sticker_language` planned in lighters table

**What's Missing:**
- ❌ `background_color` column on lighters (pending ALTER TABLE)
- ❌ `sticker_language` column on lighters (pending ALTER TABLE)
- ❌ `sticker_design_version` column (pending ALTER TABLE)
- ❌ `updated_at` trigger on lighters (pending)
- ❌ Saving design properties in SaveLighterFlow
- ❌ Retrieving design snapshot in orders table
- ❌ API to regenerate stickers with same design

**Next Steps:**
1. Add columns to lighters table
2. Update SaveLighterFlow to capture background_color, language
3. Store design_snapshot in orders when creating order
4. Add endpoint to regenerate stickers from design_snapshot

---

### 3.4 ADDITIONAL MISSING TABLES/FEATURES

**Not Yet Designed:**
- ❌ `comments` table (for post comments)
- ❌ `notifications` table (for user alerts)
- ❌ `user_reports` table (for user-submitted abuse reports)
- ❌ `audit_log` table (for admin action tracking)
- ❌ `blocked_users` table (for user blocking feature)
- ❌ `lighter_favorites` table (if favoriting feature planned)
- ❌ `user_settings` table (for privacy/notification preferences)

---

## PART 4: RLS POLICY SUMMARY

### All Tables: Row Level Security Status

| Table | RLS Enabled | SELECT Policy | INSERT Policy | UPDATE Policy | DELETE Policy |
|-------|-----------|---------------|---------------|---------------|---------------|
| **profiles** | ✅ YES | All users | Own only | Own only | Own only |
| **posts** | ✅ YES | Public only | Own only | Own only | Own only |
| **likes** | ✅ YES | All users | Own only | N/A | Own only |
| **lighters** | ✅ YES | All users | Own only | Saver only | Saver only |
| **user_trophies** | ⚠️ PARTIAL | All users | N/A | N/A | N/A |
| **moderation_queue** | ❌ PLANNED | Admins/mods + own | Disabled | Admins/mods | Admins/mods |
| **orders** | ❌ PLANNED | Own + admins | Disabled | Admins | Admins |

---

## PART 5: FUNCTION CALL REFERENCE

### How Functions Are Called From Client

**JavaScript/TypeScript Pattern:**
```typescript
const { data, error } = await supabase.rpc('function_name', {
  p_param_name: value,
  p_other_param: value2,
});
```

### Function Call Examples

**1. Create Post:**
```typescript
const { data, error } = await supabase.rpc('create_new_post', {
  p_lighter_id: lighterId,
  p_post_type: 'text',
  p_title: 'My Story',
  p_content_text: 'This is my contribution...',
  p_content_url: null,
  p_location_name: null,
  p_location_lat: 48.8566,
  p_location_lng: 2.3522,
  p_is_find_location: false,
  p_is_creation: true,
  p_is_anonymous: false,
  p_is_public: true,
});
```

**2. Like/Unlike Post:**
```typescript
const { data, error } = await supabase.rpc('toggle_like', {
  p_post_id: postId,
});
// Returns: {action: 'liked'|'unliked', post_id: uuid, success: true}
```

**3. Create Lighter:**
```typescript
const { data: lighterId, error } = await supabase.rpc('create_new_lighter', {
  lighter_name: 'My Lighter',
  background_url: 'https://...',
  show_username: true,
});
```

**4. Get User Stats:**
```typescript
const { data: stats, error } = await supabase.rpc('get_my_stats');
// Returns: {total_contributions: 5, lighters_saved: 2, ...}
```

---

## PART 6: SCHEMA MIGRATION COMMANDS

### Required SQL Migrations (NOT YET EXECUTED)

**File 1: moderation_queue table**
```sql
-- From MODERATION_SCHEMA.md
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- ... 14 columns total (see MODERATION_SCHEMA.md)
);
-- Creates 8 indexes
-- Enables RLS with 3 policies
-- Creates 2 functions + 1 trigger
```

**File 2: orders table**
```sql
-- From DATABASE_MIGRATION_GUIDE.md
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- ... 16 columns total (see DATABASE_MIGRATION_GUIDE.md)
);
-- Creates 7 indexes
-- Enables RLS with 2 policies
-- Creates 3 functions + 1 trigger
```

**File 3: Enhance lighters table**
```sql
ALTER TABLE lighters ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#FF6B6B';
ALTER TABLE lighters ADD COLUMN IF NOT EXISTS sticker_language TEXT DEFAULT 'en';
ALTER TABLE lighters ADD COLUMN IF NOT EXISTS sticker_design_version INTEGER DEFAULT 1;
ALTER TABLE lighters ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

---

## PART 7: COMPLETENESS CHECKLIST

### Content Moderation System
- [x] Endpoints created
- [x] OpenAI integration
- [x] Hook implementation
- [ ] Database table
- [ ] RPC logging function
- [ ] Endpoint logging calls
- [ ] Admin dashboard
- [ ] Analytics function

**Completion: 40%**

---

### Payment & Order System
- [x] Stripe integration
- [x] Payment form
- [x] Sticker PDF generation
- [ ] Orders database table
- [ ] Order creation RPC
- [ ] Payment confirmation RPC
- [ ] Webhook handler
- [ ] Admin dashboard
- [ ] Analytics function

**Completion: 30%**

---

### Sticker Design Persistence
- [x] PDF generation
- [x] Design interface
- [ ] Database columns (background_color, language, version)
- [ ] Save design properties
- [ ] Snapshot in orders
- [ ] Regeneration endpoint

**Completion: 50%**

---

## PART 8: FILE LOCATIONS AND DOCUMENTATION

### SQL Migration Files
- **Main migration:** `/supabase/migrations/20251030120000_add_flag_count_trigger.sql` (existing)
- **Security fixes:** `/supabase_migration_fix_all.sql` (existing)
- **Moderation schema:** `/MODERATION_SCHEMA.md` (documentation only)
- **Payment schema:** `/DATABASE_MIGRATION_GUIDE.md` (documentation only)

### Documentation Files
1. `/MODERATION_SCHEMA.md` - Complete moderation table + RLS + functions + queries
2. `/DATABASE_MIGRATION_GUIDE.md` - Complete migration guide for all 3 systems
3. `/COMPREHENSIVE_AUDIT_REPORT.md` - Security and code quality audit

### API Endpoints
- `/app/api/moderate-text/route.ts` - Text moderation
- `/app/api/moderate-image/route.ts` - Image moderation
- `/app/api/create-payment-intent/route.ts` - Stripe payment
- `/app/api/generate-sticker-pdf/route.ts` - Sticker PDF generation

### Frontend Components
- `/app/hooks/useContentModeration.ts` - Moderation hook
- `/app/[locale]/moderation/` - Moderation dashboard (UI only, needs queries)
- `/app/[locale]/save-lighter/StripePaymentForm.tsx` - Payment form
- `/app/[locale]/save-lighter/StickerPreview.tsx` - Sticker preview

---

## PART 9: NEXT IMMEDIATE ACTIONS

### Priority 1: Execute Pending Migrations (2-3 hours)
1. Copy MODERATION_SCHEMA.md SQL to Supabase editor and execute
2. Copy DATABASE_MIGRATION_GUIDE.md migration SQL to Supabase editor and execute
3. Verify tables created with provided verification queries

### Priority 2: Update API Endpoints (2-3 hours)
1. Modify `/api/moderate-text` to call `log_moderation_result()` RPC
2. Modify `/api/moderate-image` to call `log_moderation_result()` RPC
3. Modify `/api/create-payment-intent` to call `create_order_from_payment()` RPC

### Priority 3: Implement Stripe Webhooks (1-2 hours)
1. Create `/api/webhooks/stripe/route.ts`
2. Verify webhook signature
3. Call `update_order_payment_succeeded()` on payment.intent.succeeded

### Priority 4: Build Admin Dashboards (4-5 hours)
1. Moderation dashboard page - query `moderation_queue_with_user` view
2. Order management page - query `orders_with_details` view
3. Analytics components - call `get_moderation_stats()` and `get_order_analytics()`

---

## CONCLUSION

**Current State:** Core functionality 100%, Advanced features 30-50%

**The application has:**
- ✅ Solid foundation with 5 active tables
- ✅ 13+ RPC functions for core operations
- ✅ RLS policies for user data protection
- ✅ Moderation and payment infrastructure started
- ✅ Comprehensive migration documentation

**Still Needed:**
- 2 new tables (moderation_queue, orders)
- 5 new RPC functions
- 2 new views
- 2 new admin dashboards
- 1 Stripe webhook handler

**Estimated Time to Completion:** 10-15 developer hours

---

**Report Generated:** 2025-11-03
**Database:** Supabase PostgreSQL
**Status:** Production-ready core, advanced features in development
