# Supabase Security Issues - Fixes Required

This document contains the SQL statements to fix all 1 ERROR and 17 WARNINGS from your Supabase database linter.

## 1. FIX: SECURITY DEFINER VIEW ERROR

**Issue:** View `detailed_posts` is defined with SECURITY DEFINER property, which enforces permissions of the view creator rather than querying user.

**Solution:** Recreate the view without SECURITY DEFINER.

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop and recreate detailed_posts view without SECURITY DEFINER
DROP VIEW IF EXISTS public.detailed_posts CASCADE;

CREATE OR REPLACE VIEW public.detailed_posts AS
SELECT
  p.id,
  p.user_id,
  p.lighter_id,
  p.title,
  p.post_type,
  p.content_text,
  p.content_url,
  p.location_name,
  p.location_lat,
  p.location_lng,
  p.created_at,
  p.is_flagged,
  p.flag_count,
  u.username,
  u.nationality,
  u.show_nationality,
  u.role,
  l.name as lighter_name,
  l.color as lighter_color,
  (
    SELECT COUNT(*)::int FROM public.post_likes pl
    WHERE pl.post_id = p.id
  ) AS like_count
FROM
  public.posts p
  LEFT JOIN public.profiles u ON u.id = p.user_id
  LEFT JOIN public.lighters l ON l.id = p.lighter_id
WHERE
  p.is_flagged = FALSE;

GRANT SELECT ON public.detailed_posts TO authenticated, anon;
```

---

## 2. FIX: FUNCTION SEARCH PATH MUTABLE WARNINGS

**Issue:** 15 functions have role mutable search_path (parameter not set). This is a security best practice.

**Solution:** Add `SET search_path = public` to all functions.

**Affected Functions:**
1. `create_new_post`
2. `update_is_flagged`
3. `toggle_like` (appears twice in the list)
4. `calculate_distance`
5. `reinstate_post`
6. `update_lighter_stats`
7. `delete_post_by_moderator`
8. `get_random_public_posts`
9. `create_new_lighter`
10. `get_lighter_id_from_pin`
11. `generate_random_pin`
12. `flag_post`
13. `get_my_stats`
14. `grant_trophy`
15. `backfill_all_trophies`

### Instructions:

For each function, you need to:
1. Go to your Supabase dashboard → SQL Editor
2. Find the function definition (you can query it with: `SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'function_name';`)
3. Drop and recreate the function with `SET search_path = public` clause

**Generic template for modifying a function:**

```sql
-- Example: Fix create_new_post function
CREATE OR REPLACE FUNCTION public.create_new_post(
  p_lighter_id UUID,
  p_user_id UUID,
  p_title TEXT,
  p_post_type TEXT,
  p_content_text TEXT DEFAULT NULL,
  p_content_url TEXT DEFAULT NULL,
  p_location_name TEXT DEFAULT NULL,
  p_location_lat FLOAT DEFAULT NULL,
  p_location_lng FLOAT DEFAULT NULL
)
RETURNS VOID
LANGUAGE PLPGSQL
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
  -- [function body remains the same]
END
$$;
```

The key addition is: `SET search_path = public`

---

## 3. FIX: ENABLE LEAKED PASSWORD PROTECTION

**Issue:** Leaked password protection is disabled.

**Solution:** Enable in Auth settings (cannot be done via SQL).

### Steps:
1. Go to Supabase dashboard
2. Navigate to: Authentication → Settings
3. Under "Security" section, find "Leaked password protection"
4. Toggle it ON
5. Save settings

---

## How to Apply These Fixes

### Option 1: Manual via Supabase Dashboard (Recommended)
1. Go to your project: https://mcp.supabase.com/mcp?project_ref=xdkugrvcehfedkcsylaw
2. Open SQL Editor
3. Copy and paste each SQL statement
4. Execute them one by one
5. Check that no errors appear

### Option 2: CLI (If using Supabase CLI)
```bash
supabase db pull  # Get current schema
# Create migration files with the SQL above
supabase db push  # Deploy migrations
```

---

## Detailed Fix Steps

### For the detailed_posts View (Can be applied directly via SQL)

Copy the following SQL and run it in your Supabase SQL Editor:

```sql
DROP VIEW IF EXISTS public.detailed_posts CASCADE;

