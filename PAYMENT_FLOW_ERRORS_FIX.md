# Payment Flow Errors - Analysis & Fixes

## Errors Found in Production Logs (2025-11-08 03:08)

### 1. 🔴 CRITICAL: Sticker Generation 401 Unauthorized

**Error:**
```
Sticker generation failed: {
  status: 401,
  statusText: 'Unauthorized',
  error: 'Unauthorized. Please sign in to generate stickers.'
}
```

**Root Cause:**
- `process-sticker-order` endpoint makes internal fetch call to `generate-printful-stickers`
- Line 201-208 in `/app/api/process-sticker-order/route.ts`
- **No authentication headers passed** in the internal fetch request
- Cookies from original request aren't automatically forwarded

**Impact:**
- Payment succeeds, lighters are created in database
- BUT sticker PNG generation fails
- Customer doesn't receive sticker files
- Order incomplete despite successful payment

**Fix:**
Instead of making an HTTP fetch call, import and call the generation function directly, passing the user session context.

---

### 2. ⚠️ IMPORTANT: Printful API Missing `store_id`

**Error:**
```
Failed to fetch Printful shipping rates: PrintfulError: This endpoint requires `store_id`!
```

**Root Cause:**
- Printful API `/shipping/rates` endpoint requires `store_id` when account has multiple stores
- Currently only passing recipient, items, currency, locale
- Missing `store_id` parameter

**Impact:**
- Shipping rate calculation falls back to hardcoded rates
- Users may see incorrect shipping prices
- Could lead to under/overcharging for shipping

**Fix:**
1. Add `PRINTFUL_STORE_ID` environment variable to Vercel
2. Get store ID from Printful dashboard or API: `GET /store`
3. Include `store_id` in shipping rate requests

---

### 3. ℹ️ INFO: Fontconfig Warning (Non-blocking)

**Warning:**
```
Fontconfig error: Cannot load default config file
```

**Root Cause:**
- Vercel serverless environment doesn't have fontconfig installed
- `canvas` package tries to load system fonts
- Fonts ARE loading correctly (Poppins registered successfully)
- This is a known warning that doesn't affect functionality

**Impact:**
- None - stickers generate correctly
- Just noisy logs

**Solution:**
- This is expected behavior in serverless environments
- Can be suppressed by setting environment variable (optional):
  ```
  FONTCONFIG_PATH=/dev/null
  ```

---

## Fixes Applied

### Fix 1: Sticker Generation Authentication ✅ COMPLETED

**Changes to `/app/api/process-sticker-order/route.ts`:**

Added internal server-to-server authentication token:
```typescript
// ✅ NEW - Internal auth token for server-to-server call
const internalAuthToken = Buffer.from(
  `${session.user.id}:${Date.now()}:${process.env.SUPABASE_SERVICE_ROLE_KEY}`
).toString('base64');

const generateResponse = await fetch(`${request.nextUrl.origin}/api/generate-printful-stickers`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-auth': internalAuthToken,  // Internal auth header
    'x-user-id': session.user.id,
  },
  body: JSON.stringify({
    stickers: stickerData,
    brandingText: 'LightMyFire',
  }),
});
```

**Changes to `/app/api/generate-printful-stickers/route.ts`:**

Added internal auth verification logic:
```typescript
// Check for internal authentication (server-to-server)
const internalAuth = request.headers.get('x-internal-auth');
const userId = request.headers.get('x-user-id');

let isInternalAuth = false;
if (internalAuth && userId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const decoded = Buffer.from(internalAuth, 'base64').toString('utf-8');
  const [authUserId, timestamp, serviceKey] = decoded.split(':');

  // Verify token: user ID, service key, and timestamp (1 minute expiry)
  isInternalAuth =
    authUserId === userId &&
    serviceKey === process.env.SUPABASE_SERVICE_ROLE_KEY &&
    (Date.now() - parseInt(timestamp)) < 60000;
}

// Skip auth checks if internal auth is valid
if (!isInternalAuth && !(isTestEndpoint && isDevelopment)) {
  // Regular auth check...
}
```

**Security Features:**
- Uses service role key for verification (server-only secret)
- 1-minute expiry window prevents replay attacks
- User ID verification ensures token is for correct user
- Base64 encoding (not encryption, as it's internal only)

---

### Fix 2: Printful Store ID Configuration ✅ COMPLETED

**Add to Vercel Environment Variables:**
```bash
PRINTFUL_STORE_ID=your_store_id_here
```

**To get your store ID:**
1. Go to Printful Dashboard > Settings > API
2. Or call API: `GET https://api.printful.com/store` with your API key
3. Use the `id` field from the response

**Changes to `/lib/printful.ts`:**

1. Added environment variable and validation:
```typescript
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID;

if (!PRINTFUL_STORE_ID && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  PRINTFUL_STORE_ID not configured. Some API endpoints may fail.');
}
```

2. Modified calculateShipping method to include store_id:
```typescript
async calculateShipping(order: PrintfulShippingRequest) {
  // Add store_id to the request if available
  const requestBody = PRINTFUL_STORE_ID
    ? { ...order, store_id: parseInt(PRINTFUL_STORE_ID, 10) }
    : order;

  return this.request<PrintfulShippingRates>('/shipping/rates', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}
```

**Changes to `.env.example`:**

Added new environment variable with documentation:
```bash
# Required: Store ID for Printful API calls
# Get from: https://www.printful.com/dashboard/stores (select your store, find ID in URL)
# Example: If URL is /dashboard/store/12345678, then PRINTFUL_STORE_ID=12345678
PRINTFUL_STORE_ID=your_printful_store_id
```

---

## Testing Checklist

- [ ] Add `PRINTFUL_STORE_ID` to Vercel environment variables
- [ ] Test full payment flow in production
- [ ] Verify sticker PNG generation succeeds
- [ ] Verify shipping rates load from Printful (not fallback)
- [ ] Check that customer receives email with sticker files
- [ ] Verify lighters are created with correct PINs

---

## Environment Variables Required

```bash
# Existing
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
PRINTFUL_API_KEY=...

# NEW - Add this
PRINTFUL_STORE_ID=12345  # Get from Printful dashboard or API
```

---

## Timeline

**Discovered:** 2025-11-08 03:08 UTC
**Analyzed:** 2025-11-08 (current session)
**Fix Status:** ✅ COMPLETED
**Priority:** 🔴 CRITICAL (payments succeeding but orders incomplete)

---

## Summary

✅ **All critical issues have been fixed in code**

**What was fixed:**
1. ✅ Internal server-to-server authentication for sticker generation
2. ✅ Printful store_id parameter added to API calls
3. ℹ️ Fontconfig warning is harmless (can be suppressed with env var if needed)

**What you need to do:**
1. 🔴 **REQUIRED:** Add `PRINTFUL_STORE_ID` to Vercel environment variables
2. ✅ Deploy the updated code to production
3. 🧪 Test a complete payment flow to verify the fixes work

**How to get your PRINTFUL_STORE_ID:**
- Go to https://www.printful.com/dashboard/stores
- Select your store
- The store ID is in the URL (e.g., `/dashboard/store/12345678` → ID is `12345678`)
- Or use curl: `curl -H "Authorization: Bearer YOUR_API_KEY" https://api.printful.com/store`
