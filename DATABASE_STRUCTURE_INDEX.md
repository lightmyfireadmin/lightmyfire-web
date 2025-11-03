# LightMyFire Database Structure - Complete Index

**Last Updated:** November 3, 2025
**Database:** Supabase (PostgreSQL)
**Project:** lightmyfire-web

---

## Quick Navigation

- **[Full Audit Report](#comprehensive-audit-report)** - Detailed analysis of all schema
- **[Existing Tables](#existing-tables-summary)** - 5 core tables with columns
- **[RPC Functions](#rpc-functions-reference)** - 13 existing functions
- **[Planned Migrations](#planned-migrations)** - 2 new tables pending
- **[Missing Components](#missing-components-status)** - Features to complete
- **[File Locations](#file-reference)** - Where everything is

---

## Comprehensive Audit Report

**Full Document:** `/Users/utilisateur/Desktop/LMFNEW/lightmyfire-web/COMPREHENSIVE_DATABASE_SCHEMA_AUDIT.md`

Contains:
- Complete table schemas with all columns, types, constraints
- All 13 RPC function signatures and behaviors
- RLS policy mappings for all tables
- Index listings and performance notes
- Detailed migration documentation
- Component completion percentages
- Next steps and timeline estimates

---

## Existing Tables Summary

### 1. profiles (User Accounts)
**Status:** Fully implemented and active
**Columns:** 8 (id, username, nationality, show_nationality, created_at, level, points, role)
**Constraints:** PK on id (FK to auth.users), UNIQUE on username
**RLS:** Enabled - 4 policies (SELECT all, INSERT/UPDATE/DELETE own)
**Triggers:** on_auth_user_created (auto-creates profile on signup)

### 2. posts (User Contributions)
**Status:** Fully implemented and active
**Columns:** 18 (including post_type, is_creation, is_anonymous, is_public, is_flagged, flagged_count)
**Constraints:** BIGINT PK, FK to profiles(id) and lighters(id)
**RLS:** Enabled - 4 policies (SELECT public/non-flagged, INSERT/UPDATE/DELETE own)
**Post Types:** text, song, image, location, refuel

### 3. lighters (Lighter Designs)
**Status:** Partially implemented (4 columns planned but not yet added)
**Current Columns:** 7 (id, saver_id, name, pin_code, custom_background_url, show_saver_username, created_at)
**Planned Additions:** background_color, sticker_language, sticker_design_version, updated_at
**Constraints:** UUID PK, FK to profiles(id), UNIQUE on pin_code
**RLS:** Enabled - 4 policies (SELECT all, INSERT/UPDATE/DELETE saver only)

### 4. likes (Post Engagement)
**Status:** Fully implemented and active
**Columns:** 4 (id, post_id, user_id, created_at)
**Constraints:** UUID PK, FK to posts and profiles, UNIQUE COMPOSITE (post_id, user_id)
**RLS:** Enabled - 3 policies (SELECT all, INSERT own, DELETE own)

### 5. user_trophies (Gamification)
**Status:** Fully implemented and active
**Columns:** 4 (id, user_id, trophy_id, granted_at, created_at)
**Trophy IDs:** 1=First Lighter, 2=First Contribution, 3=First Creation, 4=Lighter Explorer, 5=Refuel Master
**Constraints:** UUID PK, FK to profiles(id), UNIQUE COMPOSITE (user_id, trophy_id)
**RLS:** Enabled - SELECT policy

### 6. detailed_posts (Performance View)
**Status:** Fully implemented and active
**Type:** View (pre-joined query)
**Purpose:** Feed performance optimization
**Joins:** posts + profiles + lighters with like_count subquery
**Filters:** WHERE is_flagged = FALSE

---

## RPC Functions Reference

### Post Management (5 functions)

**1. create_new_post()** - 2 overloads
```
Overload A: (lighter_id, post_type, title, content_text, content_url, location_name, location_lat, location_lng, is_find_location, is_creation, is_anonymous, is_public)
Overload B: (user_id, lighter_id, post_type, title, content_text, content_url, location_name, location_lat, location_lng, is_find_location, is_creation, is_anonymous, is_public)
Returns: json {success, post_id, message}
```

**2. toggle_like()** - 2 overloads
```
Overload A: (post_id: uuid) -> json {action, post_id, success}
Overload B: (post_to_like_id: bigint) -> void
```

**3. flag_post(bigint)** - Increment flag counter
```
Purpose: User reporting/flagging content
Returns: void
Security: SECURITY DEFINER
```

**4. delete_post_by_moderator(bigint)** - Admin deletion
```
Purpose: Remove flagged/violating content
Returns: void
Security: SECURITY DEFINER
```

**5. reinstate_post(bigint)** - Remove moderation flag
```
Purpose: Approve flagged content
Returns: void
Security: SECURITY DEFINER
```

### Lighter Management (3 functions)

**6. create_new_lighter(text, text, boolean)** -> uuid
```
Creates new lighter with auto-generated PIN code
Parameters: lighter_name, background_url, show_username
Returns: New lighter UUID
```

**7. get_lighter_id_from_pin(text)** -> uuid
```
Converts PIN code to lighter UUID
Purpose: Link access via PIN to lighter page
```

**8. generate_random_pin()** -> text
```
Generates ABC-123 format PIN
Used by create_new_lighter()
```

### User Stats & Gamification (3 functions)

**9. get_my_stats()** -> json
```
Returns user contribution statistics
Structure: {total_contributions, lighters_saved, lighters_contributed_to, likes_received}
```

**10. grant_trophy(uuid, integer)** -> void
```
Awards trophy to user
Parameters: user_id, trophy_id
Behavior: ON CONFLICT DO NOTHING
```

**11. backfill_all_trophies()** -> text
```
Bulk grant trophies based on achievements
Trophy 1: If lighters >= 1
Trophy 2: If posts >= 1
Trophy 3: If creations >= 1
Trophy 4: If distinct lighters >= 5
Trophy 5: If refuel posts >= 1
```

### Location & Feed (2 functions)

**12. calculate_distance()** -> double
```
Haversine formula: (lat1, lon1, lat2, lon2) -> kilometers
Purpose: Geo-based features
```

**13. get_random_public_posts(integer)** -> TABLE
```
Returns 23 columns including: id, lighter_id, user_id, post_type, title, content_text, content_url, location_name, location_lat, location_lng, is_find_location, is_creation, is_anonymous, is_pinned, username, like_count, user_has_liked, nationality, show_nationality, is_public, is_flagged, flagged_count
Filters: is_public = true AND is_flagged = false
Purpose: Randomized feed generation
```

**All functions:** SET search_path = public (security)

---

## Planned Migrations

### PENDING MIGRATION 1: moderation_queue Table

**Documentation:** `/MODERATION_SCHEMA.md`
**Status:** Documented, SQL provided, NOT YET EXECUTED
**Completion:** 0%

**Contains:**
- 1 new table with 17 columns
- 8 performance indexes
- 3 RLS policies
- 1 trigger function
- 1 RPC function: log_moderation_result()

**Key Columns:**
- id (UUID), user_id (FK), content_type, content, content_url
- flagged (BOOLEAN), categories (JSONB), scores (JSONB)
- severity (low/medium/high), status (pending/approved/rejected/under_review)
- review_notes, action_taken, reviewed_by, reviewed_at, created_at, updated_at

### PENDING MIGRATION 2: orders Table

**Documentation:** `/DATABASE_MIGRATION_GUIDE.md`
**Status:** Documented, SQL provided, NOT YET EXECUTED
**Completion:** 0%

**Contains:**
- 1 new table with 16 columns
- 7 performance indexes
- 2 RLS policies
- 1 trigger function
- 3 RPC functions:
  - create_order_from_payment()
  - update_order_payment_succeeded()
  - get_order_analytics()

**Key Columns:**
- id (UUID), user_id (FK), stripe_payment_intent_id, stripe_customer_email
- pack_size, amount_cents, currency, lighter_id
- design_snapshot (JSONB), status, payment_status
- shipped_at, tracking_number, created_at, updated_at, completed_at

### PENDING MIGRATION 3: lighters Table Enhancements

**Documentation:** `/DATABASE_MIGRATION_GUIDE.md`
**Status:** Documented, SQL provided, NOT YET EXECUTED
**Completion:** 0%

**ALTER TABLE additions:**
- background_color TEXT DEFAULT '#FF6B6B' (hex color for sticker)
- sticker_language TEXT DEFAULT 'en' (language for sticker text)
- sticker_design_version INTEGER DEFAULT 1 (track design changes)
- updated_at TIMESTAMP DEFAULT NOW() (auto-update trigger)

---

## Missing Components Status

### Content Moderation System
**Overall Completion: 40%**

**Implemented (4/8):**
- ✅ OpenAI API endpoints (moderate-text, moderate-image)
- ✅ useContentModeration React hook
- ✅ Moderation UI components
- ✅ MODERATION_SCHEMA.md documentation

**Missing (4/8):**
- ❌ moderation_queue table (migration pending)
- ❌ log_moderation_result() RPC function
- ❌ Database logging in endpoints
- ❌ Admin moderation dashboard

**Next Steps:**
1. Execute MODERATION_SCHEMA.md migration
2. Call log_moderation_result() from API endpoints
3. Build admin dashboard queries

---

### Payment Orders System
**Overall Completion: 30%**

**Implemented (3/8):**
- ✅ Stripe payment endpoint (create-payment-intent)
- ✅ StripePaymentForm component
- ✅ DATABASE_MIGRATION_GUIDE.md documentation

**Missing (5/8):**
- ❌ orders table (migration pending)
- ❌ Order creation RPC (create_order_from_payment)
- ❌ Payment confirmation RPC (update_order_payment_succeeded)
- ❌ Stripe webhook handler
- ❌ Admin order management dashboard

**Next Steps:**
1. Execute orders table migration
2. Call create_order_from_payment() from payment endpoint
3. Implement Stripe webhook handler
4. Build admin dashboard

---

### Sticker Design Persistence
**Overall Completion: 50%**

**Implemented (3/6):**
- ✅ Sticker PDF generation endpoint
- ✅ StickerDesign interface
- ✅ StickerPreview component

**Missing (3/6):**
- ❌ New lighters columns (background_color, sticker_language, sticker_design_version)
- ❌ Save design properties in SaveLighterFlow
- ❌ Retrieve design snapshot from orders
- ❌ Sticker regeneration endpoint

**Next Steps:**
1. Add columns to lighters table (alter table migration)
2. Update SaveLighterFlow to save color and language
3. Store design_snapshot in orders.design_snapshot
4. Create regeneration API endpoint

---

## RLS Policy Summary

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| profiles | YES | All users | Own only | Own only | Own only |
| posts | YES | Public/unflagged | Own only | Own only | Own only |
| likes | YES | All users | Own only | N/A | Own only |
| lighters | YES | All users | Own only | Saver only | Saver only |
| user_trophies | YES | All users | N/A | N/A | N/A |
| **moderation_queue** | PLANNED | Admins/mods+own | Disabled (API only) | Admins/mods | Admins/mods |
| **orders** | PLANNED | Own+admins | Disabled (API only) | Admins | Admins |

---

## File Reference

### SQL Migration Files (9 total)

**Existing Migrations:**
1. `/Users/utilisateur/Desktop/LMFNEW/lightmyfire-web/supabase/migrations/20251030120000_add_flag_count_trigger.sql` (14 lines)
2. `/Users/utilisateur/Desktop/LMFNEW/lightmyfire-web/supabase_migration_fix_all.sql` (393 lines - CRITICAL)
3. `/Users/utilisateur/Desktop/LMFNEW/lightmyfire-web/SUPABASE_SECURITY_FIX_FINAL_CORRECTED.sql` (558 lines - LATEST)

**Planned Migrations (In Documentation):**
4. MODERATION_SCHEMA.md - Copy SQL to Supabase editor
5. DATABASE_MIGRATION_GUIDE.md - Copy migration section to Supabase editor

**Diagnostic Scripts:**
6. SCHEMA_DISCOVERY.sql - For introspection only
7. TABLE_SCHEMA_NEEDED.sql - For column information

### Documentation Files (3 main)

1. **`COMPREHENSIVE_DATABASE_SCHEMA_AUDIT.md`** (This is the detailed reference)
   - Complete table schemas with column details
   - All function signatures and behaviors
   - RLS policy listings
   - Migration planning and timelines

2. **`MODERATION_SCHEMA.md`** (Moderation system)
   - Complete moderation_queue table definition
   - 8 indexes, 3 RLS policies, 1 function, 1 trigger
   - Ready to execute SQL
   - Query examples for dashboard

3. **`DATABASE_MIGRATION_GUIDE.md`** (Payment system)
   - Complete orders table definition
   - lighters table enhancements
   - 3 RPC functions with signatures
   - Data flow diagrams
   - Execution instructions

### API Endpoints (4 files)

1. `/app/api/moderate-text/route.ts` - OpenAI text moderation
2. `/app/api/moderate-image/route.ts` - OpenAI image moderation
3. `/app/api/create-payment-intent/route.ts` - Stripe payment creation
4. `/app/api/generate-sticker-pdf/route.ts` - Sticker sheet generation

### Frontend Components (Key files)

1. `/app/hooks/useContentModeration.ts` - Moderation logic hook
2. `/app/[locale]/moderation/` - Moderation dashboard UI
3. `/app/[locale]/save-lighter/StripePaymentForm.tsx` - Payment form
4. `/app/[locale]/save-lighter/StickerPreview.tsx` - Sticker preview

---

## Quick Start Guide

### For Developers New to This Project

1. **Read This File First** - You are here!
2. **Read COMPREHENSIVE_DATABASE_SCHEMA_AUDIT.md** - Detailed schema reference
3. **Check MODERATION_SCHEMA.md** - If working on moderation
4. **Check DATABASE_MIGRATION_GUIDE.md** - If working on payments

### To Execute Pending Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Copy relevant migration SQL from documentation files
3. Execute in order: lighters enhancements → moderation_queue → orders
4. Verify with provided verification queries

### To Add Logging to Moderation

1. Read `log_moderation_result()` signature in COMPREHENSIVE_DATABASE_SCHEMA_AUDIT.md
2. Update `/app/api/moderate-text/route.ts` to call the function
3. Update `/app/api/moderate-image/route.ts` to call the function
4. Test with sample content

### To Add Logging to Orders

1. Read `create_order_from_payment()` signature in DATABASE_MIGRATION_GUIDE.md
2. Update `/app/api/create-payment-intent/route.ts` to call the function
3. Implement Stripe webhook handler for payment confirmation
4. Test order creation flow

---

## Statistics

**Database Objects (Existing):**
- Tables: 5
- Views: 1
- RPC Functions: 13
- Triggers: 1
- RLS Policies: 18+
- Indexes: 15+

**Database Objects (Planned):**
- Tables: 2
- Functions: 5
- Views: 2
- Triggers: 3
- Indexes: 15
- RLS Policies: 5

**Documentation:**
- Total markdown files: 23
- Schema-specific docs: 3
- SQL migration files: 7
- Total lines of documentation: 2000+

**Code (Frontend):**
- API endpoints: 4
- Components: 20+
- Hooks: 3+

---

## Estimated Timeline to Completion

**Immediate (1-2 hours):**
- Execute pending migrations
- Verify table creation

**Short Term (2-4 hours):**
- Update API endpoints with RPC calls
- Implement Stripe webhook

**Medium Term (4-8 hours):**
- Build admin dashboards
- Add analytics functions

**Long Term (8-15 hours):**
- Sticker design persistence
- Comprehensive testing
- **Total: 15-30 developer hours**

---

## Support & Resources

- Supabase RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL Functions: https://www.postgresql.org/docs/current/sql-createfunction.html
- Stripe Webhooks: https://stripe.com/docs/webhooks
- OpenAI Moderation: https://platform.openai.com/docs/guides/moderation

---

**Last Updated:** November 3, 2025
**Next Review:** After migrations are executed
**Maintained By:** Development Team
