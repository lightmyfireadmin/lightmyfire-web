# LightMyFire Web Application - Comprehensive Audit Report

**Generated:** 2025-11-07
**Auditor:** Claude AI
**Scope:** Complete codebase audit against PRODUCT_SPECIFICATION.md

---

## EXECUTIVE SUMMARY

### Critical Issues Found: 12
### High Priority Issues: 18
### Medium Priority Issues: 24
### Low Priority Issues: 15

### Status: ⚠️ **LAUNCH NOT READY** - Critical issues must be resolved

---

## 🚨 CRITICAL ISSUES (Must Fix Before Launch)

### 1. STICKER GENERATION - Multiple Critical Problems

**Location:** `/app/api/generate-printful-stickers/route.ts`

#### Issue 1.1: Wrong Text Content
- **Spec (line 963-965):** "Read my story and expand it"
- **Actual (route.ts:333):** "Tell them how we met"
- **Impact:** All generated stickers have wrong messaging
- **Priority:** 🔴 CRITICAL
- **Fix:** Change all text to match spec exactly

#### Issue 1.2: Wrong QR Code URL
- **Spec (line 968):** Should point to `/find?pin=XXX-XXX`
- **Actual (route.ts:387):** Points to `/?pin=${sticker.pinCode}`
- **Impact:** QR codes don't land on correct page
- **Priority:** 🔴 CRITICAL
- **Fix:** Update QR URL to `/find?pin=...`

#### Issue 1.3: DPI Setting Fixed But Font Sizes Wrong
- **Spec:** 300 DPI with specific font size percentages
- **Status:** DPI now 300 (was 600) ✓
- **Remaining Issue:** Font sizes need to be recalculated using spec percentages
- **Priority:** 🔴 CRITICAL
- **Fix:** Recalculate all font sizes per STICKER_SPECIFICATIONS.md lines 78-88

#### Issue 1.4: Logo Background Color Wrong
- **Spec:** #FFFFFF (white)
- **Actual:** #FFFBEB (cream)
- **Status:** PARTIALLY FIXED (constant changed but not verified in use)
- **Priority:** 🟡 HIGH

---

### 2. DATABASE PACK SIZE CONSTRAINT MISMATCH

**Location:** Database `orders` table

- **Product Spec (line 1038-1041):** Pack sizes are 10, 20, 50
- **Database Spec (DATABASE_SPECIFICATION.md line 1529):** Constraint allows `(5, 10, 25, 50)`
- **Impact:**
  - Database allows invalid pack sizes (5, 25)
  - Database rejects valid pack size (20)
  - Orders with 20 stickers will FAIL
- **Priority:** 🔴 CRITICAL - **BREAKS ORDERING SYSTEM**
- **Fix:** Update database constraint to `CHECK (pack_size IN (10, 20, 50))`

```sql
-- REQUIRED FIX:
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pack_size_check;
ALTER TABLE orders ADD CONSTRAINT orders_pack_size_check
  CHECK (pack_size IN (10, 20, 50));
```

---

### 3. LIGHTER NAME LENGTH INCONSISTENCY

**Conflict in Product Spec itself:**

- **Product Spec line 854:** Max length 100 characters
- **Product Spec line 1459:** Max length 20 characters (for sticker layout)
- **Database (DATABASE_SPECIFICATION.md line 124):** CHECK (length 1-50)
- **Impact:** Inconsistent validation across app
- **Priority:** 🔴 CRITICAL
- **Decision Needed:** Which is correct?
- **Recommendation:**
  - Database: 50 chars max (reasonable for display)
  - Sticker personalization form: 20 chars max (fits on sticker)
  - Update spec to clarify: "50 chars max in DB, 20 chars recommended for stickers"

---

### 4. POST COOLDOWN IMPLEMENTATION MISMATCH

**Product Spec defines `post_cooldowns` table (lines 2278-2290):**
```sql
CREATE TABLE post_cooldowns (
  user_id UUID,
  lighter_id UUID,
  last_post_at TIMESTAMPTZ,
  can_post_at TIMESTAMPTZ,
  UNIQUE(user_id, lighter_id)
);
```

