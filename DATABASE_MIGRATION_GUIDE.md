# LightMyFire Database Migration Guide

## Overview

This guide provides comprehensive instructions for executing the database migration that adds support for:
1. **Content Moderation System** - OpenAI moderation with audit trail
2. **Stripe Payment Integration** - Order tracking and payment management
3. **Sticker Design Persistence** - Save and regenerate sticker designs

## Migration Summary

### Changes by Component

#### 1. **lighters Table Enhancement** (4 new columns)
```sql
ALTER TABLE lighters ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#FF6B6B';
ALTER TABLE lighters ADD COLUMN IF NOT EXISTS sticker_language TEXT DEFAULT 'en';
ALTER TABLE lighters ADD COLUMN IF NOT EXISTS sticker_design_version INTEGER DEFAULT 1;
ALTER TABLE lighters ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

**Purpose:** Store sticker design properties so users can regenerate stickers with the same design later even if they modify the lighter.

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `background_color` | TEXT | #FF6B6B | Hex color for sticker background |
| `sticker_language` | TEXT | en | Language for sticker text (en, fr, es, de, it, pt) |
| `sticker_design_version` | INTEGER | 1 | Track design changes for regeneration |
| `updated_at` | TIMESTAMP | NOW() | Auto-updated on changes |

---

#### 2. **New Table: moderation_queue** (14 columns)
Comprehensive audit trail for all content moderation checks.

**Purpose:** Track all moderation results, severity levels, and admin actions for compliance and analytics.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User who created flagged content (FK to auth.users) |
| `content_type` | TEXT | Type: 'post', 'comment', 'lighter_name', 'profile', 'image' |
| `content` | TEXT | The actual content that was moderated |
| `content_url` | TEXT | Optional URL (for images) |
| `post_id` | BIGINT | Reference to posts table (nullable) |
| `lighter_id` | UUID | Reference to lighters table (nullable) |
| `flagged` | BOOLEAN | Whether OpenAI flagged the content |
| `categories` | JSONB | OpenAI categories: `{hate: false, harassment: true, ...}` |
| `scores` | JSONB | Confidence scores: `{hate: 0.05, harassment: 0.72, ...}` |
| `severity` | TEXT | low, medium, or high |
| `status` | TEXT | pending, approved, rejected, under_review |
| `review_notes` | TEXT | Admin notes |
| `action_taken` | TEXT | none, warning, content_removed, account_suspended |
| `reviewed_by` | UUID | Admin who reviewed (FK to auth.users) |
| `reviewed_at` | TIMESTAMP | When review happened |
| `created_at` | TIMESTAMP | When moderation check occurred |
| `updated_at` | TIMESTAMP | Last updated timestamp |

**Indexes (9 total):**
- `idx_moderation_queue_user_id` - Find all records for a user
- `idx_moderation_queue_post_id` - Link to specific posts
- `idx_moderation_queue_lighter_id` - Link to specific lighters
- `idx_moderation_queue_flagged` - Find only flagged content
- `idx_moderation_queue_status` - Filter by review status
- `idx_moderation_queue_severity` - Find high-severity content
- `idx_moderation_queue_content_type` - Group by content type
- `idx_moderation_queue_created_at` - Recent moderation checks

**RLS Policies:**
- **SELECT:** Admins/mods see all; users see only their own
- **INSERT:** Disabled (via RPC function only)
- **UPDATE:** Admins/mods only
- **DELETE:** Admins/mods only

---

#### 3. **New Table: orders** (14 columns)
Tracks all Stripe orders and sticker design snapshots.

**Purpose:** Complete order history, payment tracking, and design regeneration capability.

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Who placed the order (FK to auth.users) |
| `stripe_payment_intent_id` | TEXT | Unique Stripe reference (for webhooks) |
| `stripe_customer_email` | TEXT | Customer email at time of order |
| `pack_size` | INTEGER | 5, 10, 25, or 50 stickers |
| `amount_cents` | INTEGER | Amount in cents (€, $, £, ¥) |
| `currency` | TEXT | eur, usd, gbp, jpy |
| `lighter_id` | UUID | Which lighter design was ordered (nullable) |
| `design_snapshot` | JSONB | Design at order time: `{name, backgroundColor, pinCode, language}` |
| `status` | TEXT | pending, processing, completed, failed, refunded |
| `payment_status` | TEXT | Stripe payment status (requires_payment_method, succeeded, etc.) |
| `shipped_at` | TIMESTAMP | When package shipped |
| `tracking_number` | TEXT | Fulfillment tracking |
| `notes` | TEXT | Admin notes |
| `created_at` | TIMESTAMP | When order placed |
| `updated_at` | TIMESTAMP | Last update |
| `completed_at` | TIMESTAMP | When payment succeeded |

**Indexes (7 total):**
- `idx_orders_user_id` - Find user's orders
- `idx_orders_lighter_id` - Designs ordered
- `idx_orders_stripe_payment_intent` - Look up by Stripe ID
- `idx_orders_status` - Filter by status
- `idx_orders_payment_status` - Payment tracking
- `idx_orders_created_at` - Recent orders
- `idx_orders_completed_at` - Completed orders

**RLS Policies:**
- **SELECT:** Admins see all; users see only their own
- **INSERT:** Disabled (via RPC function only)
- **UPDATE:** Admins only

---

#### 4. **Trigger Functions** (3 new triggers)

Auto-update `updated_at` timestamps on changes:

1. `update_moderation_queue_updated_at()` - Fires before UPDATE on moderation_queue
2. `update_lighters_updated_at()` - Fires before UPDATE on lighters
3. `update_orders_updated_at()` - Fires before UPDATE on orders

---

#### 5. **RPC Functions** (5 new functions)

##### `log_moderation_result()`
Logs moderation results to database (called after OpenAI API check).

**Signature:**
```sql
log_moderation_result(
  p_user_id UUID,
  p_content_type TEXT,
  p_content TEXT,
  p_content_url TEXT DEFAULT NULL,
  p_post_id BIGINT DEFAULT NULL,
  p_lighter_id UUID DEFAULT NULL,
  p_flagged BOOLEAN DEFAULT false,
  p_categories JSONB DEFAULT '{}',
  p_scores JSONB DEFAULT '{}',
  p_severity TEXT DEFAULT 'low'
) RETURNS UUID
```

**Returns:** UUID of created moderation record

**Usage in TypeScript (app/api/moderate-text/route.ts):**
```typescript
const { data } = await supabase.rpc('log_moderation_result', {
  p_user_id: userId,
  p_content_type: 'post',
  p_content: text,
  p_flagged: result.flagged,
  p_categories: categories,
  p_scores: scores,
  p_severity: severity,
});
```

---

##### `create_order_from_payment()`
Creates order record when payment initiated.

**Signature:**
```sql
create_order_from_payment(
  p_user_id UUID,
  p_stripe_payment_intent_id TEXT,
  p_stripe_customer_email TEXT,
  p_pack_size INTEGER,
  p_amount_cents INTEGER,
  p_currency TEXT,
  p_lighter_id UUID DEFAULT NULL,
  p_design_snapshot JSONB DEFAULT '{}'
) RETURNS UUID
```

**Returns:** UUID of created order

**Usage in TypeScript (app/api/create-payment-intent/route.ts):**
```typescript
const { data: orderId } = await supabase.rpc('create_order_from_payment', {
  p_user_id: session.user.id,
  p_stripe_payment_intent_id: paymentIntent.id,
  p_stripe_customer_email: cardholderEmail,
  p_pack_size: packSize,
  p_amount_cents: Math.round(amount * 100),
  p_currency: currency,
  p_lighter_id: lighterId,
  p_design_snapshot: {
    name: lighterName,
    backgroundColor: backgroundColor,
    pinCode: pinCode,
    language: language,
  },
});
```

---

##### `update_order_payment_succeeded()`
Updates order status after successful payment (called by Stripe webhook).

**Signature:**
```sql
update_order_payment_succeeded(p_stripe_payment_intent_id TEXT) RETURNS JSONB
```

**Returns:** `{success: true, order: {...}}` or `{success: false, error: "..."}`

**Usage in Stripe webhook (future):**
```typescript
if (event.type === 'payment_intent.succeeded') {
  const { data } = await supabase.rpc('update_order_payment_succeeded', {
    p_stripe_payment_intent_id: event.data.object.id,
  });
}
```

---

##### `get_moderation_stats()`
Analytics for admin dashboard (configurable time period).

**Signature:**
```sql
get_moderation_stats(p_time_period INTERVAL DEFAULT '7 days')
```

**Returns:** Table with columns:
- `total_flagged` - Total flagged items
- `pending_review` - Awaiting admin review
- `approved_count` - Approved as safe
- `rejected_count` - Deleted by admin
- `high_severity` - Critical violations
- `medium_severity` - Moderate violations
- `low_severity` - Minor violations
- `most_common_category` - Most violated rule
- `avg_review_time_hours` - Average admin response time

**Usage in TypeScript:**
```typescript
const { data: stats } = await supabase.rpc('get_moderation_stats', {
  p_time_period: '7 days',
});
// Returns: {total_flagged: 45, pending_review: 12, high_severity: 3, ...}
```

---

##### `get_order_analytics()`
Analytics for order dashboard (configurable time period).

**Signature:**
```sql
get_order_analytics(p_time_period INTERVAL DEFAULT '30 days')
```

**Returns:** Table with columns:
- `total_orders` - Orders in period
- `completed_orders` - Successfully paid
- `failed_orders` - Payment failed
- `total_revenue` - Total cents earned
- `avg_order_value` - Average order in cents
- `most_popular_pack_size` - Most ordered size (5, 10, 25, 50)
- `completion_rate` - % of orders paid

**Usage in TypeScript:**
```typescript
const { data: analytics } = await supabase.rpc('get_order_analytics', {
  p_time_period: '30 days',
});
// Returns: {total_orders: 125, completed_orders: 118, completion_rate: 94.4, ...}
```

---

#### 6. **Views** (2 new views for dashboard queries)

##### `moderation_queue_with_user`
Pre-joined data for moderation dashboard (username included).

**Columns:** All moderation_queue columns + username from profiles

**Used in:** Admin moderation page

---

##### `orders_with_details`
Pre-joined data for order management (lighter name, username included).

**Columns:** All orders columns + username, lighter_name, pin_code from joined tables

**Used in:** Admin order management page

---

## Execution Instructions

### Step 1: Backup Database
```bash
# Via Supabase Dashboard:
# Settings > Backups > Backup Now
```

### Step 2: Copy Migration SQL
Copy the entire content of `/tmp/comprehensive_database_migration.sql`

### Step 3: Execute in Supabase SQL Editor
1. Go to https://app.supabase.com/project/[YOUR_PROJECT]/sql/new
2. Paste the complete migration SQL
3. Click "Run" button

### Step 4: Verify Execution
```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('moderation_queue', 'orders');

