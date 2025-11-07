# LIGHTMYFIRE API SECURITY AUDIT REPORT

**Date:** 2025-11-07
**Auditor:** Automated Security Analysis
**Scope:** All API endpoints in /app/api directory
**Status:** ⚠️ **3 CRITICAL issues require immediate attention before launch**

---

## EXECUTIVE SUMMARY

Audited **12 API endpoints** across the application. Found **3 CRITICAL**, **4 HIGH**, **3 MEDIUM**, and **2 LOW** severity issues.

**Most Concerning:**
- Unauthenticated endpoints that could be abused for resource exhaustion
- Missing rate limiting on sensitive operations
- User identity verification gaps in moderation endpoints

**Positive Findings:**
- Excellent SQL injection protection (all queries parameterized)
- Strong file upload validation with magic number checking
- Secure Stripe webhook implementation with signature verification

---

## CRITICAL FINDINGS (Must Fix Before Launch) 🚨

### 1. Unauthenticated Sticker Generation Endpoint

**Severity:** CRITICAL
**Endpoint:** `/api/generate-printful-stickers`
**Location:** `app/api/generate-printful-stickers/route.ts:135`

**Issue:**
- No authentication required - anyone can call this endpoint
- Generates high-resolution images (600 DPI) with heavy processing
- Loads multiple fonts and images per request

**Risk:**
- Resource exhaustion attack
- Server DoS through heavy image generation
- Unauthorized sticker generation
- Cost implications (compute resources)

**Current Code:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const { stickers, brandingText } = await request.json();
    // NO AUTHENTICATION CHECK!
```

**Fix Required:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // Add authentication check
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stickers, brandingText } = await request.json();
    // ... rest of code
```

**Test Case:**
```bash
# Should FAIL with 401 Unauthorized
curl -X POST https://lightmyfire.app/api/generate-printful-stickers \
  -H "Content-Type: application/json" \
  -d '{"stickers": []}'
```

---

### 2. Unauthenticated PDF Generation Endpoint

**Severity:** CRITICAL
**Endpoint:** `/api/generate-sticker-pdf`
**Location:** `app/api/generate-sticker-pdf/route.ts:53`

**Issue:**
- No authentication required
- Generates PDFs with complex image processing

**Risk:**
- Resource exhaustion
- Server DoS
- Unauthorized PDF generation

**Fix Required:** Same as #1 above

---

### 3. No Rate Limiting on Order Processing

**Severity:** CRITICAL
**Endpoint:** `/api/process-sticker-order`
**Location:** `app/api/process-sticker-order/route.ts:36`

**Issue:**
- No rate limiting despite being a critical financial transaction endpoint
- User could submit hundreds of orders in quick succession

**Risk:**
- Order flooding
- Potential payment abuse
- Database overload
- Email spam to fulfillment

**Current Code:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // Use service role key for admin operations
    const supabaseAdmin = createClient(...);
    // NO RATE LIMITING!
```

**Fix Required:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // ... auth checks ...

    // Add rate limiting AFTER auth
    const rateLimitResult = await rateLimit(
      request,
      'payment',
      session.user.id,
      {
        max: 5,        // Max 5 orders
        windowMs: 60000 // Per minute
      }
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many order attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // ... rest of order processing
```

---

## HIGH SEVERITY FINDINGS (Should Fix Before Launch) ⚠️

### 4. Moderation Endpoints Not Verifying User Identity

**Severity:** HIGH
**Endpoints:** `/api/moderate-image`, `/api/moderate-text`
**Locations:**
- `app/api/moderate-image/route.ts:36`
- `app/api/moderate-text/route.ts:34`

**Issue:**
- Accept `userId` as a parameter but don't verify it matches authenticated session
- Moderators could submit requests claiming to be other users

**Risk:**
- Users can moderate content on behalf of others
- Falsified audit logs
- Accountability issues

**Current Code:**
```typescript
const { imageUrl, imageBase64, userId, contentType = 'general' } = body;
// userId is taken from request body - not verified!
```

**Fix Required:**
```typescript
// Get userId from authenticated session instead
const cookieStore = cookies();
const supabase = createServerSupabaseClient(cookieStore);
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const { imageUrl, imageBase64, contentType = 'general' } = body;
const userId = session.user.id; // Use session userId, don't trust request body
```

---

### 5. No Rate Limiting on Contact Form