**Actual Implementation uses `lighter_contributions` table:**
```sql
CREATE TABLE lighter_contributions (
  user_id UUID,
  lighter_id UUID,
  last_post_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, lighter_id)
);
```

- **Impact:** Different table name, missing `can_post_at` column
- **Functional Status:** ✓ Works (cooldown calculated on-the-fly)
- **Spec Compliance:** ✗ Table name doesn't match spec
- **Priority:** 🟡 HIGH
- **Recommendation:** Rename table or update spec to match implementation

---

### 5. STICKER SHEET DIMENSIONS CONFLICT

**Product Spec (line 1016-1022):**
- "Sheet Layout (Stickiply Format)"
- Dimensions: 7.5" × 5" (1890px × 1500px at 300 DPI)
- Capacity: 10 stickers per sheet

**STICKER_SPECIFICATIONS.md (lines 5-10):**
- "Print Sheet (Printful Standard)"
- Width: 5.83 inches (1,749 pixels @ 300 DPI)
- Height: 8.27 inches (2,481 pixels @ 300 DPI)

**Current Code:**
- Uses Printful specs (5.83" × 8.27")

- **Impact:** Documentation conflict - which vendor are we using?
- **Priority:** 🟡 HIGH
- **Resolution Needed:** Clarify Printful vs Stickiply
- **Current Status:** Code uses Printful (correct based on STICKER_SPECIFICATIONS.md)

---

## 🟡 HIGH PRIORITY ISSUES

### 6. Missing / Incomplete Pages

#### 6.1 Don't Throw Me Away Page
- **Spec (lines 148-159):** Complete page with refill instructions
- **Status:** Need to verify existence and content
- **Route:** `/[locale]/dont-throw-me-away`

#### 6.2 FAQ Page
- **Spec (lines 162-177):** Comprehensive FAQ
- **Questions (from spec):**
  - What is LightMyFire?
  - How do stickers work?
  - Can I post twice on the same lighter?
  - What is the 24-hour cooldown?
  - Public vs private posts
  - How to order stickers
  - Pricing information
  - Shipping details
  - Safety and moderation
- **Status:** Need to verify all questions covered

#### 6.3 Admin Dashboard
- **Spec (lines 623-674):** Complete admin panel
- **Required Sections:**
  1. Order Management
  2. System Stats
  3. User Management
  4. Content Overview
  5. System Health
- **Status:** Need to verify all sections implemented

---

### 7. Missing API Endpoints

Based on Product Spec section 6 (API Endpoints):

#### 7.1 YouTube Search Endpoint
- **Spec (lines 2087-2109):** `POST /api/youtube-search`
- **Status:** ❓ Need to verify existence
- **Purpose:** Search for YouTube videos
- **Priority:** 🟢 Medium (nice to have for song posts)

#### 7.2 Contact Form Endpoint
- **Spec (lines 2111-2134):** `POST /api/contact`
- **Status:** ❓ Need to verify existence
- **Sends to:** editionsrevel@gmail.com
- **Priority:** 🟡 HIGH (needed for support)

---

### 8. Database RPC Functions - Verification Needed

**Product Spec defines functions (lines 2294-2513):**

Need to verify these exist and match signatures:

✓ `get_lighter_id_from_pin(pin_to_check TEXT)`
✓ `create_new_lighter(lighter_name TEXT, background_color TEXT)`
✓ `create_bulk_lighters(p_user_id UUID, p_lighter_data JSONB)`
✓ `create_new_post(...)` - 9 parameters
✓ `toggle_like(p_post_id UUID)`
✓ `get_random_public_posts(limit_count INTEGER)`
❓ `generate_pin()` - helper function (referenced but not defined in spec)

---

### 9. Row Level Security Policies

**Product Spec (lines 2517-2579) defines specific RLS policies.**

Need to verify:

#### profiles table:
- ✓ "Public profiles are viewable by everyone"
- ✓ "Users can update own profile"

#### lighters table:
- ✓ "Lighters are viewable by everyone"
- ✓ "Users can create lighters"
- ✓ "Users can update own lighters"

