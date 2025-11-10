# 🔥 LightMyFire Database Audit Guide

## Overview

This guide provides comprehensive database audit SQL scripts to validate your Supabase database schema against your codebase.

---

## 📁 Files Created

### 1. `database-audit.sql` - Detailed Output
- **Format**: Human-readable table format
- **Use Case**: Terminal/psql execution with formatted output
- **Sections**: 21 detailed sections covering every aspect of the database
- **Best For**: Complete analysis with readable formatting

### 2. `database-audit-json.sql` - JSON Output
- **Format**: Single JSON object
- **Use Case**: Supabase SQL Editor (copy/paste result)
- **Sections**: All schema info in structured JSON
- **Best For**: Programmatic analysis or saving to file

---

## 🚀 How to Run

### Option A: Supabase SQL Editor (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `database-audit-json.sql`
3. Paste and click "Run"
4. Copy the JSON result
5. Save to a file: `database-schema.json`
6. Analyze the structure

### Option B: Local psql Connection

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run the comprehensive audit
\i database-audit.sql

# Or save output to file
\o database-audit-output.txt
\i database-audit.sql
\o
```

### Option C: Using Supabase CLI

```bash
# Link to your project
supabase link --project-ref [YOUR-PROJECT-REF]

# Run the audit
supabase db query < database-audit-json.sql > schema.json
```

---

## 🔍 What to Validate Against Codebase

### 1. **Tables and Columns**

**Check:**
- ✅ All tables referenced in code exist in database
- ✅ Column names match TypeScript interfaces
- ✅ Data types are compatible with code expectations
- ✅ Nullable fields match code logic (optional fields)

**Common Issues:**
- Column name mismatches (e.g., `payment_intent_id` vs `stripe_payment_intent_id`)
- Missing columns that code expects
- Type mismatches (e.g., `text` vs `varchar`, `int` vs `bigint`)

**Files to Check:**
- TypeScript interfaces in `types/` or `lib/types.ts`
- Supabase queries in `app/api/` routes
- Components that interact with data

---

### 2. **Foreign Key Relationships**

**Check:**
- ✅ All `.eq('user_id', userId)` queries have proper FK constraints
- ✅ Cascade rules match application logic
- ✅ Relationships are bidirectional where needed

**Common Issues:**
- Missing foreign keys causing orphaned records
- Wrong cascade rules (e.g., CASCADE when should be SET NULL)
- Performance issues from missing indexes on FK columns

**Example from your code:**
```typescript
// This query implies a foreign key
.from('sticker_orders')
.eq('user_id', session.user.id)

// Verify: sticker_orders.user_id → auth.users.id exists
```

---

### 3. **RLS Policies**

**Critical for Security!**

**Check:**
- ✅ All tables have RLS enabled if they contain user data
- ✅ Policies match authentication logic in code
- ✅ No tables accidentally exposed without policies
- ✅ Service role bypasses RLS where needed

**Tables That MUST Have RLS:**
- `profiles`
- `sticker_orders`
- `lighters`
- `posts`
- `likes`
- `trophies`
- `user_trophies`

**Example Policy Validation:**
```sql
-- Code expects users to only see their own orders
SELECT * FROM sticker_orders WHERE user_id = auth.uid();

-- Database MUST have policy:
CREATE POLICY "Users can view own orders"
  ON sticker_orders FOR SELECT
  USING (auth.uid() = user_id);
```

---

### 4. **Functions (RPCs)**

**Check:**
- ✅ All `.rpc('function_name')` calls in code have matching functions
- ✅ Function signatures match TypeScript types
- ✅ Return types are correct
- ✅ Security (DEFINER vs INVOKER) is appropriate

**Functions Used in Your Codebase:**
- `create_bulk_lighters` - Called in order processing
- `update_order_payment_succeeded` - Called by Stripe webhook
- `grant_unlocked_trophies` - Called on login

**Validation Example:**
```typescript
// Code call
await supabase.rpc('create_bulk_lighters', {
  p_user_id: userId,
  p_lighter_data: lighterData
});

// Verify function exists with matching parameters
```

---

### 5. **Indexes**

**Check:**
- ✅ Foreign key columns have indexes
- ✅ Frequently queried columns have indexes
- ✅ Composite indexes for multi-column queries
- ✅ Unique indexes for unique constraints

**Critical Indexes for Performance:**
```sql
-- Orders by user (frequent query)
CREATE INDEX idx_orders_user_id ON sticker_orders(user_id);

-- Payment intent lookups (webhook queries)
CREATE INDEX idx_orders_payment_intent
  ON sticker_orders(stripe_payment_intent_id);

-- Lighter lookups by PIN
CREATE INDEX idx_lighters_pin ON lighters(pin_code);
```

---

### 6. **Storage Buckets and Policies**

**Check:**
- ✅ Buckets referenced in code exist
- ✅ Storage policies allow appropriate access
- ✅ File size limits match application needs
- ✅ MIME type restrictions are correct

**Buckets Used in Your Code:**
- `sticker-orders` - PNG files for sticker sheets
- `avatars` (possibly) - User profile pictures
- `lighter-images` (possibly) - Lighter photos

**Example Validation:**
```typescript
// Code uploads to bucket
await supabase.storage
  .from('sticker-orders')
  .upload(fileName, buffer);

// Verify:
// 1. Bucket exists
// 2. Policy allows INSERT for authenticated users
// 3. File size limit allows your PNG files (they're ~1-3MB)
```

---

### 7. **Enums**

**Check:**
- ✅ Enum values match TypeScript union types
- ✅ All enum values used in code exist in database
- ✅ No deprecated values still in use

**Example from Your Code:**
```typescript
// TypeScript type
type FulfillmentStatus =
  | 'processing'
  | 'pending'
  | 'shipped'
  | 'delivered'
  | 'failed'
  | 'canceled';

