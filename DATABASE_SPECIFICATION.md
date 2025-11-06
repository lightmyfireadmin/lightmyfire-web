# LightMyFire - Complete Database Specification

**Version:** 0.8.0
**Last Updated:** 2025-11-06
**Purpose:** Comprehensive documentation of database structure, functions, policies, and conformity analysis

---

## Table of Contents

1. [Database Overview](#1-database-overview)
2. [Schema Architecture](#2-schema-architecture)
3. [Tables Specification](#3-tables-specification)
4. [RPC Functions](#4-rpc-functions)
5. [Database Views](#5-database-views)
6. [Triggers](#6-triggers)
7. [Row Level Security (RLS) Policies](#7-row-level-security-rls-policies)
8. [Indexes](#8-indexes)
9. [Foreign Key Constraints](#9-foreign-key-constraints)
10. [Storage Buckets](#10-storage-buckets)
11. [Migrations History](#11-migrations-history)
12. [Security & Performance Analysis](#12-security--performance-analysis)
13. [Conformity with Product Specification](#13-conformity-with-product-specification)

---

## 1. Database Overview

### 1.1 Database Platform
- **Provider:** Supabase (PostgreSQL 15+)
- **Extensions Installed:**
  - `uuid-ossp` - UUID generation
  - `pgcrypto` - Cryptographic functions
  - `pg_stat_statements` - Query performance monitoring
  - `pg_graphql` - GraphQL support
  - `supabase_vault` - Secrets management

### 1.2 Schema Organization
- **public:** Application tables, functions, views
- **auth:** Supabase Auth system (managed)
- **storage:** File storage system (managed)
- **extensions:** PostgreSQL extensions

### 1.3 Current Data Volume
- **Users (auth.users):** 13 users
- **Profiles:** 13 profiles
- **Lighters:** 15 lighters
- **Posts:** 207 posts
- **Likes:** 1 like
- **Orders:** 0 orders
- **Trophies:** 10 trophy types
- **User Trophies:** 60 earned trophies
- **Lighter Contributions:** 166 contribution records
- **Moderation Queue:** 0 items
- **Post Flags:** 0 flags

---

## 2. Schema Architecture

### 2.1 Core Entity Relationships

```
┌─────────────┐
│ auth.users  │
└──────┬──────┘
       │
       ├─────────────┐
       │             │
┌──────▼──────┐  ┌──▼────────────┐
│  profiles   │  │    orders     │
│  (public)   │  │   (public)    │
└──────┬──────┘  └───────────────┘
       │
       ├──────────┬──────────┬────────────┐
       │          │          │            │
┌──────▼──────┐ ┌▼────────┐ ┌▼──────────┐ ┌▼───────────────┐
│  lighters   │ │  posts  │ │   likes   │ │ user_trophies  │
└──────┬──────┘ └─────┬───┘ └───────────┘ └────────────────┘
       │              │
       │              ├─────────────┐
       │              │             │
       └──────────────▼─────────┐   │
                 ┌───────────────▼───▼────┐
                 │  lighter_contributions │
                 └────────────────────────┘
```

### 2.2 Supporting Systems

```
┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
│  trophies    │      │ moderation_queue│      │ post_flags   │
│ (reference)  │      │   (moderation)  │      │ (flagging)   │
└──────────────┘      └─────────────────┘      └──────────────┘

┌──────────────────┐
│ webhook_events   │
│  (idempotency)   │
└──────────────────┘
```

---

## 3. Tables Specification

### 3.1 profiles

**Purpose:** User profile information extending auth.users

**Schema:** `public`
**RLS Enabled:** Yes
**Current Rows:** 13

#### Columns

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | - | PRIMARY KEY, FK → auth.users.id |
| `username` | text | No | - | UNIQUE, CHECK (length 3-20) |
| `created_at` | timestamptz | No | now() | - |
| `level` | integer | No | 1 | - |
| `points` | integer | No | 0 | - |
| `nationality` | text | Yes | NULL | - |
| `show_nationality` | boolean | Yes | false | - |
| `role` | text | Yes | 'user' | - |

#### Indexes
- `profiles_pkey` (PRIMARY KEY on id)
- `profiles_username_key` (UNIQUE on username)
- `idx_profiles_username` (btree on username)
- `idx_profiles_role` (btree on role)
- `idx_profiles_created_at` (btree on created_at DESC)

#### Relationships
- **Parent:** auth.users (id)
- **Children:** lighters, posts, likes, user_trophies, lighter_contributions, post_flags

#### Business Logic
- Automatically created via `handle_new_user` trigger when user signs up
- Username auto-generated from email or metadata if not provided
- Role determines access level: 'user', 'moderator', 'admin'
- Level and points currently tracked but not actively used

---

### 3.2 lighters

**Purpose:** Digital lighter logbooks that users create and share

**Schema:** `public`
**RLS Enabled:** Yes
**Current Rows:** 15

#### Columns

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | PRIMARY KEY |
| `pin_code` | text | No | - | UNIQUE, format XXX-XXX |
| `name` | text | No | - | CHECK (length 1-50) |
| `saver_id` | uuid | No | - | FK → profiles.id |
| `created_at` | timestamptz | No | now() | - |
| `custom_background_url` | text | Yes | NULL | - |
| `show_saver_username` | boolean | No | false | - |
| `is_retired` | boolean | No | false | - |
| `times_refueled` | integer | No | 0 | - |
| `total_distance` | numeric | Yes | 0 | - |
| `total_refills` | integer | Yes | 0 | - |
| `background_color` | text | Yes | '#FF6B6B' | - |
| `sticker_language` | text | Yes | 'en' | CHECK (in allowed languages) |
| `sticker_design_version` | integer | Yes | 1 | - |
| `updated_at` | timestamptz | Yes | now() | - |

#### Indexes
- `lighters_pkey` (PRIMARY KEY on id)
- `lighters_pin_code_key` (UNIQUE on pin_code)
- `idx_lighters_pin_code` (btree on pin_code) - for fast PIN lookups
- `idx_lighters_saver_id` (btree on saver_id)
- `idx_lighters_created_at` (btree on created_at DESC)
- `idx_lighters_updated_at` (btree on updated_at DESC)
- `idx_lighters_is_retired` (partial btree WHERE is_retired = false)

#### Relationships
- **Parent:** profiles (saver_id)
- **Children:** posts, orders, lighter_contributions, moderation_queue

#### Business Logic
- PIN codes auto-generated via `generate_random_pin()` function
- PIN format: XXX-XXX (3 alphanumeric, hyphen, 3 alphanumeric)
- Each PIN is unique across entire database
- Background color used for sticker generation
- Sticker language determines QR code landing page locale
- `updated_at` auto-updated via trigger
- Trophy checks triggered on INSERT

#### Allowed Sticker Languages
- en, fr, es, de, it, pt (validated by CHECK constraint)
- Note: Application supports 27 languages, but sticker constraint limits to 6

---

### 3.3 posts

**Purpose:** User contributions to lighter stories (text, images, songs, locations, refuels)

**Schema:** `public`
**RLS Enabled:** Yes
**Current Rows:** 207

#### Columns

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | bigint | No | nextval('posts_id_seq') | PRIMARY KEY |
| `lighter_id` | uuid | No | - | FK → lighters.id |
| `user_id` | uuid | No | - | FK → profiles.id |
| `created_at` | timestamptz | No | now() | - |
| `post_type` | text | No | - | CHECK (in: text, image, song, location, refuel) |
| `title` | text | Yes | NULL | CHECK (length ≤ 200) |
| `content_text` | text | Yes | NULL | CHECK (length ≤ 5000) |
| `content_url` | text | Yes | NULL | CHECK (length ≤ 2000) |
| `location_name` | text | Yes | NULL | CHECK (length ≤ 100) |
| `location_lat` | numeric | Yes | NULL | - |
| `location_lng` | numeric | Yes | NULL | - |
| `is_find_location` | boolean | No | false | - |
| `is_creation` | boolean | No | false | - |
| `is_anonymous` | boolean | No | false | - |
| `is_public` | boolean | No | true | - |
| `is_pinned` | boolean | No | false | - |
| `flagged_count` | integer | No | 0 | - |
| `is_flagged` | boolean | Yes | false | - |

#### Indexes
- `posts_pkey` (PRIMARY KEY on id)
- `idx_posts_lighter_id` (btree on lighter_id)
- `idx_posts_user_id` (btree on user_id)
- `idx_posts_created_at` (btree on created_at DESC)
- `idx_posts_post_type` (btree on post_type)
- `idx_posts_is_public` (btree on is_public)
- `idx_posts_is_flagged` (btree on is_flagged)
- `idx_posts_is_pinned` (partial btree WHERE is_pinned = true)

#### Relationships
- **Parents:** lighters (lighter_id), profiles (user_id)
- **Children:** likes, post_flags, moderation_queue

#### Business Logic
- Each post belongs to one lighter and one user
- Post types determine required fields:
  - **text:** content_text required
  - **image:** content_url required (storage bucket)
  - **song:** content_url required (YouTube URL)
  - **location:** location_name, location_lat, location_lng required
  - **refuel:** minimal data, just marks refuel event
- `is_creation` marks the first post on a lighter
- `is_find_location` marks where lighter was found
- `is_anonymous` hides user identity
- `is_public` controls visibility (false = only accessible via PIN)
- `is_flagged` auto-set when flagged_count ≥ 3
- Trophy checks triggered on INSERT

#### Content Length Limits
- Title: 200 characters max
- Content text: 5000 characters max
- Content URL: 2000 characters max
- Location name: 100 characters max

---

### 3.4 likes

**Purpose:** User likes/reactions to posts

**Schema:** `public`
**RLS Enabled:** Yes
**Current Rows:** 1

#### Columns

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `user_id` | uuid | No | - | FK → profiles.id, PRIMARY KEY |
| `post_id` | bigint | No | nextval('likes_post_id_seq') | FK → posts.id, PRIMARY KEY |
| `created_at` | timestamptz | No | now() | - |

#### Indexes
- `likes_pkey` (PRIMARY KEY on user_id, post_id)
- `idx_likes_user_id` (btree on user_id)
- `idx_likes_post_id` (btree on post_id)
- `idx_likes_created_at` (btree on created_at DESC)

#### Relationships
- **Parents:** profiles (user_id), posts (post_id)

#### Business Logic
- Composite primary key ensures one like per user per post
- No "dislike" - like is boolean (present or absent)
- Trophy checks triggered on INSERT for post owner
- Managed via `toggle_like()` function

---

### 3.5 lighter_contributions

**Purpose:** Track which users have contributed to which lighters

**Schema:** `public`
**RLS Enabled:** Yes
**Current Rows:** 166

#### Columns

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `user_id` | uuid | No | - | FK → profiles.id, PRIMARY KEY |
| `lighter_id` | uuid | No | - | FK → lighters.id, PRIMARY KEY |
| `last_post_at` | timestamptz | No | now() | - |

#### Indexes
- `lighter_contributions_pkey` (PRIMARY KEY on user_id, lighter_id)
- `idx_lighter_contributions_lighter_id` (btree on lighter_id)

#### Relationships
- **Parents:** profiles (user_id), lighters (lighter_id)

#### Business Logic
- Composite primary key ensures one record per user per lighter
- `last_post_at` tracks when user last posted to this lighter
- Used to enforce 24-hour cooldown period
- Auto-updated when user creates post

---

### 3.6 trophies

**Purpose:** Reference table for achievement types

**Schema:** `public`
**RLS Enabled:** Yes
**Current Rows:** 10

#### Columns

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | integer | No | - | PRIMARY KEY |
| `name` | text | No | - | - |
| `description` | text | No | - | - |
| `icon_name` | text | Yes | NULL | - |

#### Indexes
- `trophies_pkey` (PRIMARY KEY on id)

#### Relationships
- **Children:** user_trophies

#### Trophy Types (Seeded Data)

| ID | Name | Criteria |
|----|------|----------|
| 1 | First LightSaver | Create first lighter |
| 2 | First Story | Create first post |
| 3 | Storyteller | Create 5 posts |
| 4 | Chronicle Master | Create 10 posts |
| 5 | Collection Starter | Create 5 lighters |
| 6 | Community Builder | Contribute to 10 different lighters |
| 7 | World Traveler | Post locations from 5 different countries |
| 8 | Popular | Receive 50 likes |
| 9 | Photographer | Post 10 images |
| 10 | DJ | Post 5 songs |

---

### 3.7 user_trophies

**Purpose:** Junction table tracking which users earned which trophies

**Schema:** `public`
**RLS Enabled:** Yes
**Current Rows:** 60

#### Columns

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `user_id` | uuid | No | - | FK → profiles.id, PRIMARY KEY |
| `trophy_id` | integer | No | - | FK → trophies.id, PRIMARY KEY |
| `earned_at` | timestamptz | No | now() | - |

#### Indexes
- `user_trophies_pkey` (PRIMARY KEY on user_id, trophy_id)
- `idx_user_trophies_user_id` (btree on user_id)
- `idx_user_trophies_trophy_id` (btree on trophy_id)
- `idx_user_trophies_earned_at` (btree on earned_at DESC)

#### Relationships
- **Parents:** profiles (user_id), trophies (trophy_id)

#### Business Logic
- Automatically granted via triggers when conditions met
- `auto_grant_trophies()` function checks eligibility
- Triggers fire on: lighter creation, post creation, like received
- Cannot earn same trophy twice (enforced by composite PK)

---

### 3.8 orders

**Purpose:** Track physical sticker orders and payments

**Schema:** `public`
**RLS Enabled:** Yes
**Current Rows:** 0

#### Columns

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | PRIMARY KEY |
| `user_id` | uuid | No | - | FK → auth.users.id |
| `stripe_payment_intent_id` | text | No | - | UNIQUE |
| `stripe_customer_email` | text | No | - | - |
| `pack_size` | integer | No | - | CHECK (in: 5, 10, 25, 50) |
| `amount_cents` | integer | No | - | CHECK (> 0) |
| `currency` | text | No | 'eur' | CHECK (in: eur, usd, gbp, jpy) |
| `lighter_id` | uuid | Yes | NULL | FK → lighters.id |
| `design_snapshot` | jsonb | No | {} | - |
| `status` | text | No | 'pending' | CHECK (in: pending, processing, completed, failed, refunded) |
| `payment_status` | text | No | 'requires_payment_method' | CHECK (matches Stripe statuses) |
| `shipped_at` | timestamptz | Yes | NULL | - |
| `tracking_number` | text | Yes | NULL | - |
| `notes` | text | Yes | NULL | - |
| `created_at` | timestamptz | Yes | now() | - |
| `updated_at` | timestamptz | Yes | now() | - |
| `completed_at` | timestamptz | Yes | NULL | - |
| `shipping_name` | text | Yes | NULL | - |
| `shipping_email` | text | Yes | NULL | - |
| `shipping_address` | text | Yes | NULL | - |
| `shipping_city` | text | Yes | NULL | - |
| `shipping_postal_code` | text | Yes | NULL | - |
| `shipping_country` | text | Yes | NULL | - |
| `refund_status` | text | Yes | NULL | CHECK (in: pending, refunded, failed) |
| `refund_amount_cents` | integer | Yes | NULL | CHECK (≥ 0) |
| `refunded_at` | timestamptz | Yes | NULL | - |

#### Indexes
- `orders_pkey` (PRIMARY KEY on id)
- `orders_stripe_payment_intent_id_key` (UNIQUE on stripe_payment_intent_id)
- `idx_orders_user_id` (btree on user_id)
- `idx_orders_stripe_payment_intent` (btree on stripe_payment_intent_id)
- `idx_orders_status` (btree on status)
- `idx_orders_payment_status` (btree on payment_status)
- `idx_orders_created_at` (btree on created_at DESC)
- `idx_orders_completed_at` (partial btree WHERE completed_at IS NOT NULL)
- `idx_orders_pack_size` (btree on pack_size)
- `idx_orders_refund_status` (partial btree WHERE refund_status IS NOT NULL)

#### Relationships
- **Parent:** auth.users (user_id), lighters (lighter_id - optional)

#### Business Logic
- Integrated with Stripe payment processing
- `design_snapshot` stores lighter design at time of order (JSONB)
- Shipping address collected during checkout
- `updated_at` auto-updated via trigger
- Admin can refund orders via dashboard
- Tracking numbers added when shipped

#### Pack Sizes Available
- 5 stickers (test/individual)
- 10 stickers (Starting LightSaver) - €7.20
- 25 stickers (Committed LightSaver) - €14.40 (actual: 20 stickers per product spec)
- 50 stickers (Community LightSaver) - €36.00

**Note:** Discrepancy between database constraint and product specification for pack sizes. Database allows 5 and 25, product spec shows 10, 20, 50.

---

### 3.9 moderation_queue

**Purpose:** Content moderation system for OpenAI moderation and manual review

**Schema:** `public`
**RLS Enabled:** Yes
**Current Rows:** 0

#### Columns

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | PRIMARY KEY |
| `user_id` | uuid | No | - | FK → auth.users.id |
| `content_type` | text | No | 'general' | CHECK (in types) |
| `content` | text | No | - | - |
| `content_url` | text | Yes | NULL | - |
| `post_id` | bigint | Yes | NULL | FK → posts.id |
| `lighter_id` | uuid | Yes | NULL | FK → lighters.id |
| `flagged` | boolean | No | false | - |
| `categories` | jsonb | No | {} | OpenAI categories |
| `scores` | jsonb | No | {} | OpenAI scores |
| `severity` | text | No | 'low' | CHECK (in: low, medium, high) |
| `status` | text | No | 'pending' | CHECK (in: pending, approved, rejected, under_review) |
| `review_notes` | text | Yes | NULL | - |
| `action_taken` | text | Yes | 'none' | CHECK (in: none, warning, content_removed, account_suspended) |
| `reviewed_by` | uuid | Yes | NULL | FK → auth.users.id |
| `reviewed_at` | timestamptz | Yes | NULL | - |
| `created_at` | timestamptz | Yes | now() | - |
| `updated_at` | timestamptz | Yes | now() | - |

#### Indexes
- `moderation_queue_pkey` (PRIMARY KEY on id)
- `idx_moderation_queue_user_id` (btree on user_id)
- `idx_moderation_queue_content_type` (btree on content_type)
- `idx_moderation_queue_status` (partial btree WHERE status ≠ 'approved')
- `idx_moderation_queue_severity` (btree on severity)
- `idx_moderation_queue_flagged` (partial btree WHERE flagged = true)
- `idx_moderation_queue_created_at` (btree on created_at DESC)
- `idx_moderation_queue_post_id` (partial btree WHERE post_id IS NOT NULL)
- `idx_moderation_queue_lighter_id` (partial btree WHERE lighter_id IS NOT NULL)
- `idx_moderation_queue_reviewed_by` (btree on reviewed_by)

#### Relationships
- **Parents:** auth.users (user_id, reviewed_by), posts (post_id), lighters (lighter_id)

#### Business Logic
- All user-generated content passes through OpenAI moderation API
- `categories` and `scores` store OpenAI moderation response
- If flagged by AI → status = 'pending', requires manual review
- Moderators and admins can access via dashboard
- `updated_at` auto-updated via trigger
- Supports multiple content types: post, comment, lighter_name, profile, image, general

---

### 3.10 post_flags

**Purpose:** User-reported inappropriate content

**Schema:** `public`
**RLS Enabled:** Yes
**Current Rows:** 0

#### Columns

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `user_id` | uuid | No | - | FK → profiles.id, PRIMARY KEY |
| `post_id` | bigint | No | - | FK → posts.id, PRIMARY KEY |
| `reason` | text | Yes | NULL | - |
| `created_at` | timestamptz | No | now() | - |

#### Indexes
- `post_flags_pkey` (PRIMARY KEY on user_id, post_id)
- `idx_post_flags_user_id` (btree on user_id)
- `idx_post_flags_post_id` (btree on post_id)

#### Relationships
- **Parents:** profiles (user_id), posts (post_id)

#### Business Logic
- Composite PK ensures one flag per user per post
- Triggers `increment_post_flag_count` function
- When post reaches 3 flags → `posts.is_flagged` = true
- Moderators can view all flags
- Users can only see their own flags

---

### 3.11 webhook_events

**Purpose:** Idempotency tracking for Stripe webhooks

**Schema:** `public`
**RLS Enabled:** Yes
**Current Rows:** 0

#### Columns

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| `id` | text | No | - | PRIMARY KEY (Stripe event ID) |
| `event_type` | text | No | - | - |
| `processed_at` | timestamptz | No | now() | - |
| `payload` | jsonb | Yes | NULL | - |
| `created_at` | timestamptz | No | now() | - |

#### Indexes
- `webhook_events_pkey` (PRIMARY KEY on id)
- `idx_webhook_events_created_at` (btree on created_at)

#### Business Logic
- Prevents duplicate processing of Stripe webhooks
- `id` is Stripe event ID (idempotency key)
- Stores full webhook payload for debugging
- No RLS policies allow public access (locked down)

---

## 4. RPC Functions

### 4.1 Lighter Management Functions

#### `generate_random_pin() → text`
**Purpose:** Generate unique 6-character PIN codes for lighters

**Algorithm:**
- Characters: A-Z, 0-9 (36 possible per position)
- Format: XXX-XXX
- Returns: e.g., "A3F-K9W"

**Usage:** Called automatically during lighter creation

---

#### `create_new_lighter(lighter_name text, background_url text, show_username boolean) → uuid`
**Purpose:** Create a single lighter with auto-generated PIN

**Parameters:**
- `lighter_name`: Display name (1-50 chars)
- `background_url`: Custom background image URL (optional)
- `show_username`: Display saver's username publicly

**Returns:** UUID of created lighter

**Business Logic:**
- Generates random PIN
- Ensures PIN uniqueness (retry loop)
- Associates with authenticated user
- Returns lighter ID

---

#### `create_bulk_lighters(p_user_id uuid, p_lighter_data jsonb) → TABLE(lighter_id uuid, lighter_name text, pin_code text, background_color text)`
**Purpose:** Create multiple lighters for sticker orders

**Parameters:**
- `p_user_id`: User creating lighters
- `p_lighter_data`: JSONB array of lighter configurations

**Returns:** Table of created lighters with PIN codes

**Business Logic:**
- Validates user authentication
- Loops through lighter data array
- Creates each lighter with unique PIN
- Automatically checks for trophy unlocks
- Used by sticker order processing

---

#### `get_lighter_id_from_pin(pin_to_check text) → uuid`
**Purpose:** Look up lighter by PIN code

**Parameters:**
- `pin_to_check`: PIN code (XXX-XXX format)

**Returns:** Lighter UUID or NULL

**Usage:** PIN verification and navigation

---

### 4.2 Post Management Functions

#### `create_new_post(...) → json`
**Purpose:** Create a new post on a lighter (overloaded function - 2 signatures)

**Parameters (12-param version):**
- `p_lighter_id`: Target lighter UUID
- `p_post_type`: text | image | song | location | refuel
- `p_title`: Post title (optional, max 200 chars)
- `p_content_text`: Text content (max 5000 chars)
- `p_content_url`: URL for images/songs
- `p_location_name`: Location name
- `p_location_lat`: Latitude
- `p_location_lng`: Longitude
- `p_is_find_location`: Mark as discovery location
- `p_is_creation`: Mark as first post
- `p_is_anonymous`: Hide author identity
- `p_is_public`: Public vs private post

**Returns:** JSON with success status and post_id

**Business Logic:**
- Validates lighter exists
- Creates post record
- Associates with authenticated user
- Returns confirmation

---

#### `get_random_public_posts(limit_count integer) → TABLE(...)`
**Purpose:** Fetch random public posts for homepage mosaic

**Parameters:**
- `limit_count`: Number of posts to return

**Returns:** Table with full post details including:
- Post data
- Username (or 'Anonymous')
- Like count
- User's like status
- Nationality (if public)
- Flag status

**Business Logic:**
- Filters: is_public = true, is_flagged = false
- Randomized order
- Includes computed fields (like_count, user_has_liked)

---

### 4.3 Interaction Functions

#### `toggle_like(post_to_like_id bigint) → void`
**Purpose:** Toggle like status on a post

**Parameters:**
- `post_to_like_id`: Post to like/unlike

**Business Logic:**
- If like exists: DELETE (unlike)
- If like doesn't exist: INSERT (like)
- Triggers trophy checks for post owner

**Security:** Uses auth.uid() for user identification

---

#### `flag_post(post_to_flag_id bigint) → void`
**Purpose:** Flag a post as inappropriate

**Parameters:**
- `post_to_flag_id`: Post to flag

**Business Logic:**
- Validates user authentication
- Inserts flag record (ON CONFLICT DO NOTHING)
- Triggers increment of flag counter
- Auto-flags post at 3 flags

---

#### `unflag_post(post_to_unflag_id bigint) → void`
**Purpose:** Remove all flags from a post (moderator action)

**Authorization:** Requires moderator or admin role

**Business Logic:**
- Checks user role
- Deletes all flag records
- Resets flag counter
- Sets is_flagged = false

---

### 4.4 Trophy System Functions

#### `check_user_trophy_eligibility(user_id_param uuid) → TABLE(trophy_id integer, trophy_name text, is_earned boolean, is_eligible boolean)`
**Purpose:** Check which trophies user has earned and is eligible for

**Returns:** All trophies with earned and eligibility status

**Business Logic:**
- Counts user's stats (lighters, posts, countries, likes, etc.)
- Evaluates each trophy's conditions
- Returns complete trophy status matrix

---

#### `auto_grant_trophies(user_id_param uuid) → TABLE(granted_trophy_id integer, newly_granted boolean)`
**Purpose:** Automatically grant eligible trophies to user

**Returns:** List of trophies granted

**Business Logic:**
- Calls check_user_trophy_eligibility
- Filters for eligible but not earned
- Inserts into user_trophies (ON CONFLICT DO NOTHING)
- Returns newly granted trophies

---

#### `grant_trophy(user_to_grant_id uuid, trophy_to_grant_id integer) → void`
**Purpose:** Manually grant a specific trophy

**Business Logic:**
- Simple INSERT with conflict handling
- Used by backfill and admin operations

---

#### `backfill_all_trophies() → text`
**Purpose:** Retroactively grant trophies to all users

**Returns:** Success message

**Business Logic:**
- Loops through all profiles
- Calculates stats for each user
- Grants appropriate trophies
- Used for migration or trophy system updates

---

### 4.5 Order Management Functions

#### `create_order_with_shipping(...) → uuid`
**Purpose:** Create order with complete shipping information

**Parameters:** (13 parameters)
- User ID
- Stripe payment intent ID
- Customer email
- Pack size
- Amount in cents
- Currency
- Design snapshot (JSONB)
- Shipping name, email, address, city, postal code, country

**Returns:** Order UUID

**Business Logic:**
- Creates order in 'pending' status
- Payment status = 'succeeded'
- Stores all shipping details
- Used by checkout completion

---

### 4.6 Moderation Functions

#### `get_moderation_queue_data(...) → TABLE(...)`
**Purpose:** Retrieve moderation queue for admin dashboard

**Authorization:** Requires 'admin' or 'moderator' role (via JWT app_role)

**Parameters:**
- `p_status`: Filter by status (optional)
- `p_severity`: Filter by severity (optional)
- `p_limit`: Result limit (default 50)
- `p_offset`: Pagination offset (default 0)

**Returns:** Full moderation queue details with user emails

**Security:** Search path secured to prevent SQL injection

---

#### `get_moderation_stats(p_time_period interval) → TABLE(...)`
**Purpose:** Get moderation statistics for time period

**Parameters:**
- `p_time_period`: Time window (default 7 days)

**Returns:**
- Total flagged
- Pending review count
- Approved/rejected counts
- Severity distribution
- Most common category
- Average review time

---

#### `log_moderation_result(...) → uuid`
**Purpose:** Log result from OpenAI moderation API

**Parameters:**
- User ID
- Content type
- Content text
- Content URL
- Post/Lighter IDs
- Flagged boolean
- Categories (JSONB)
- Scores (JSONB)
- Severity

**Returns:** Moderation queue record ID

**Business Logic:**
- Creates moderation queue entry
- Status = 'pending' if flagged, else 'approved'
- Stores OpenAI response data

---

#### `delete_post_by_moderator(post_id_to_delete bigint) → void`
**Purpose:** Allow moderators to delete posts

**Business Logic:**
- Simple DELETE operation
- RLS policies ensure only moderators can execute

---

#### `reinstate_post(post_id_to_reinstate bigint) → void`
**Purpose:** Un-flag a post after review

**Business Logic:**
- Sets is_flagged = false
- Post becomes visible again

---

### 4.7 User & Stats Functions

#### `get_my_role() → text`
**Purpose:** Get current user's role

**Returns:** 'user' | 'moderator' | 'admin' | NULL

**Business Logic:**
- Queries profiles table for auth.uid()

---

#### `get_my_stats() → json`
**Purpose:** Get current user's activity statistics

**Returns:** JSON object with:
- `total_contributions`: Post count
- `lighters_saved`: Lighter count
- `lighters_contributed_to`: Unique lighter count
- `likes_received`: Total likes on user's posts

---

#### `is_admin() → boolean`
**Purpose:** Check if current user is admin

**Returns:** TRUE if admin role, else FALSE

---

#### `is_moderator_or_admin() → boolean`
**Purpose:** Check if current user has moderation privileges

**Returns:** TRUE if moderator or admin, else FALSE

---

#### `calculate_distance(lat1 float8, lon1 float8, lat2 float8, lon2 float8) → float8`
**Purpose:** Calculate distance between two GPS coordinates

**Algorithm:** Haversine formula
**Returns:** Distance in kilometers
**Usage:** Track lighter travel distance

---

### 4.8 Admin Functions

#### `get_orders_data(...) → TABLE(...)`
**Purpose:** Retrieve order data for admin dashboard

**Authorization:** Requires 'admin' role (via JWT app_role)

**Parameters:**
- `p_status`: Filter by order status
- `p_limit`: Result limit (default 50)
- `p_offset`: Pagination offset

**Returns:** Full order details with user emails, lighter names, time ago

**Security:** Search path secured

---

#### `get_order_analytics(p_time_period interval) → TABLE(...)`
**Purpose:** Get order analytics for time period

**Returns:**
- Total orders
- Completed orders
- Failed orders
- Total revenue
- Average order value
- Most popular pack size
- Completion rate

---

## 5. Database Views

### 5.1 detailed_posts

**Purpose:** Denormalized view combining posts with user and lighter data

**Columns:**
- All post columns
- Username (from profiles)
- Nationality, show_nationality, role (from profiles)
- Lighter name (from lighters)
- `likes_count`: Aggregated like count
- `user_has_liked`: Boolean for current user's like status

**Usage:**
- Homepage mosaic
- Lighter page post display
- Reduces join complexity in queries

**Performance:** View materializes joins between posts, profiles, lighters, and likes

---

## 6. Triggers

### 6.1 User Management Triggers

#### `handle_new_user`
**Table:** auth.users
**Timing:** AFTER INSERT
**Function:** `handle_new_user()`

**Purpose:** Auto-create profile when user signs up

**Actions:**
- Inserts record into profiles table
- Sets username from metadata or email
- Initializes level = 1, points = 0
- Handles unique constraint violations gracefully

---

### 6.2 Trophy System Triggers

#### `auto_grant_trophies_on_lighter`
**Table:** lighters
**Timing:** AFTER INSERT
**Function:** `trigger_trophy_check_on_lighter()`

**Purpose:** Grant trophies when lighter is created

**Actions:**
- Calls auto_grant_trophies() for saver_id
- Checks for "First LightSaver" and "Collection Starter"

---

#### `auto_grant_trophies_on_post`
**Table:** posts
**Timing:** AFTER INSERT
**Function:** `trigger_trophy_check_on_post()`

**Purpose:** Grant trophies when post is created

**Actions:**
- Calls auto_grant_trophies() for user_id
- Checks for storytelling trophies

---

#### `auto_grant_trophies_on_like`
**Table:** likes
**Timing:** AFTER INSERT
**Function:** `trigger_trophy_check_on_like()`

**Purpose:** Grant trophies when post receives like

**Actions:**
- Gets post owner's user_id
- Calls auto_grant_trophies() for post owner
- Checks for "Popular" trophy

---

### 6.3 Timestamp Triggers

#### `lighters_update_timestamp`
**Table:** lighters
**Timing:** BEFORE UPDATE
**Function:** `update_lighters_updated_at()`

**Purpose:** Auto-update updated_at column

---

#### `orders_update_timestamp`
**Table:** orders
**Timing:** BEFORE UPDATE
**Function:** `update_orders_updated_at()`

**Purpose:** Auto-update updated_at column

---

#### `moderation_queue_update_timestamp`
**Table:** moderation_queue
**Timing:** BEFORE UPDATE
**Function:** `update_moderation_queue_updated_at()`

**Purpose:** Auto-update updated_at column

---

### 6.4 Flagging Trigger

#### `increment_post_flag_count` (implicit via function call)
**Triggered by:** INSERT on post_flags

**Purpose:** Update post flag count and auto-flag at threshold

**Actions:**
- Increments posts.flagged_count
- If count ≥ 3: Sets posts.is_flagged = true

---

## 7. Row Level Security (RLS) Policies

### 7.1 profiles

**RLS Enabled:** Yes

| Policy Name | Command | Roles | Using | With Check |
|-------------|---------|-------|-------|------------|
| Allow public read access to profiles | SELECT | public | TRUE | - |
| Users can update own profile | UPDATE | authenticated | id = auth.uid() | - |

**Security Model:**
- All profiles publicly readable
- Users can only update their own profile
- No INSERT policy (handled by trigger)
- No DELETE policy

---

### 7.2 lighters

**RLS Enabled:** Yes

| Policy Name | Command | Roles | Using | With Check |
|-------------|---------|-------|-------|------------|
| Allow public read access to lighters | SELECT | public | TRUE | - |
| Allow logged-in users to create lighters | INSERT | authenticated | - | auth.uid() IS NOT NULL |
| Allow LightSavers to update their own lighters | UPDATE | authenticated | saver_id = auth.uid() | - |

**Security Model:**
- All lighters publicly readable
- Any authenticated user can create lighter
- Only saver can update their lighter
- No DELETE policy

---

### 7.3 posts

**RLS Enabled:** Yes

| Policy Name | Command | Roles | Using | With Check |
|-------------|---------|-------|-------|------------|
| Allow public read access to posts | SELECT | public | TRUE | - |
| Allow logged-in users to create posts | INSERT | authenticated | - | auth.uid() IS NOT NULL |
| Users can update own posts | UPDATE | authenticated | user_id = auth.uid() | - |
| Allow users to delete their own posts | DELETE | authenticated | user_id = auth.uid() | - |

**Security Model:**
- All posts publicly readable
- Any authenticated user can create posts
- Users can update/delete only their own posts

---

### 7.4 likes

**RLS Enabled:** Yes

| Policy Name | Command | Roles | Using | With Check |
|-------------|---------|-------|-------|------------|
| likes_read_policy | SELECT | public | TRUE | - |
| likes_write_policy | ALL | authenticated | user_id = auth.uid() | user_id = auth.uid() |

**Security Model:**
- All likes publicly visible
- Users can only create/delete their own likes

**Performance Issue:** Multiple permissive policies for same role/action (detected by advisor)

---

### 7.5 lighter_contributions

**RLS Enabled:** Yes

| Policy Name | Command | Roles | Using | With Check |
|-------------|---------|-------|-------|------------|
| Allow users to manage their own contributions | ALL | authenticated | user_id = auth.uid() | user_id = auth.uid() |

**Security Model:**
- Users can only see and manage their own contributions

---

### 7.6 trophies

**RLS Enabled:** Yes

| Policy Name | Command | Roles | Using | With Check |
|-------------|---------|-------|-------|------------|
| Allow public read access to trophies | SELECT | public | TRUE | - |

**Security Model:**
- Read-only reference table
- No modification policies

---

### 7.7 user_trophies

**RLS Enabled:** Yes

| Policy Name | Command | Roles | Using | With Check |
|-------------|---------|-------|-------|------------|
| Allow public read access to user_trophies | SELECT | public | TRUE | - |

**Security Model:**
- All earned trophies publicly visible
- No user modification (managed by functions)

---

### 7.8 orders

**RLS Enabled:** Yes

| Policy Name | Command | Roles | Using | With Check |
|-------------|---------|-------|-------|------------|
| orders_view_policy | SELECT | authenticated | user_id = auth.uid() | - |
| orders_insert_policy | INSERT | authenticated | - | TRUE |
| orders_update_policy | UPDATE | authenticated | user_id = auth.uid() | - |

**Security Model:**
- Users can only view their own orders
- Any authenticated user can create orders
- Users can update their own orders
- Admin access via dedicated function (bypasses RLS)

---

### 7.9 moderation_queue

**RLS Enabled:** Yes

| Policy Name | Command | Roles | Using | With Check |
|-------------|---------|-------|-------|------------|
| moderation_queue_view_policy | SELECT | authenticated | Has moderator/admin role | - |
| moderation_queue_insert_policy | INSERT | authenticated | - | TRUE |
| moderation_queue_update_policy | UPDATE | authenticated | Has moderator/admin role | - |
| moderation_queue_delete_policy | DELETE | authenticated | Has moderator/admin role | - |

**Security Model:**
- Only moderators/admins can view, update, delete
- Any authenticated user can insert (for moderation checks)
- Role check: `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))`

---

### 7.10 post_flags

**RLS Enabled:** Yes

| Policy Name | Command | Roles | Using | With Check |
|-------------|---------|-------|-------|------------|
| Users can see their own flags | SELECT | authenticated | user_id = auth.uid() | - |
| Moderators can see all flags | SELECT | authenticated | Has moderator/admin role | - |
| Users can flag posts | INSERT | authenticated | - | user_id = auth.uid() |

**Security Model:**
- Users see only their own flags
- Moderators see all flags
- Only can flag with own user_id

**Performance Issue:** Multiple permissive policies for same role/action (detected by advisor)

---

### 7.11 webhook_events

**RLS Enabled:** Yes

| Policy Name | Command | Roles | Using | With Check |
|-------------|---------|-------|-------|------------|
| No public access to webhook events | ALL | public | FALSE | - |

**Security Model:**
- Completely locked down
- Only accessible via service role

---

## 8. Indexes

### 8.1 Performance Indexes

**Frequently Queried Columns:**
- `pin_code` lookups: `idx_lighters_pin_code` (btree)
- Post timeline queries: `idx_posts_created_at` (btree DESC)
- User's lighters: `idx_lighters_saver_id` (btree)
- Lighter's posts: `idx_posts_lighter_id` (btree)
- User's posts: `idx_posts_user_id` (btree)

### 8.2 Partial Indexes

**Optimized for Common Filters:**
- `idx_lighters_is_retired` - WHERE is_retired = false
- `idx_posts_is_pinned` - WHERE is_pinned = true
- `idx_moderation_queue_status` - WHERE status ≠ 'approved'
- `idx_moderation_queue_flagged` - WHERE flagged = true
- `idx_orders_completed_at` - WHERE completed_at IS NOT NULL

### 8.3 Composite Indexes

**Primary Keys (Natural Composites):**
- `likes_pkey` (user_id, post_id)
- `lighter_contributions_pkey` (user_id, lighter_id)
- `user_trophies_pkey` (user_id, trophy_id)
- `post_flags_pkey` (user_id, post_id)

### 8.4 Unique Indexes

**Enforcing Uniqueness:**
- `profiles_username_key` (username)
- `lighters_pin_code_key` (pin_code)
- `orders_stripe_payment_intent_id_key` (stripe_payment_intent_id)

### 8.5 Index Usage Analysis

**Unused Indexes (Per Performance Advisor):**
35+ indexes reported as unused, including:
- Most moderation_queue indexes (0 items in table)
- Most orders indexes (0 orders)
- Several likes indexes (only 1 like)
- post_flags indexes (0 flags)

**Recommendation:** Monitor as data grows; consider removing if still unused after production load

---

## 9. Foreign Key Constraints

### 9.1 CASCADE DELETE Rules

**Tables with CASCADE:**
- `likes` → Deletes when post deleted
- `likes` → Deletes when user deleted
- `post_flags` → Deletes when post deleted
- `post_flags` → Deletes when user deleted
- `lighter_contributions` → Deletes when lighter or user deleted
- `user_trophies` → Deletes when user or trophy deleted
- `posts` → Deletes when lighter deleted

### 9.2 SET NULL Rules

**Tables with SET NULL:**
- `lighters.saver_id` → NULL when profile deleted (preserve lighter)
- `posts.user_id` → NULL when profile deleted (preserve post as "Anonymous")
- `orders.lighter_id` → NULL when lighter deleted (preserve order)
- `moderation_queue.post_id` → NULL when post deleted
- `moderation_queue.lighter_id` → NULL when lighter deleted

### 9.3 Referential Integrity

**All foreign keys enforce:**
- NO ACTION on UPDATE (prevent accidental key changes)
- Specified rule on DELETE
- Index on foreign key column for join performance

---

## 10. Storage Buckets

### 10.1 post-images Bucket

**Configuration:**
- **ID:** `post-images`
- **Public Access:** Yes (images served directly)
- **File Size Limit:** 2 MB (2,097,152 bytes)
- **Allowed MIME Types:**
  - image/jpeg
  - image/png
  - image/gif
  - image/webp
- **AVIF Auto-detection:** Disabled

**Usage:**
- User-uploaded images for image posts
- Accessed via `content_url` in posts table
- URL format: `https://{project}.supabase.co/storage/v1/object/public/post-images/{path}`

**Storage Policies:**
- Upload: Authenticated users only
- Read: Public access
- Delete: Object owner only

---

## 11. Migrations History

### 11.1 Applied Migrations

| Version | Name | Purpose |
|---------|------|---------|
| 20251104062904 | fix_toggle_like_ambiguous_user_id | Fixed ambiguous column reference in toggle_like |
| 20251104062924 | add_performance_indexes_and_fix_security | Added indexes, fixed security issues |
| 20251104072033 | fix_toggle_like_and_flag_functions | Fixed toggle functions for likes and flags |
| 20251105115903 | fix_function_search_paths_security | Secured function search paths against injection |
| 20251105115920 | fix_insert_policies_for_service_role | Fixed RLS policies for service role |
| 20251105180830 | add_webhook_idempotency_table | Added webhook_events table |
| 20251105180854 | add_content_length_constraints | Added length constraints to content fields |

### 11.2 Migration Strategy

**Approach:**
- All migrations tracked in auth.schema_migrations
- Forward-only migrations (no rollback)
- Schema changes deployed before code changes
- RPC functions use `OR REPLACE` for safe updates

---

## 12. Security & Performance Analysis

### 12.1 Security Advisors Report

#### Critical Issues: 0

#### Warnings: 1

**1. Leaked Password Protection Disabled**
- **Severity:** WARN
- **Category:** SECURITY
- **Issue:** Auth leaked password protection not enabled
- **Impact:** Users can set passwords that appear in breach databases
- **Remediation:** Enable HaveIBeenPwned integration in Supabase Auth settings
- **URL:** https://supabase.com/docs/guides/auth/password-security

### 12.2 Performance Advisors Report

#### Critical Issues: 0

#### Warnings: 1

**Multiple Permissive Policies**
- **Tables Affected:**
  - `likes` (2 policies for SELECT)
  - `post_flags` (2 policies for SELECT)
- **Impact:** Each policy evaluated separately, performance overhead
- **Recommendation:** Combine policies with OR logic
- **Current:**
  ```sql
  -- Policy 1: Public read
  CREATE POLICY "likes_read_policy" ON likes FOR SELECT TO public USING (true);
  -- Policy 2: User writes
  CREATE POLICY "likes_write_policy" ON likes FOR ALL TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  ```
- **Recommended:**
  ```sql
  -- Single policy with OR conditions
  CREATE POLICY "likes_policy" ON likes FOR SELECT
    USING (true OR user_id = auth.uid());
  ```

#### Info: 37 Unused Indexes

Most unused indexes are on tables with 0 or very few rows:
- `moderation_queue` - 0 rows, 10 unused indexes
- `orders` - 0 rows, 9 unused indexes
- `post_flags` - 0 rows, 2 unused indexes
- `likes` - 1 row, 3 unused indexes

**Recommendation:** Monitor post-launch; remove if still unused after significant data volume

---

## 13. Conformity with Product Specification

### 13.1 Database Schema Alignment

#### ✅ Fully Conformant Areas

**User Management:**
- Profiles table matches user role requirements (user, moderator, admin)
- Authentication via Supabase Auth
- Username uniqueness enforced
- Nationality support with privacy flag

**Lighter System:**
- PIN code generation and uniqueness ✓
- Support for custom names and backgrounds ✓
- Tracking of creation date, posts count, refuel count ✓
- Show/hide saver username option ✓
- Sticker language support ✓

**Post System:**
- All 5 post types supported (text, image, song, location, refuel) ✓
- Character limits match spec (title 200, content 5000) ✓
- Public/private posts ✓
- Anonymous posting ✓
- Flagging system with 3-flag threshold ✓
- Like system ✓

**Trophy System:**
- 10 trophy types match criteria in spec ✓
- Auto-granting via triggers ✓
- Trophy eligibility checking ✓

**Moderation:**
- OpenAI moderation integration ✓
- Manual review queue ✓
- Moderator/admin roles ✓
- Flag tracking ✓

**Orders:**
- Stripe payment integration ✓
- Shipping address collection ✓
- Order status tracking ✓
- Refund support ✓

#### ⚠️ Discrepancies Found

**1. Pack Sizes Mismatch**
- **Database Constraint:** `CHECK (pack_size IN (5, 10, 25, 50))`
- **Product Spec:** 10, 20, 50 stickers
- **Impact:** Database allows 5 and 25, but product flow uses 10, 20, 50
- **Recommendation:** Update constraint to `CHECK (pack_size IN (10, 20, 50))`
- **Location:** orders table, pack_size column

**2. Sticker Language Constraint**
- **Database Constraint:** `CHECK (sticker_language IN ('en', 'fr', 'es', 'de', 'it', 'pt'))`
- **Product Spec:** 27 languages supported
- **Current Limitation:** Only 6 languages allowed for stickers
- **Impact:** Users can select 27 languages in UI, but only 6 will save successfully
- **Recommendation:** Either:
  - Expand constraint to all 27 languages
  - Update UI to show only 6 languages for sticker selection
- **Location:** lighters table, sticker_language column

**3. Orders Table Foreign Key**
- **Database:** `lighter_id` FK to lighters.id (optional)
- **Product Spec:** Orders contain multiple lighters (bulk creation)
- **Current Design:** One order → many lighters (created via process-sticker-order API)
- **Gap:** No direct link from lighters back to originating order
- **Impact:** Cannot query "which order created this lighter?"
- **Status:** Acceptable - design_snapshot in orders stores details
- **Consideration:** Add `order_id` to lighters if historical tracking needed

### 13.2 Missing Database Features

#### Optional Enhancements Not Yet Implemented

**1. 24-Hour Cooldown Enforcement**
- **Status:** Implemented in application code, not database constraint
- **Current:** `lighter_contributions.last_post_at` tracked
- **Gap:** No CHECK constraint or trigger preventing posts within 24 hours
- **Recommendation:** Consider adding trigger to enforce at database level
- **Risk:** Low - application handles this correctly

**2. Distance Tracking**
- **Status:** Column exists (`lighters.total_distance`) but not calculated
- **Function:** `calculate_distance()` exists but not integrated
- **Gap:** No automatic distance calculation between location posts
- **Recommendation:** Add trigger to calculate distance on location post INSERT
- **Priority:** Low - feature not prominent in product spec

**3. Post Count on Lighters**
- **Status:** Calculated via COUNT query, not denormalized
- **Gap:** No `post_count` column on lighters table
- **Impact:** Requires JOIN for every lighter card display
- **Recommendation:** Add cached column with trigger for performance
- **Priority:** Medium - affects homepage and profile performance

### 13.3 RPC Function Coverage

#### API Endpoints → Database Functions Mapping

| API Endpoint | Database Function | Status |
|--------------|-------------------|--------|
| POST /api/create-lighter | create_new_lighter() | ✅ |
| POST /api/create-post | create_new_post() | ✅ |
| POST /api/process-sticker-order | create_bulk_lighters() | ✅ |
| GET /api/get-random-posts | get_random_public_posts() | ✅ |
| POST /api/toggle-like | toggle_like() | ✅ |
| POST /api/flag-post | flag_post() | ✅ |
| GET /api/admin/orders | get_orders_data() | ✅ |
| GET /api/admin/moderation | get_moderation_queue_data() | ✅ |
| POST /api/moderate-content | log_moderation_result() | ✅ |

**Coverage:** 100% of product spec API endpoints have corresponding database functions

### 13.4 Security Conformance

#### Authentication Requirements

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Anonymous users can view public content | RLS policies allow public SELECT | ✅ |
| Auth required to create content | RLS policies check auth.uid() | ✅ |
| Users can only edit own content | RLS policies check user_id = auth.uid() | ✅ |
| Moderators can review flagged content | RLS policies check role column | ✅ |
| Admins can access all data | Dedicated RPC functions with role check | ✅ |

#### Content Safety

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| All content passes moderation | log_moderation_result() called | ✅ |
| Flagged content hidden | posts.is_flagged checked in queries | ✅ |
| 3-flag auto-hide threshold | increment_post_flag_count trigger | ✅ |
| Moderator review required | moderation_queue table | ✅ |

### 13.5 Data Integrity

#### Constraints Verification

| Data Rule | Database Enforcement | Status |
|-----------|---------------------|--------|
| PIN codes unique | UNIQUE constraint + index | ✅ |
| Username unique | UNIQUE constraint + index | ✅ |
| Stripe payment IDs unique | UNIQUE constraint | ✅ |
| One like per user per post | Composite PRIMARY KEY | ✅ |
| One flag per user per post | Composite PRIMARY KEY | ✅ |
| Post type validation | CHECK constraint | ✅ |
| Content length limits | CHECK constraints | ✅ |
| Order status validation | CHECK constraint | ✅ |

### 13.6 Performance Considerations

#### Indexing for Product Flows

| User Flow | Required Query | Index Support | Status |
|-----------|----------------|---------------|--------|
| Find lighter by PIN | WHERE pin_code = ? | idx_lighters_pin_code | ✅ |
| View lighter page | WHERE lighter_id = ? + posts JOIN | idx_posts_lighter_id | ✅ |
| User profile | WHERE saver_id = ? | idx_lighters_saver_id | ✅ |
| Homepage mosaic | ORDER BY random() LIMIT 4 | None (small result set) | ✅ |
| Post timeline | ORDER BY created_at DESC | idx_posts_created_at | ✅ |
| Admin orders | WHERE user_id = ? ORDER BY created_at | idx_orders_user_id, idx_orders_created_at | ✅ |
| Moderation queue | WHERE status = ? AND severity = ? | idx_moderation_queue_status, idx_moderation_queue_severity | ✅ |

**Coverage:** All critical user flows have supporting indexes

### 13.7 Missing Features from Database Perspective

**1. User Points/Levels System**
- **Status:** Columns exist (`profiles.level`, `profiles.points`) but not used
- **Product Spec:** Mentions trophy system, not points/levels
- **Recommendation:** Either implement points calculation or remove columns

**2. Lighter Retirement Logic**
- **Status:** `is_retired` column exists but no transition rules
- **Gap:** No documented retirement criteria or trigger
- **Product Spec:** Not explicitly mentioned
- **Recommendation:** Document retirement business rules or remove column

**3. Custom Background Storage**
- **Status:** `custom_background_url` column exists
- **Gap:** No storage bucket or upload flow implemented
- **Product Spec:** Mentions "background color" but not custom images
- **Status:** Acceptable - simplified to color picker only

### 13.8 Recommendations Summary

#### High Priority

1. **Fix pack_size constraint** - Update to match product spec (10, 20, 50)
2. **Resolve sticker language constraint** - Align with 27-language support
3. **Enable leaked password protection** - Address security warning

#### Medium Priority

4. **Combine duplicate RLS policies** - Performance improvement for likes/flags tables
5. **Add post_count cache column** - Improve lighter card rendering performance
6. **Document 24-hour cooldown logic** - Consider database-level enforcement

#### Low Priority

7. **Clean up unused columns** - Remove points/level if not implementing
8. **Monitor unused indexes** - Remove if still unused after production data
9. **Implement distance tracking** - Activate calculate_distance() function
10. **Add order_id to lighters** - Enable order history queries

---

## Appendix A: Database Statistics

### Row Counts (Current State)
```
profiles:               13 rows
lighters:               15 rows
posts:                 207 rows
likes:                   1 row
lighter_contributions: 166 rows
trophies:               10 rows (reference)
user_trophies:          60 rows
orders:                  0 rows
moderation_queue:        0 rows
post_flags:              0 rows
webhook_events:          0 rows
```

### Index Count: 61 indexes
### Function Count: 44 functions
### Trigger Count: 6 triggers
### RLS Policy Count: 26 policies
### Foreign Key Count: 14 constraints

---

## Appendix B: Quick Reference Queries

### Find Lighter by PIN
```sql
SELECT * FROM lighters WHERE pin_code = 'ABC-123';
```

### Get User's Lighters
```sql
SELECT * FROM lighters WHERE saver_id = '{user_id}' ORDER BY created_at DESC;
```

### Get Lighter's Posts
```sql
SELECT * FROM detailed_posts WHERE lighter_id = '{lighter_id}' ORDER BY created_at DESC;
```

### Check Trophy Eligibility
```sql
SELECT * FROM check_user_trophy_eligibility('{user_id}');
```

### Get Random Public Posts
```sql
SELECT * FROM get_random_public_posts(8);
```

### Admin: Get Pending Moderation
```sql
SELECT * FROM get_moderation_queue_data('pending', NULL, 50, 0);
```

---

**End of Database Specification**