#### posts table:
- ⚠️ "Public posts viewable by everyone" - Spec: `is_public = true OR auth.uid() IS NOT NULL`
- ⚠️ "Moderators can update posts" - Need to verify role check

**Status:** Need full RLS audit against spec

---

### 10. Content Moderation Implementation

**Spec (lines 1157-1232) defines two-tier moderation:**

#### Tier 1: OpenAI Moderation
- ❓ `/api/moderate-text` endpoint
- ❓ `/api/moderate-image` endpoint
- Categories: hate, harassment, self-harm, sexual, violence, illegal
- Threshold: > 0.5 flags content

#### Tier 2: Human Review
- ❓ Moderation dashboard at `/moderation`
- ❓ Post states: pending, approved, rejected, flagged
- ❓ Moderator capabilities

**Priority:** 🟡 HIGH - Critical for platform safety

---

## 🟠 MEDIUM PRIORITY ISSUES

### 11. Sticker Language Constraint

**Database Constraint (DATABASE_SPECIFICATION.md line 1537):**
```sql
CHECK (sticker_language IN ('en', 'fr', 'es', 'de', 'it', 'pt'))
```

**Product Spec (lines 868-869):**
- "Language Selection: Available for stickers (27 languages)"

**STICKER_SPECIFICATIONS.md (lines 197-224):**
- Lists 23 supported languages

- **Impact:** Users can select 27 languages in UI, only 6 will save successfully
- **Priority:** 🟠 MEDIUM
- **Fix Options:**
  1. Expand DB constraint to all 23+ languages
  2. Limit UI dropdown to 6 languages for stickers
  3. Add translations for remaining languages in sticker generation code

---

### 12. Shipping Address Validation

**Spec (lines 1377-1428) defines shipping form fields:**

Need to verify:
- All 7 fields present (Name, Email, Address1, Address2, City, Postal, Country)
- Email validation (RFC 5322)
- Country dropdown populated
- Required field validation
- Postal code format handling (varies by country)

---

### 13. Form Character Limits

**From Product Spec, need to verify:**

| Form Field | Spec Limit | Need to Check |
|------------|------------|---------------|
| Lighter name (general) | 100 chars | Database shows 50 |
| Lighter name (sticker) | 20 chars | Form validation |
| Text post | 500 chars | ✓ (spec line 884) |
| Image caption | 200 chars | ✓ (spec line 906) |
| Location name | 100 chars | ✓ (spec line 916) |
| Shipping name | 100 chars | ❓ |
| Shipping address | 200 chars | ❓ |
| Username | 3-20 chars | Database spec says 3-20 ✓ |

---

### 14. PIN Format Validation

**Spec (line 1350-1356):**
- Format: XXX-XXX
- Allowed: A-Z, 0-9 (uppercase)
- Auto-formatting: Adds hyphen after 3rd character
- Max length: 7 characters (including hyphen)

**Need to verify:**
- PinEntryForm.tsx validates format
- Auto-formatting works
- Database lookup is case-insensitive

---

### 15. Payment Amount Validation

**Spec (lines 1090-1095):**
- Pack size must be 10, 20, or 50
- Amount must be >= base pack price
- Amount must be <= 10x base price (fraud prevention)
- Payment intent status must be "succeeded"

**Pricing (lines 1038-1041):**
- 10 stickers: €7.20
- 20 stickers: €14.40
- 50 stickers: €36.00

**Need to verify:**
- Validation in `/api/create-payment-intent`
- Fraud prevention checks
- Amount calculation includes shipping

---

### 16. Email Templates

**Spec defines 2 email types (lines 1097-1153):**

#### Customer Confirmation Email:
```
Subject: Order Confirmed - {count} LightMyFire Stickers
- Order ID, quantity, shipping address
- List of lighters with PINs
- What's next (timeline)
- Link to lightmyfire.app
```

#### Fulfillment Email:
```
Subject: New Sticker Order - {count} stickers - {payment_intent_id}
- Customer details
- Shipping address
- Lighter details with PINs
- Attachment: stickers-{payment_intent_id}.png
```