CREATE OR REPLACE VIEW public.detailed_posts AS
SELECT
  p.id, p.user_id, p.lighter_id, p.title, p.post_type,
  p.content_text, p.content_url, p.location_name,
  p.location_lat, p.location_lng, p.created_at,
  p.is_flagged, p.flag_count,
  u.username, u.nationality, u.show_nationality, u.role,
  l.name as lighter_name, l.color as lighter_color,
  (SELECT COUNT(*)::int FROM public.post_likes pl WHERE pl.post_id = p.id) AS like_count
FROM public.posts p
LEFT JOIN public.profiles u ON u.id = p.user_id
LEFT JOIN public.lighters l ON l.id = p.lighter_id
WHERE p.is_flagged = FALSE;

GRANT SELECT ON public.detailed_posts TO authenticated, anon;
```

### For the 15 Functions (Manual Fix Required)

Since each function has different parameters and implementations, you need to manually add `SET search_path = public` to each. Here's the process:

1. **Go to Supabase Dashboard** → Your Project → Database → Functions
2. **For each of these 15 functions:**
   - Click on the function name
   - Click "Edit function"
   - Find the line with `LANGUAGE plpgsql` (or your function's language)
   - Add a new line after it: `SET search_path = public`
   - Example pattern:
   ```sql
   CREATE OR REPLACE FUNCTION public.function_name(param1 type1, param2 type2)
   RETURNS return_type
   LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public
   AS $$
   BEGIN
     -- function implementation
   END;
   $$;
   ```
   - Click "Confirm"

**Functions to update:**
- create_new_post
- update_is_flagged
- toggle_like
- calculate_distance
- reinstate_post
- update_lighter_stats
- delete_post_by_moderator
- get_random_public_posts
- create_new_lighter
- get_lighter_id_from_pin
- generate_random_pin
- flag_post
- get_my_stats
- grant_trophy
- backfill_all_trophies

### For Leaked Password Protection

This is an Auth setting (cannot be done via SQL):

1. Go to Supabase Dashboard → Your Project
2. Navigate to: **Authentication → Settings**
3. Under the "Security" section, find "**Leaked password protection**"
4. Toggle it to **ON**
5. Click **"Save"**

---

## Verification

After applying the fixes, re-run the Supabase database linter to confirm all issues are resolved:
1. Go to your Supabase dashboard
2. Database → Linter
3. Run linter again
4. All errors/warnings should be gone

You can also run this verification query in your SQL Editor to check function search_path:

```sql
SELECT
  p.proname as function_name,
  CASE WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN '✓ FIXED' ELSE '✗ NEEDS FIX' END as status
FROM pg_proc p
WHERE p.proname IN (
  'create_new_post', 'update_is_flagged', 'toggle_like', 'calculate_distance',
  'reinstate_post', 'update_lighter_stats', 'delete_post_by_moderator',
  'get_random_public_posts', 'create_new_lighter', 'get_lighter_id_from_pin',
  'generate_random_pin', 'flag_post', 'get_my_stats', 'grant_trophy',
  'backfill_all_trophies'
)
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY p.proname;
```

---

## Security Impact

These fixes improve security by:
- **SECURITY DEFINER view removal**: Enforces Row Level Security (RLS) policies of users accessing the view instead of the view creator, preventing privilege escalation
- **search_path on functions**: Prevents SQL injection attacks by ensuring functions always reference the correct schema regardless of user's session settings
- **Leaked password protection**: Prevents users from using compromised passwords that appear in data breach databases

---

## Files Created

Two helper files have been created in your project root:
- `SUPABASE_SECURITY_FIXES.md` - This comprehensive guide
- `SUPABASE_SECURITY_MIGRATION.sql` - SQL migration file with detailed comments and the view fix