**Severity:** HIGH
**Endpoint:** `/api/contact`
**Location:** `app/api/contact/route.ts:4`

**Issue:**
- No rate limiting on public contact endpoint
- No authentication required (expected, but needs protection)

**Risk:**
- Email spam
- API abuse
- Harassment
- Resend API quota exhaustion
- Cost implications

**Fix Required:**
```typescript
export async function POST(request: NextRequest) {
  // Add IP-based rate limiting for public endpoint
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  const rateLimitResult = await rateLimit(
    request,
    'contact',
    ip,
    {
      max: 3,         // Max 3 contacts
      windowMs: 3600000 // Per hour
    }
  );

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many contact attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // ... rest of contact form logic
```

---

### 6. No Rate Limiting on YouTube Search

**Severity:** HIGH
**Endpoint:** `/api/youtube-search`
**Location:** `app/api/youtube-search/route.ts:3`

**Issue:**
- No authentication or rate limiting
- Public endpoint calling YouTube API

**Risk:**
- YouTube API quota exhaustion ($$$)
- Could burn through daily quota quickly
- Cost implications if quota exceeded

**Fix Required:**
```typescript
export async function GET(request: NextRequest) {
  // Add IP-based rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  const rateLimitResult = await rateLimit(
    request,
    'youtube',
    ip,
    {
      max: 10,        // Max 10 searches
      windowMs: 60000 // Per minute
    }
  );

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many search requests. Please try again later.' },
      { status: 429 }
    );
  }

  // ... rest of YouTube search logic
```

---

### 7. Shipping Calculator Missing Rate Limiting

**Severity:** HIGH
**Endpoint:** `/api/calculate-shipping`
**Location:** `app/api/calculate-shipping/route.ts:29`

**Issue:**
- Public endpoint with no rate limiting
- Could be spammed for reconnaissance

**Risk:**
- API abuse
- Minor resource impact

**Fix Required:** Same pattern as contact form (IP-based rate limiting)

---

## MEDIUM SEVERITY FINDINGS (Should Fix Soon After Launch) ⚡

### 8. Weak Input Validation on Admin Refund

**Severity:** MEDIUM
**Endpoint:** `/api/admin/refund-order`
**Location:** `app/api/admin/refund-order/route.ts:27`

**Issue:**
- No type validation or format checking on orderId/paymentIntentId
- Could cause unexpected errors

**Fix Required:**
```typescript
const { orderId, paymentIntentId } = await request.json();

// Add type and format validation
if (!orderId || typeof orderId !== 'string' || orderId.length < 1) {
  return NextResponse.json({ error: 'Invalid orderId' }, { status: 400 });
}

if (!paymentIntentId || typeof paymentIntentId !== 'string' || !paymentIntentId.startsWith('pi_')) {
  return NextResponse.json({ error: 'Invalid paymentIntentId format' }, { status: 400 });
}
```

---

### 9. In-Memory Rate Limiting Store

**Severity:** MEDIUM
**Location:** `lib/rateLimit.ts:10`

**Issue:**
- Rate limiting uses in-memory store that resets on server restart
- Doesn't work in multi-instance deployments (Vercel edge functions)

**Current Code:**
```typescript
const store: RateLimitStore = {};
```

**Risk:**
- Rate limits bypassed by restarting server
- Ineffective in production with multiple instances
- Each server instance has its own limits

**Fix Required:**
- Implement Redis-backed rate limiting for production
- Use Upstash Redis (Vercel-compatible)
- Or use Vercel Edge Config for rate limiting

**Recommendation:**
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Use Redis for rate limiting in production
const key = `ratelimit:${type}:${identifier}`;
const count = await redis.incr(key);
if (count === 1) {
  await redis.expire(key, windowMs / 1000);
}
```

---

### 10. Calculate Shipping Missing Input Validation

**Severity:** MEDIUM
**Endpoint:** `/api/calculate-shipping`
**Location:** `app/api/calculate-shipping/route.ts:32`

**Issue:**
- No validation on `packSize` parameter against allowed values

**Fix Required:**
```typescript
import { VALID_PACK_SIZES } from '@/lib/constants';