-- Check new columns on lighters
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'lighters'
AND column_name IN ('background_color', 'sticker_language', 'sticker_design_version');

-- Check functions created
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
AND routine_name IN ('log_moderation_result', 'create_order_from_payment', 'update_order_payment_succeeded', 'get_moderation_stats', 'get_order_analytics');

-- Expected results:
-- moderation_queue, orders tables
-- background_color, sticker_language, sticker_design_version columns
-- 5 functions (6 if rounding issues)
```

### Step 5: Update Application Code

The migration is now complete. The following webapp components are ready to use:

#### **Already Implemented:**
- ✅ OpenAI moderation endpoints (`/api/moderate-text`, `/api/moderate-image`)
- ✅ `useContentModeration` hook in components
- ✅ Moderation checks in AddPostForm
- ✅ Stripe payment integration (`/api/create-payment-intent`)
- ✅ Sticker PNG generation (`/api/generate-sticker-pdf`)

#### **Still Needed:**
- [ ] Update moderation endpoints to call `log_moderation_result()` RPC
- [ ] Update Stripe payment flow to call `create_order_from_payment()` RPC
- [ ] Build admin moderation dashboard page
- [ ] Build admin order management page
- [ ] Add Stripe webhook handler for payment confirmation

---

## Data Flow Examples

### Content Moderation Flow

1. **User submits post** → AddPostForm.tsx
2. **Call OpenAI API** → `/api/moderate-text` or `/api/moderate-image`
3. **Log result** → `log_moderation_result()` RPC (creates moderation_queue record)
4. **Admin review** (if flagged) → Moderation dashboard queries `moderation_queue_with_user` view
5. **Admin action** → UPDATE moderation_queue record with review_notes and action_taken

### Stripe Payment Flow

1. **User initiates checkout** → StripePaymentForm.tsx
2. **Create PaymentIntent** → `/api/create-payment-intent`
3. **Create order** → `create_order_from_payment()` RPC (creates orders record)
4. **Confirm payment** → stripe.confirmCardPayment() (client-side)
5. **Payment succeeds** → Stripe webhook → `update_order_payment_succeeded()` RPC
6. **Order complete** → Update order status, send confirmation email
7. **Fulfillment** → Admin marks as shipped, adds tracking number

### Sticker Design Persistence

1. **User saves lighter** → SaveLighterForm.tsx
   - Stores: name, pin_code in lighters table
   - Stores: background_color, sticker_language in lighters table
2. **User purchases stickers** → Stripe checkout
   - Captures: design_snapshot in orders table
3. **Sticker sheet generation** → `/api/generate-sticker-pdf`
   - Uses: design_snapshot from orders table (allows regeneration)
   - OR uses: current lighter properties (if regenerating existing design)
4. **User later changes lighter design** → SaveLighterForm.tsx
   - Previous orders keep their original design_snapshot
   - New orders use new design

---

## Security Considerations

### RLS Policies
- **moderation_queue:** Users see only their own records; admins/mods see all
- **orders:** Users see only their own orders; admins see all
- **Direct inserts blocked:** Both tables have insert policies set to `WITH CHECK (false)` to prevent direct inserts from client

### SECURITY DEFINER Functions
These functions run with elevated privileges (via PostgreSQL SECURITY DEFINER):
- `log_moderation_result()` - Runs as function owner, not caller
- `create_order_from_payment()` - Safe to call from client via RPC
- `update_order_payment_succeeded()` - Safe to call from server-side Stripe webhook

### Search Path Protection
All functions have `SET search_path = public` to prevent SQL injection attacks via schema names.

---

## Troubleshooting

### Migration Fails with "Column already exists"
**Cause:** Migration already executed
**Solution:** Safe to re-run (uses `IF NOT EXISTS`)

### RPC Function Not Found
**Cause:** Function name case mismatch
**Solution:** PostgreSQL converts function names to lowercase

**Call as:**
```typescript
await supabase.rpc('log_moderation_result', { ... })
// NOT: logModerationResult
```

### RLS Policy Blocks Inserts
**Expected behavior:** Direct INSERT statements on moderation_queue and orders are blocked
**Solution:** Use RPC functions instead:
```typescript
// ❌ This will fail:
await supabase.from('moderation_queue').insert({ ... })