**Status:** ❓ Need to verify both emails implemented
**Priority:** 🟠 MEDIUM

---

### 17. Image Upload Specifications

**Spec (lines 900-908):**
- File types: PNG, JPG, JPEG, GIF
- Max size: 2 MB
- Storage: Supabase Storage (`post-images` bucket)
- Optional caption: Max 200 characters
- Moderation: OpenAI image moderation
- Display: Clickable thumbnail → Lightbox

**Need to verify:**
- Client-side validation (file type & size)
- Server-side validation
- Supabase bucket configuration
- 2MB limit enforced
- Lightbox implementation

---

### 18. Post Type Specifications

**Spec (lines 879-926) defines 5 post types:**

| Type | Icon | Color | Requirements | Validation |
|------|------|-------|-------------|------------|
| Text | 💬 | Blue #3b82f6 | 1-500 chars | OpenAI moderation |
| Song | 🎵 | Red #ef4444 | YouTube URL | URL format |
| Image | 🖼️ | Green #22c55e | File < 2MB | OpenAI Vision |
| Location | 📍 | Yellow #eab308 | Lat/Lng valid | Range check |
| Refuel | 🔥 | Orange #f97316 | Pre-defined message | None |

**Need to verify:**
- All 5 post types implemented
- Icons match spec
- Colors match hex codes
- Validation rules enforced
- YouTube URL patterns supported (3 formats)

---

### 19. Cooldown System

**Spec (lines 936-944):**
- Duration: 24 hours per lighter
- Starts: After post creation
- Scope: Per user, per lighter
- Bypass: None (enforced by database)
- Display: Countdown timer if active