// Verify database enum has all these values
```

---

### 8. **Triggers**

**Check:**
- ✅ Triggers for timestamps (updated_at) exist
- ✅ Cascade triggers work as expected
- ✅ No conflicting triggers
- ✅ Trigger timing is correct (BEFORE vs AFTER)

**Common Triggers:**
- `updated_at` auto-update on row changes
- Validation triggers
- Audit log triggers

---

## 🐛 Common Issues Found in Your Codebase

### Issue 1: Column Name Mismatch ✅ FIXED
```typescript
// Code was using wrong column name
.eq('payment_intent_id', paymentIntentId)

// Should be:
.eq('stripe_payment_intent_id', paymentIntentId)
```

### Issue 2: Missing Indexes (Check This!)
```sql
-- These indexes may be missing:
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent
  ON sticker_orders(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_lighters_user_id
  ON lighters(user_id);

CREATE INDEX IF NOT EXISTS idx_posts_lighter_id
  ON posts(lighter_id);
```

### Issue 3: RLS Not Enabled (Verify!)
```sql
-- Check these tables have RLS enabled:
ALTER TABLE sticker_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighters ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

---

## 📊 Key Tables to Validate

### 1. `sticker_orders`
**Critical Columns:**
- `id` (primary key)
- `user_id` (FK to auth.users)
- `stripe_payment_intent_id` (unique)
- `quantity`
- `amount_paid`
- `fulfillment_status` (enum)
- `lighter_ids` (array)
- `lighter_names` (array)
- `customer_email_sent` (boolean)
- `fulfillment_email_sent` (boolean)

**RLS Policies Needed:**
- Users can SELECT their own orders
- Service role can INSERT/UPDATE
- Admin role can SELECT/UPDATE all

---

### 2. `lighters`
**Critical Columns:**
- `id` (primary key)
- `user_id` (FK to auth.users)
- `lighter_name`
- `pin_code` (unique)
- `background_color`
- `sticker_language`

**RLS Policies Needed:**
- Users can SELECT their own lighters
- Public can SELECT by pin_code
- Users can INSERT their own lighters

---

### 3. `profiles`
**Critical Columns:**
- `id` (primary key, FK to auth.users)
- `username`
- `created_at`
- `role` (enum: user, admin, moderator)

**RLS Policies Needed:**
- Users can SELECT/UPDATE their own profile
- Public can SELECT profiles
- Only service role can change roles

---

## 🔧 Recommended Next Steps

### 1. Run the Audit
```bash
# Option 1: Get JSON output
supabase db query < database-audit-json.sql > current-schema.json

# Option 2: Get formatted output
psql $DATABASE_URL < database-audit.sql > current-schema.txt
```

### 2. Analyze Results

Compare the audit results with your codebase:

```bash
# Search for all Supabase queries
grep -r "\.from(" app/

# Search for RPC calls
grep -r "\.rpc(" app/

# Search for storage operations
grep -r "\.storage\.from(" app/
```

### 3. Create Missing Indexes

```sql
-- Template for adding indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_[table]_[column]
  ON [table]([column]);
```

### 4. Verify RLS Policies

```sql
-- Check which tables don't have RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;
```

### 5. Update Migration Files

Document any schema changes needed in Supabase migrations:

```bash
supabase migration new add_missing_indexes
```

---

## 🎯 Critical Validations Checklist

- [ ] All tables in code exist in database
- [ ] All columns match between code and database
- [ ] Foreign keys have proper CASCADE rules
- [ ] All RLS policies are in place
- [ ] Indexes exist on frequently queried columns
- [ ] Functions (RPCs) match code signatures
- [ ] Storage buckets have correct policies
- [ ] Enum values match TypeScript types
- [ ] Triggers work correctly
- [ ] No deprecated columns/tables exist

---

## 💡 Pro Tips

### 1. Use TypeScript Generators
Consider using Supabase CLI to generate types:
```bash
supabase gen types typescript --local > types/supabase.ts
```

### 2. Test RLS in Development
```sql
-- Test as a specific user
SET request.jwt.claims = '{"sub": "user-id-here"}';
SELECT * FROM sticker_orders; -- Should only show user's orders
```

### 3. Monitor Query Performance
```sql
-- Enable query timing
\timing on

-- Check slow queries
SELECT * FROM pg_stat_statements
WHERE mean_exec_time > 1000 -- queries over 1 second
ORDER BY mean_exec_time DESC;
```

### 4. Backup Before Changes
```bash
# Always backup before schema changes
supabase db dump -f backup-$(date +%Y%m%d).sql
```

---

## 🆘 Troubleshooting

### Query Returns Empty Results
- Check that you're connected to the right database
- Verify schema names (might be in `public` vs `auth` vs `storage`)
- Check RLS policies aren't blocking the query

### Permission Denied Errors
- You may need superuser access for some queries
- Use service_role key for admin queries
- Some system tables require elevated privileges

### Timeout on Large Databases
- Add `LIMIT` clauses to queries
- Run sections individually
- Use pagination for large result sets

---

## 📚 Additional Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL System Catalogs](https://www.postgresql.org/docs/current/catalogs.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

## 🎉 You're a Database Expert Now!

Run these audits, validate your schema, and ensure your database is perfectly aligned with your codebase. Remember: a well-structured database is the foundation of a reliable application!

**Pro Tip**: Save the audit output periodically as documentation of your schema evolution over time.