// ✅ This works:
await supabase.rpc('log_moderation_result', { ... })
```

### View Returns Empty Results
**Cause:** User role not set as admin/moderator
**Solution:** Set role in profiles table:
```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'user-uuid';

-- OR for moderator:
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{is_moderator}', 'true')
WHERE id = 'user-uuid';
```

---

## Performance Optimization

### Index Usage
- Most queries will automatically use appropriate indexes
- Large queries (reporting) benefit from the 9 moderation_queue indexes
- Order queries benefit from payment_intent and status indexes

### Query Examples

**Find all pending moderation:**
```sql
SELECT * FROM moderation_queue_with_user
WHERE status = 'pending'
ORDER BY severity DESC, created_at ASC;
-- Uses: idx_moderation_queue_status
```

**Get user's moderation history:**
```sql
SELECT * FROM moderation_queue
WHERE user_id = $1
ORDER BY created_at DESC;
-- Uses: idx_moderation_queue_user_id
```

**Get high-severity content:**
```sql
SELECT * FROM moderation_queue
WHERE severity = 'high' AND flagged = true
ORDER BY created_at DESC;
-- Uses: idx_moderation_queue_severity, idx_moderation_queue_flagged
```

**Get user's orders with design info:**
```sql
SELECT * FROM orders_with_details
WHERE user_id = $1
ORDER BY created_at DESC;
-- Uses: idx_orders_user_id
```

---

## Next Steps

1. ✅ **Database migration** - Execute SQL above
2. [ ] **Update moderation endpoints** - Add database logging
3. [ ] **Update payment flow** - Add order creation
4. [ ] **Build admin dashboard** - Create `/app/[locale]/admin/moderation`
5. [ ] **Add Stripe webhooks** - Handle payment confirmations
6. [ ] **Test end-to-end** - Moderation, payment, order creation

---

## SQL File Location

The complete migration SQL is available at:
- `/tmp/comprehensive_database_migration.sql` (working directory)
- Can be copied to your project and version controlled

---

## Questions?

Refer to:
- Supabase Documentation: https://supabase.com/docs
- PostgreSQL RLS Guide: https://supabase.com/docs/guides/auth/row-level-security
- OpenAI Moderation API: https://platform.openai.com/docs/guides/moderation
- Stripe Documentation: https://stripe.com/docs