if (!VALID_PACK_SIZES.includes(packSize)) {
  return NextResponse.json(
    { error: 'Invalid pack size. Must be 10, 20, or 50.' },
    { status: 400 }
  );
}
```

---

## LOW SEVERITY FINDINGS (Nice to Have) 💡

### 11. Email Addresses Hardcoded in Contact Form

**Severity:** LOW
**Location:** `app/api/contact/route.ts:52`

**Issue:**
```typescript
to: ['editionsrevel@gmail.com'],
```

**Recommendation:**
```typescript
to: [process.env.CONTACT_EMAIL || 'editionsrevel@gmail.com'],
```

---

### 12. Error Messages Could Leak Implementation Details

**Severity:** LOW
**Multiple Endpoints**

**Issue:**
- Some error messages expose internal details
- Example: Database error hints exposed to users

**Recommendation:**
- Log detailed errors server-side
- Return generic messages to users
- Use error tracking service (Sentry)

---

## POSITIVE FINDINGS ✅

### SQL Injection Protection
**Status:** EXCELLENT ✓

- All database operations use RPC functions or parameterized queries
- No string concatenation in queries
- Supabase client library provides built-in protection

### File Upload Validation
**Status:** EXCELLENT ✓

- Excellent magic number validation in `/lib/fileValidation.ts`
- Checks file signatures, not just extensions
- Prevents malicious file uploads
- Size limits enforced (2MB)

### Stripe Webhook Security
**Status:** EXCELLENT ✓

- Signature verification implemented correctly
- Idempotency checks prevent duplicate processing
- Uses service role key appropriately

### Payment Intent Security
**Status:** GOOD ✓

- Proper authentication implemented
- Rate limiting present
- Validates minimum amounts
- Uses Stripe's secure API

### Admin Endpoint Security
**Status:** GOOD ✓

- Proper role-based authorization check
- Uses RPC function to verify admin role
- Prevents privilege escalation

---

## ENDPOINT SECURITY SCORECARD

| Endpoint | Auth | Authz | Input Val | SQL Inj | Rate Limit | File Val | Overall |
|----------|------|-------|-----------|---------|------------|----------|---------|
| `/api/process-sticker-order` | ✓ | N/A | ✓ | ✓ | ✗ **CRITICAL** | N/A | **FIX REQUIRED** |
| `/api/generate-printful-stickers` | ✗ **CRITICAL** | N/A | ✓ | N/A | ✗ | N/A | **FIX REQUIRED** |
| `/api/generate-sticker-pdf` | ✗ **CRITICAL** | N/A | ✓ | N/A | ✗ | N/A | **FIX REQUIRED** |
| `/api/contact` | N/A | N/A | ✓ | N/A | ✗ **HIGH** | N/A | **FIX REQUIRED** |
| `/api/moderate-image` | ⚠ **HIGH** | N/A | ✓ | N/A | ✓ | ✓ | **FIX REQUIRED** |
| `/api/moderate-text` | ⚠ **HIGH** | N/A | ✓ | N/A | ✓ | N/A | **FIX REQUIRED** |
| `/api/youtube-search` | ✗ **HIGH** | N/A | ✓ | N/A | ✗ | N/A | **FIX REQUIRED** |
| `/api/calculate-shipping` | ✗ **HIGH** | N/A | ⚠ | N/A | ✗ | N/A | **FIX REQUIRED** |
| `/api/admin/refund-order` | ✓ | ✓ | ⚠ | ✓ | ✗ | N/A | **REVIEW** |
| `/api/create-payment-intent` | ✓ | N/A | ✓ | N/A | ✓ | N/A | **GOOD** ✓ |
| `/api/test-generate-stickers` | ✓ | N/A | ✓ | N/A | N/A | N/A | **GOOD** ✓ |
| `/api/webhooks/stripe` | ✓ | N/A | ✓ | ✓ | N/A | N/A | **EXCELLENT** ✓ |

**Legend:** ✓ Implemented | ⚠ Partial | ✗ Missing | N/A Not Applicable

---

## CORS ANALYSIS

**Status:** DEFAULT NEXT.JS CONFIGURATION

**Finding:**
- No explicit CORS configuration found in API routes
- Next.js handles CORS automatically
- May be too permissive for production

**Recommendation:**
Add middleware to restrict API origins:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only check API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_BASE_URL,
      'https://lightmyfire.app',
      'https://www.lightmyfire.app'
    ];

    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse('CORS not allowed', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## PRIORITY ACTION PLAN

### 🚨 Before Launch (Blockers) - DAY 1

**CRITICAL FIXES - Must complete before public launch:**

1. **Add authentication to sticker generation endpoints**
   - [ ] Fix `/api/generate-printful-stickers` (CRITICAL)
   - [ ] Fix `/api/generate-sticker-pdf` (CRITICAL)
   - Estimated time: 30 minutes

2. **Add rate limiting to order processing**
   - [ ] Fix `/api/process-sticker-order` (CRITICAL)
   - Estimated time: 15 minutes

3. **Fix user identity verification in moderation**
   - [ ] Fix `/api/moderate-image` (HIGH)
   - [ ] Fix `/api/moderate-text` (HIGH)
   - Estimated time: 20 minutes

**Total estimated time: ~1.5 hours**

### ⚠️ High Priority (Week 1) - DAYS 2-3

4. **Add rate limiting to public endpoints**
   - [ ] Fix `/api/contact`
   - [ ] Fix `/api/youtube-search`
   - [ ] Fix `/api/calculate-shipping`
   - Estimated time: 1 hour

5. **Upgrade rate limiting to Redis**
   - [ ] Set up Upstash Redis
   - [ ] Migrate rate limiting to Redis
   - [ ] Test in production
   - Estimated time: 2 hours

### ⚡ Medium Priority (Month 1)

6. **Strengthen input validation**
   - [ ] Admin refund endpoint
   - [ ] Calculate shipping endpoint
   - Estimated time: 30 minutes

7. **Add CORS middleware**
   - [ ] Implement origin checking
   - [ ] Test with production domains
   - Estimated time: 30 minutes

8. **Move hardcoded values to environment**
   - [ ] Contact email
   - [ ] Fulfillment email
   - Estimated time: 15 minutes

---

## TESTING CHECKLIST

### Security Testing Before Launch

**Authentication Tests:**
- [ ] Try accessing `/api/generate-printful-stickers` without auth (should fail 401)
- [ ] Try accessing `/api/generate-sticker-pdf` without auth (should fail 401)
- [ ] Verify admin endpoints reject non-admin users

**Rate Limiting Tests:**
- [ ] Submit 10 rapid orders (should be rate limited after 5)
- [ ] Submit 5 rapid contact forms (should be rate limited after 3)
- [ ] Make 20 YouTube searches (should be rate limited after 10)

**Authorization Tests:**
- [ ] Try to refund order as non-admin (should fail)
- [ ] Try to moderate with wrong userId (should use session instead)

**Input Validation Tests:**
- [ ] Submit invalid pack size to shipping calculator (should fail 400)
- [ ] Submit invalid payment intent ID to refund (should fail 400)
- [ ] Submit oversized image to moderate (should fail 400)

---

## MONITORING RECOMMENDATIONS

**Set up monitoring for:**

1. **Rate Limit Violations**
   - Alert when threshold exceeded
   - Track abusive IPs

2. **Authentication Failures**
   - Monitor 401 responses
   - Alert on spike

3. **Error Rates**
   - Track 500 errors
   - Alert on increase

4. **API Usage**
   - YouTube API quota
   - Resend email quota
   - Stripe API calls

**Recommended Tools:**
- Sentry for error tracking
- Vercel Analytics for performance
- Upstash Redis for rate limiting
- Stripe Dashboard for payment monitoring

---

## SUMMARY STATISTICS

- **Total Endpoints Audited:** 12
- **Critical Issues:** 3 🚨
- **High Severity Issues:** 4 ⚠️
- **Medium Severity Issues:** 3 ⚡
- **Low Severity Issues:** 2 💡
- **Endpoints Requiring Fixes:** 8
- **SQL Injection Risk:** 0 ✓ (Excellent)
- **Estimated Fix Time:** ~5 hours total

---

## CONCLUSION

The LightMyFire application has **solid security foundations** with excellent SQL injection protection, file validation, and webhook security. However, **critical authentication and rate limiting gaps** must be addressed before launch.

**Launch Readiness:** ⚠️ **NOT READY** - 3 critical issues blocking launch

**Immediate Action Required:**
1. Add authentication to unauthenticated sticker generation endpoints
2. Add rate limiting to order processing endpoint
3. Fix user identity verification in moderation endpoints

**Estimated Time to Launch Readiness:** ~1.5 hours of focused development

Once these critical issues are resolved, the application will be secure enough for public launch, with remaining issues addressed in the first week post-launch.

---

**Report Generated:** 2025-11-07
**Next Review:** After critical fixes applied
**Sign-off:** Pending fixes
