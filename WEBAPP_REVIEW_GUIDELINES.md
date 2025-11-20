## Webapp Review Guidelines

This document collects the findings from `_Webapp Review_ Security & Logic .md` into a single reference for the team. Each section includes the critical actions, why they matter, and the code files or snippets that illustrate the desired end state. Tackle sections progressively, starting with the payment workflow hardening and validation, then frontend safeguards, and finally the database/scripts cleanups.

### 1. Payment Workflow & Ghost Payment Guardrail

**Goal:** Never accept money without an order record. Frontend, API, and webhook logic must assume the database is the source of truth.

**Actions:**

1. **Rework `create-payment-intent` (`app/api/create-payment-intent/route.ts`):**
   - Persist `sticker_orders` with `status = 'pending_payment'`, `order_details`, `shipping_address_json`, `lighter_ids`, and `payment_intent_id` before calling Stripe.
   - Store the incoming payload (pack, shipping, lighter customizations) so a failed fulfillment can resume offline.
   - Create an index on `payment_intent_id` and expand the `status` constraint to include `pending_payment`.
   - Example response snippet:
     ```ts
     const result = await supabaseAdmin
       .from('sticker_orders')
       .upsert(
         { payment_intent_id: stripePayment.id, user_id: session.user.id, order_details: lighterData, status: 'pending_payment' },
         { onConflict: 'payment_intent_id' }
       )
       .select()
       .single();
     ```

2. **Refactor `process-sticker-order` (`app/api/process-sticker-order/route.ts`):**
   - Fetch the existing order by `payment_intent_id`.
   - Skip `insert` operations; update fields such as `status`, `lighter_ids`, `sticker_file_url`.
   - Use the saved `order_details`/`shipping_address_json` instead of expecting new payloads.
   - Guard against duplicate fulfillment using idempotent status checks.

3. **Frontend `StripePaymentForm` (`app/[locale]/save-lighter/StripePaymentForm.tsx`):**
   - Send the full payload to `/api/create-payment-intent`.
   - After Stripe confirms payment, call `/api/process-sticker-order` with only the `paymentIntentId`.
   - This keeps the frontend lightweight and avoids lost orders when the user disconnects mid-flow.

4. **Webhook alignment (`app/api/webhooks/stripe/route.ts`):**
   - Drop the redundant `SELECT` guard; rely on the unique constraint to detect duplicates.
   - Use `payment_intent_id` from metadata to find and update the order status.
   - Retry fulfillment or mark the order if the webhook runs after the user closed the tab.

### 2. Input Validation & Shared Constants

**Why it matters:** Manual `if (!field)` checks introduced bugs and security holes. Use schema validation to ensure consistency and provide helpful errors.

**Guidelines:**

- Define reusable Zod schemas near the API route or in `lib/schemas.ts` and `safeParse` incoming bodies:
  ```ts
  const CreateIntentSchema = z.object({
    orderId: z.string().min(1),
    currency: z.string().length(3).default('eur'),
    cardholderEmail: z.string().email(),
    packSize: z.enum(['10', '20', '50']),
    lighterData: z.array(z.object({ id: z.string(), userMessage: z.string().max(120) })).min(1),
    shippingAddress: z.object({ name: z.string().min(1), country: z.string().length(2) }),
  });
  const parsed = CreateIntentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
  }
  ```

- Keep all magic numbers (pricing multipliers, retry limits, shipping offsets) in `lib/constants.ts` and import them wherever needed.
- Centralize env checks through `lib/env.ts` (used by all routes) and avoid direct `process.env` reads.
- Add a `createServiceRoleClient()` helper in `lib/supabase-server.ts` so service routes share a single configuration (timeout, headers, etc.).

### 3. Frontend Stability & UX Hardening

1. **Map Component (`app/[locale]/lighter/[id]/MapComponent.tsx`):**
   - Lazy-load via `dynamic(() => import('./MapComponent'), { ssr: false })` in the parent page (`[id]/page.tsx`) to keep Leaflet out of SSR builds.

2. **Order Success page (`app/[locale]/save-lighter/order-success/OrderSuccessContent.tsx`):**
   - Read the authoritative `payment_intent` query param, poll Supabase for the matching `sticker_orders` record, and render real `orderDetails`.
   - Fall back to a “Not found” state if the record never appears, preventing spoofed success screens.
   - Example fetch pattern:
     ```ts
     const supabase = createBrowserClient(envUrl, envKey);
     const { data: order } = await supabase
       .from('sticker_orders')
       .select('*')
       .eq('payment_intent_id', paymentIntentId)
       .single();
     ```

3. **Shipping recalculation (`SaveLighterFlow.tsx`):**
   - Introduce a `useEffect` that reruns `handleShippingSave` or recalculates shipping whenever the selected pack size changes after an address has already been saved.

4. **Testing expansion:**
   - Add React Testing Library coverage for `SaveLighterFlow` and `StripePaymentForm` (e.g., “Pay button disabled without shipping”, “Payment form hidden until pack selection”).
   - Continue mocking Supabase/Next headers in API tests, as already done in `tests/api`.

### 4. Database Functions & Migrations

1. **`admin_get_all_orders` pagination (`supabase/migrations/20251112000001_fix_admin_functions.sql`):**
   - Limit results, accept `p_page_size`/`p_page_number`, and return a `total_count` column.
   - Helps admin UI scale beyond the prototype volume.

2. **`create_bulk_lighters` PIN generation (`supabase/migrations/20251112000003_add_order_workflow_functions.sql`):**
   - Wrap the insert attempt in a `BEGIN … EXCEPTION WHEN unique_violation` block and retry to avoid failing when two identical pins appear near-simultaneously.

### 5. Localization & CI Safety Nets

1. **Locales script stability (`sync-locales.js`):**
   - Document that translation files must keep the `'key': 'value'` pattern; avoid template literals or multi-line strings until a more robust parser exists.

2. **CI guard (`check-locale-sync.js`):**
   - Add this script to `package.json`'s `build` command so any missing keys abort the build before deployment:
     ```json
     "scripts": {
       "build": "node check-locale-sync.js && next build",
       ...
     }
     ```

### 6. Deployment & Security Notes

- Vercel stores secrets securely, but keep rotating `INTERNAL_AUTH_SECRET`.
- CSP, rate limiting, and internal HMAC auth are healthy; prioritize the above implementation items before tweaking these layers further.
- After each major change, rerun type generation/tests, especially API mocks and Stripe interactions. Provide structured error responses so clients know when to show warnings.

Use this document as your implementation reference: work through each numbered section, check the referenced files, and update the code accordingly. Let me know if you want me to scaffold any of these changes directly. 