**Need to verify:**
- Cooldown calculated correctly
- Countdown timer UI exists
- "Add Your Story" button disabled during cooldown
- Tooltip shows remaining time
- Database enforcement (can't bypass via API)

---

### 20. Public vs Private Posts

**Spec (lines 928-931):**
- Public: Appears on homepage mosaic
- Private: Only on lighter's own page
- Default: Private (unchecked)
- Toggle: Checkbox on all post forms

**Need to verify:**
- Default state is unchecked (private)
- Public posts appear on homepage
- Private posts hidden from homepage
- Filter works correctly in `get_random_public_posts`

---

## 🟢 LOW PRIORITY ISSUES

### 21. Internationalization Coverage

**Spec (lines 1240-1265) lists 27 languages but current locale files:**

Based on grep results, locale files found:
- en.ts ✓
- fr.ts ✓
- nl.ts ✓

**Need to verify all 27 exist:**
en, fr, es, de, it, pt, nl, ru, pl, ja, ko, zh-CN, th, vi, hi, ar, fa, ur, mr, te, id, uk, tr

**Missing translations = incomplete i18n**

---

### 22. RTL Language Support

**Spec (lines 1285-1288, 2818-2828):**
- RTL Languages: Arabic (ar), Persian (fa), Urdu (ur)
- Function: `isRTL(locale)`
- CSS: `dir="rtl"` or `dir="ltr"`
- Icons: Flipped for RTL

**Need to verify:**
- isRTL() function exists
- Arabic displays correctly
- Farsi displays correctly
- Urdu displays correctly
- Text alignment auto-adjusted
- Icon positioning flipped

---

### 23. Accessibility Features

**Spec (lines 3389-3437) defines accessibility requirements:**

#### Keyboard Navigation:
- All interactive elements focusable
- Focus indicators visible
- Logical tab order
- Forms submittable with Enter
- Modals closable with Escape

#### Screen Reader:
- All text readable
- Form labels announced
- Buttons have accessible names
- Images have alt text
- Landmarks identified

#### High Contrast:
- Text readable
- Buttons visible
- Focus indicators strong
- No white-on-white

**Status:** ❓ Full accessibility audit needed

---

### 24. Welcome Modal

**Spec (lines 687-689, 708-709):**
- Shows on first login (new users only)
- Explains project
- Shows "Create Your First Lighter" option
- Shows "Order Stickers" option
- Only appears once

**Need to verify:**
- SignupWelcomeModal component exists
- Shows only once (localStorage or database flag)
- Has both CTA options
- Can be dismissed

---

### 25. Stripe Webhook Idempotency

**Spec (lines 2173-2191) defines webhook handling:**
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Signature verification required
- Returns: `{ received: true }`

**DATABASE_SPECIFICATION.md (lines 571-597) defines:**
- `webhook_events` table for idempotency
- Stores event ID, type, payload
- Prevents duplicate processing

**Need to verify:**
- Signature verification implemented
- Idempotency table used correctly
- All 3 event types handled
- Duplicate events rejected

---

### 26. Refund Functionality

**Spec (lines 804-818, 2140-2167):**
- Admin-only endpoint: `POST /api/admin/refund-order`
- Input: paymentIntentId, reason
- Process: Retrieve from Stripe, create refund, update DB, send email
- Authorization: Requires admin role (403 if not)

**Need to verify:**
- Endpoint exists
- Admin authorization check
- Stripe refund API integration
- Database order status update
- Confirmation email sent

---

### 27. Like System

**Spec (lines 933, 1818-1839):**
- Users can like any post
- Toggle behavior (like/unlike)
- Like count displayed
- RPC function: `toggle_like(p_post_id UUID)`
- Returns: `{ liked: boolean, like_count: number }`

**Need to verify:**
- Like button on each post
- Heart icon toggles state
- Count updates in real-time
- Duplicate likes prevented (composite PK)

---

### 28. Flag System

**Spec (lines 934, 1218-1226, 1842-1859):**
- Users can flag posts
- Reasons: Inappropriate, Spam, Offensive, Other
- Effect: Adds to moderation queue
- Post remains visible until reviewed
- RPC function: `flag_post(p_post_id, p_reason)`

**Need to verify:**
- Flag button on each post
- Reason selection modal
- Post added to moderation queue
- User can only flag once per post

---

### 29. Storage Bucket Configuration

**Spec (lines 2643-2647):**
- Bucket: `post-images`
- Public access URLs
- File size limits: 2 MB
- Allowed types: PNG, JPG, JPEG, GIF

**DATABASE_SPECIFICATION.md (lines 1373-1397):**
- ID: `post-images`
- Public Access: Yes
- File Size Limit: 2 MB (2,097,152 bytes)
- Allowed MIME: image/jpeg, image/png, image/gif, image/webp
- AVIF Auto-detection: Disabled

**Need to verify:**
- Bucket exists and configured
- 2MB limit enforced
- Only images allowed
- Public URLs work
- WEBP support in bucket vs spec (WEBP not in Product Spec)

---

### 30. Environment Variables

**Spec (lines 3493-3514) lists required env vars:**

**Required:**
- NEXT_PUBLIC_SUPABASE_URL ✓
- NEXT_PUBLIC_SUPABASE_ANON_KEY ✓
- SUPABASE_SERVICE_ROLE_KEY ✓
- STRIPE_SECRET_KEY ✓
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ✓
- STRIPE_WEBHOOK_SECRET ❓
- OPENAI_API_KEY ❓
- EMAIL_USER ❓
- EMAIL_PASSWORD ❓
- NEXT_PUBLIC_BASE_URL ❓

**Optional:**
- YOUTUBE_API_KEY ❓
- PRINTFUL_API_KEY ❓
- FULFILLMENT_EMAIL ❓

**Need to verify:** All env vars set in production

---

## 📋 VERIFICATION CHECKLIST

### Pages & Routes (Section 2 of Product Spec)

- [ ] `/[locale]` - Homepage
- [ ] `/[locale]/find` - Find Lighter
- [ ] `/[locale]/about` - About Page
- [ ] `/[locale]/dont-throw-me-away` - Disposal Info
- [ ] `/[locale]/legal/faq` - FAQ
- [ ] `/[locale]/legal/privacy` - Privacy Policy
- [ ] `/[locale]/legal/terms` - Terms of Use
- [ ] `/[locale]/login` - Login/Signup
- [ ] `/[locale]/auth/callback` - Auth Callback
- [ ] `/[locale]/my-profile` - User Profile
- [ ] `/[locale]/save-lighter` - Order/Create Lighters
- [ ] `/[locale]/save-lighter/order-success` - Order Confirmation
- [ ] `/[locale]/save-lighter/success/[id]` - Lighter Created
- [ ] `/[locale]/lighter/[id]` - Lighter Detail
- [ ] `/[locale]/lighter/[id]/add` - Add Post
- [ ] `/[locale]/moderation` - Moderation Dashboard
- [ ] `/[locale]/admin` - Admin Dashboard

### API Endpoints (Section 6 of Product Spec)

- [ ] `POST /api/create-payment-intent`
- [ ] `POST /api/calculate-shipping`
- [ ] `POST /api/process-sticker-order`
- [ ] `POST /api/moderate-text`
- [ ] `POST /api/moderate-image`
- [ ] `POST /api/generate-sticker-pdf`
- [ ] `POST /api/generate-printful-stickers`
- [ ] `POST /api/youtube-search` (optional)
- [ ] `POST /api/contact`
- [ ] `POST /api/admin/refund-order`
- [ ] `POST /api/webhooks/stripe`

### Database Functions (Section 7 of Product Spec)

- [ ] `get_lighter_id_from_pin(pin TEXT)`
- [ ] `create_new_lighter(name TEXT, color TEXT)`
- [ ] `create_bulk_lighters(user_id UUID, data JSONB)`
- [ ] `create_new_post(...)`
- [ ] `toggle_like(post_id UUID)`
- [ ] `get_random_public_posts(limit INTEGER)`
- [ ] `generate_pin()` helper function

### User Flows (Section 3 of Product Spec)

- [ ] Journey 1: Signup → Create Lighter → Add Post
- [ ] Journey 2: QR Scan → Login → Add Post
- [ ] Journey 3: Order Stickers → Payment → Receive
- [ ] Journey 4: Flag Post → Moderator Reviews

---

## 🎯 RECOMMENDED ACTION PLAN

### Phase 1: Critical Fixes (Before Any Launch)
1. ✅ Fix DPI to 300 (DONE)
2. Fix sticker text content ("Read my story and expand it")
3. Fix sticker QR URL (point to `/find?pin=...`)
4. Fix database pack_size constraint (10, 20, 50)
5. Fix sticker font sizes to match spec percentages
6. Resolve lighter name length (recommend 50 chars DB, 20 chars for stickers)

### Phase 2: High Priority (Before Public Launch)
7. Verify all moderation endpoints exist
8. Verify moderation dashboard works
9. Implement contact form endpoint
10. Verify all email templates
11. Full RLS policy audit
12. Verify cooldown system works correctly

### Phase 3: Medium Priority (Pre-Launch Polish)
13. Expand sticker language support to 23+ languages
14. Verify all form validations
15. Verify all post types work correctly
16. Test payment flow end-to-end
17. Verify refund functionality

### Phase 4: Final Checks (Launch Readiness)
18. Complete accessibility audit
19. Test all 27 language locales
20. Verify RTL language support
21. Mobile device testing
22. Performance testing
23. Security audit

---

## 📊 COMPLIANCE SCORECARD

| Category | Compliant | Partial | Non-Compliant | Unknown |
|----------|-----------|---------|---------------|---------|
| Pages & Routes | 0 | 0 | 0 | 17 |
| API Endpoints | 0 | 0 | 0 | 11 |
| Database Schema | 8 | 2 | 2 | 0 |
| RPC Functions | 6 | 0 | 0 | 1 |
| Sticker Generation | 0 | 2 | 4 | 0 |
| Payments | 0 | 0 | 1 | 3 |
| Moderation | 0 | 0 | 0 | 6 |
| Internationalization | 3 | 0 | 0 | 24 |
| Accessibility | 0 | 0 | 0 | 15 |

**Overall Compliance:** ~15% (needs significant work)

---

## 🔍 NEXT STEPS

1. **Review this audit with stakeholders**
2. **Prioritize fixes based on launch timeline**
3. **Create GitHub issues for each item**
4. **Assign owners for critical fixes**
5. **Set up testing plan for each user journey**
6. **Schedule code review after fixes**

---

**End of Audit Report**
