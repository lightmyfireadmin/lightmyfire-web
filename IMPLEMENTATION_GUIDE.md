# LightMyFire Implementation Guide
## Pricing, Backgrounds & Printful Integration

**Branch:** `claude/pricing-printful-implementation-review`
**Status:** Ready for Review (Not Built/Tested)
**Created:** 2025-11-07

---

## 🎯 Overview

This branch implements the three remaining launch tasks:

1. **Sticker Pricing System** - Comprehensive pricing analysis and configuration
2. **Background Generator** - Beautiful sticker sheet backgrounds with corner illustrations
3. **Printful Integration** - Automatic order fulfillment with webhooks

**⚠️ IMPORTANT:** This code has NOT been built or tested. Review before merging!

---

## 📊 1. Sticker Pricing System

### Files Created

- `STICKER_PRICING_ANALYSIS.md` - 90+ page comprehensive pricing analysis
- `lib/pricing.ts` - Pricing configuration and utilities

### Recommended Pricing

**Launch Prices (Phase 1-2):**
```
10 stickers: €19.90 (€1.99/sticker)
20 stickers: €29.90 (€1.50/sticker) - 25% discount
50 stickers: €69.90 (€1.40/sticker) - 30% discount
```

**All prices include free shipping!**

### Key Findings

**Cost Structure (per 10-pack @ 500 stickers/month):**
- Manufacturing: €6.00 (pre-made @ €0.60/sticker)
- Stripe fees: €0.47
- Shipping: €3.50
- Infrastructure: €1.20
- Marketing: €2.00
- **Total Cost:** €13.17
- **Margin:** €6.73 (34%)

**Break-Even:** ~30 packs/month or €900 revenue

**Scalability:** Margins improve significantly with volume:
- 500 stickers/month: 27-34% margin
- 1,000 stickers/month: 35-41% margin
- 2,000 stickers/month: 40-45% margin

### Usage

```typescript
import {
  STICKER_PACKS,
  getPackConfig,
  calculateNetRevenue,
  formatPrice,
  calculatePackCosts,
} from '@/lib/pricing';

// Get pack configuration
const pack = getPackConfig(20);
console.log(pack.price); // 2990 (€29.90 in cents)
console.log(pack.discount); // 25

// Calculate costs
const costs = calculatePackCosts(20, 500); // 20-pack, 500 stickers/month
console.log(costs.margin); // 709 cents (€7.09)
console.log(costs.marginPercentage); // 24%

// Format for display
const formatted = formatPrice(2990); // "€29.90"

// Calculate Stripe fee
const stripeFee = calculateStripeFee(2990); // 91 cents (€0.91)
```

### Integration Steps

1. **Update Stripe Checkout:**
   ```typescript
   // app/api/create-payment-intent/route.ts
   import { getPackConfig } from '@/lib/pricing';

   const pack = getPackConfig(packSize);
   const paymentIntent = await stripe.paymentIntents.create({
     amount: pack.price,
     currency: pack.currency,
     description: pack.description,
   });
   ```

2. **Update UI Components:**
   ```typescript
   // components/PricingCard.tsx
   import { getAllPackConfigs, formatPrice } from '@/lib/pricing';

   const packs = getAllPackConfigs(); // Returns [50, 20, 10] for anchoring

   {packs.map((pack) => (
     <PricingCard
       key={pack.size}
       size={pack.size}
       price={formatPrice(pack.price)}
       discount={pack.discount}
       badge={pack.badge}
     />
   ))}
   ```

3. **Add Analytics:**
   ```typescript
   // app/admin/dashboard/page.tsx
   import { getPricingAnalytics } from '@/lib/pricing';

   const analytics = getPricingAnalytics([
     { size: 10, quantity: 15 },
     { size: 20, quantity: 8 },
     { size: 50, quantity: 3 },
   ], 500);

   console.log(analytics.marginPercentage); // Overall margin %
   ```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=https://lightmyfire.app
```

---

## 🎨 2. Sticker Background Generator

### Files Created

- `lib/sticker-backgrounds.ts` - Background generation utilities
- `app/api/sticker-backgrounds/[theme]/[size]/route.ts` - API endpoint

### Available Themes

1. **FIRE** - Warm orange/red with flame illustrations
2. **OCEAN** - Cool blue with wave and compass illustrations
3. **FOREST** - Green with leaf and tree illustrations
4. **SUNSET** - Warm sunset with sun and mountain illustrations
5. **GALAXY** - Purple/pink with star and planet illustrations
6. **MINIMAL** - Clean monochrome with geometric patterns

### Sheet Sizes

- **SMALL:** 4" × 6" (2400 × 3600 px @ 600 DPI)
- **MEDIUM:** 8.5" × 11" (5100 × 6600 px @ 600 DPI)
- **LARGE:** 12" × 18" (7200 × 10800 px @ 600 DPI)

### Usage

```typescript
import {
  generateStickerBackground,
  getAllThemes,
  BACKGROUND_THEMES,
} from '@/lib/sticker-backgrounds';

// Generate SVG background
const svg = generateStickerBackground('FIRE', 'MEDIUM');

// Get all themes for UI
const themes = getAllThemes();
// [
//   { id: 'FIRE', name: 'Fire & Flame', colors: {...}, ... },
//   { id: 'OCEAN', name: 'Ocean Journey', colors: {...}, ... },
//   ...
// ]
```

### API Endpoints

**Get Background SVG:**
```
GET /api/sticker-backgrounds/{theme}/{size}

Examples:
GET /api/sticker-backgrounds/fire/medium
GET /api/sticker-backgrounds/ocean/large
GET /api/sticker-backgrounds/minimal/small
```

**Response:** SVG image (600 DPI, print-ready)

### Integration with Printful

```typescript
import { getPrintfulTemplateConfig } from '@/lib/sticker-backgrounds';

// Get configuration for Printful API
const config = getPrintfulTemplateConfig('FIRE', 'MEDIUM');

// config.files[0].url will be:
// https://lightmyfire.app/api/sticker-backgrounds/fire/medium
```

### Corner Illustrations

Each theme includes 4 corner illustrations:
- **Top Left:** Main illustration (largest, most detailed)
- **Top Right:** Secondary illustration (mirrored)
- **Bottom Left:** Tertiary illustration (lighter opacity)
- **Bottom Right:** Accent illustration (subtle)

**Themes:**
- **Flames:** Multi-layered fire with gradients
- **Waves:** Ocean waves with compass
- **Leaves:** Various leaf shapes rotated
- **Sun:** Sun with rays and mountains
- **Stars:** Star patterns with planets
- **Geometric:** Squares and circles

### Customization

To add a new theme, extend `BACKGROUND_THEMES` and `CORNER_ILLUSTRATIONS`:

```typescript
export const BACKGROUND_THEMES = {
  // ... existing themes
  CUSTOM: {
    name: 'Custom Theme',
    colors: {
      primary: '#FF0000',
      secondary: '#00FF00',
      accent: '#0000FF',
      background: '#000000',
    },
    illustration: 'custom',
    description: 'Your custom theme description',
  },
};

export const CORNER_ILLUSTRATIONS = {
  // ... existing illustrations
  custom: {
    topLeft: `<g><!-- SVG path here --></g>`,
    topRight: `<g><!-- SVG path here --></g>`,
    bottomLeft: `<g><!-- SVG path here --></g>`,
    bottomRight: `<g><!-- SVG path here --></g>`,
  },
};
```

---

## 📦 3. Printful Integration

### Files Created

- `lib/printful.ts` - Printful API client
- `app/api/webhooks/printful/route.ts` - Webhook handler

### Features

✅ **Automatic Order Creation** - Creates orders in Printful when payment succeeds
✅ **Order Confirmation** - Auto-confirms orders for fulfillment
✅ **Shipping Tracking** - Receives tracking info via webhooks
✅ **Email Notifications** - Sends shipping notifications to customers
✅ **Order Status Sync** - Keeps database in sync with Printful
✅ **Webhook Verification** - HMAC signature validation
✅ **Error Handling** - Graceful failure with logging

### Configuration

**Printful Product:**
- **Product:** Kiss Cut Sticker Sheet
- **Size:** 8.5" × 11"
- **Variant ID:** 9413
- **Quality:** 600 DPI required
- **Border:** White kiss-cut

**Packing Slip:**
- LightMyFire logo
- Custom welcome message
- Usage instructions
- Support email

### Environment Variables

```bash
# .env.local (required)
PRINTFUL_API_KEY=your_printful_api_key_here
PRINTFUL_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_BASE_URL=https://lightmyfire.app
```

### Usage

```typescript
import { createStickerOrder, getPrintfulOrderStatus } from '@/lib/printful';

// Create order in Printful
const result = await createStickerOrder({
  orderId: 'ORD-12345', // Our internal order ID
  packSize: 20,
  stickerPdfUrl: 'https://example.com/stickers.pdf',
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    address1: '123 Main St',
    city: 'Paris',
    countryCode: 'FR',
    zip: '75001',
  },
  retailCosts: {
    subtotal: 2990, // €29.90 in cents
    shipping: 0, // Free shipping (absorbed in price)
  },
  backgroundTheme: 'fire',
});

if (result.success) {
  console.log('Printful order created:', result.printfulOrderId);
  console.log('Estimated delivery:', result.estimatedDelivery);
} else {
  console.error('Order failed:', result.error);
}

// Check order status
const status = await getPrintfulOrderStatus(printfulOrderId);
console.log(status.status); // 'draft' | 'pending' | 'fulfilled' | 'canceled'
console.log(status.shipping.trackingNumber);
```

### Integration Flow

**1. Customer Places Order:**
```typescript
// app/api/process-sticker-order/route.ts

// After successful Stripe payment...
const printfulResult = await createStickerOrder({
  orderId: dbOrder.id,
  packSize: body.packSize,
  stickerPdfUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/stickers/${lightersData}`,
  customer: {
    name: body.customerName,
    email: body.customerEmail,
    address1: body.address1,
    city: body.city,
    countryCode: body.countryCode,
    zip: body.zip,
  },
  retailCosts: {
    subtotal: packPrice,
    shipping: 0,
  },
});

// Save Printful order ID to database
await supabase
  .from('sticker_orders')
  .update({ printful_order_id: printfulResult.printfulOrderId })
  .eq('id', dbOrder.id);
```

**2. Printful Fulfills Order:**
- Printful downloads sticker design
- Prints at 600 DPI
- Kiss-cuts stickers
- Packages with packing slip
- Ships to customer

**3. Webhook Updates Status:**
```typescript
// app/api/webhooks/printful/route.ts

// Printful sends webhook when package ships
POST /api/webhooks/printful
{
  "type": "package_shipped",
  "data": {
    "order": { "id": 123456, "external_id": "ORD-12345" },
    "shipment": {
      "tracking_number": "1Z999AA10123456784",
      "tracking_url": "https://...",
      "carrier": "UPS"
    }
  }
}

// Handler updates database and sends email
await sendOrderShippedEmail({
  customerEmail: order.customer_email,
  trackingNumber: shipment.tracking_number,
  trackingUrl: shipment.tracking_url,
});
```

### Webhook Events Handled

| Event | Action |
|-------|--------|
| `package_shipped` | Update status, send tracking email |
| `package_returned` | Mark as returned, alert admin |
| `order_failed` | Mark as failed, process refund |
| `order_canceled` | Mark as canceled, refund if needed |
| `order_put_hold` | Update hold status, notify customer |
| `order_remove_hold` | Clear hold status |

### Database Schema

**Update `sticker_orders` table:**
```sql
ALTER TABLE sticker_orders ADD COLUMN IF NOT EXISTS printful_order_id INTEGER;
ALTER TABLE sticker_orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE sticker_orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;
ALTER TABLE sticker_orders ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE sticker_orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE sticker_orders ADD COLUMN IF NOT EXISTS on_hold BOOLEAN DEFAULT FALSE;
ALTER TABLE sticker_orders ADD COLUMN IF NOT EXISTS hold_reason TEXT;
ALTER TABLE sticker_orders ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE sticker_orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Create index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_sticker_orders_printful_id
ON sticker_orders(printful_order_id);
```

### Printful Setup Steps

1. **Create Printful Account:**
   - Go to https://www.printful.com/
   - Sign up for business account
   - Verify email and complete onboarding

2. **Get API Key:**
   - Dashboard → Settings → Stores
   - Click "Add Store" → "Manual order platform"
   - Copy API key
   - Add to `.env`: `PRINTFUL_API_KEY=...`

3. **Configure Webhook:**
   - Dashboard → Settings → Webhooks
   - Add webhook URL: `https://lightmyfire.app/api/webhooks/printful`
   - Select events:
     - ✅ Package shipped
     - ✅ Package returned
     - ✅ Order failed
     - ✅ Order canceled
     - ✅ Order put on hold
     - ✅ Order removed from hold
   - Copy webhook secret
   - Add to `.env`: `PRINTFUL_WEBHOOK_SECRET=...`

4. **Test Integration:**
   ```bash
   # Test order creation (development only)
   curl -X POST http://localhost:3000/api/test-printful \
     -H "Content-Type: application/json" \
     -d '{"packSize": 10}'

   # Test webhook (development only)
   curl -X GET http://localhost:3000/api/webhooks/printful?orderId=123
   ```

5. **Production Checklist:**
   - [ ] PRINTFUL_API_KEY configured
   - [ ] PRINTFUL_WEBHOOK_SECRET configured
   - [ ] Webhook URL registered in Printful
   - [ ] Database schema updated
   - [ ] Test order placed successfully
   - [ ] Webhook events received and handled
   - [ ] Email notifications working

---

## 🔄 Complete Integration Flow

### End-to-End Order Process

```
1. Customer visits /save-lighter
   ↓
2. Selects pack size (10, 20, or 50 stickers)
   ↓
3. Enters shipping info and pays via Stripe
   ↓
4. Payment webhook creates order in sticker_orders table
   ↓
5. Backend generates sticker PDF with unique codes
   ↓
6. Creates Printful order with PDF + background
   ↓
7. Printful confirms and starts fulfillment
   ↓
8. Customer receives order confirmation email
   ↓
9. Printful prints and ships (3-5 business days)
   ↓
10. Webhook updates status to 'shipped'
    ↓
11. Customer receives shipping notification with tracking
    ↓
12. Package arrives (5-10 business days)
    ↓
13. Customer applies stickers to lighters
    ↓
14. Stories begin! 🔥
```

### Error Handling

**Payment Fails:**
- Order not created
- Customer sees error message
- Can retry immediately

**Printful Order Fails:**
- Database order marked as 'failed'
- Admin alerted via logging
- Customer refunded automatically
- Manual review required

**Webhook Delivery Fails:**
- Printful retries up to 10 times (exponential backoff)
- Admin can manually sync via API
- Order status can be checked on demand

**Shipment Issues:**
- Package returned → Customer notified, refund processed
- Lost package → Printful replaces at no cost
- Damaged package → Customer contacts support, replacement sent

---

## 🧪 Testing Recommendations

### Unit Tests

```typescript
// lib/__tests__/pricing.test.ts
import { calculatePackCosts, formatPrice } from '@/lib/pricing';

test('calculates 10-pack costs correctly', () => {
  const costs = calculatePackCosts(10, 500);
  expect(costs.revenue).toBe(1990);
  expect(costs.margin).toBeGreaterThan(0);
  expect(costs.marginPercentage).toBeGreaterThan(25);
});

test('formats prices correctly', () => {
  expect(formatPrice(1990)).toBe('€19.90');
  expect(formatPrice(2990)).toBe('€29.90');
});
```

```typescript
// lib/__tests__/sticker-backgrounds.test.ts
import { generateStickerBackground, getAllThemes } from '@/lib/sticker-backgrounds';

test('generates valid SVG', () => {
  const svg = generateStickerBackground('FIRE', 'MEDIUM');
  expect(svg).toContain('<svg');
  expect(svg).toContain('width="5100"');
  expect(svg).toContain('height="6600"');
});

test('returns all themes', () => {
  const themes = getAllThemes();
  expect(themes).toHaveLength(6);
  expect(themes[0]).toHaveProperty('name');
  expect(themes[0]).toHaveProperty('colors');
});
```

```typescript
// lib/__tests__/printful.test.ts
import { createStickerOrder } from '@/lib/printful';

test('creates Printful order', async () => {
  const result = await createStickerOrder({
    orderId: 'TEST-001',
    packSize: 10,
    stickerPdfUrl: 'https://example.com/test.pdf',
    customer: {
      name: 'Test Customer',
      email: 'test@example.com',
      address1: '123 Test St',
      city: 'Paris',
      countryCode: 'FR',
      zip: '75001',
    },
    retailCosts: {
      subtotal: 1990,
      shipping: 0,
    },
  });

  expect(result.success).toBe(true);
  expect(result.printfulOrderId).toBeDefined();
});
```

### Integration Tests

**Test Order Flow (Staging):**
```bash
# 1. Create test customer
# 2. Place order for 10 stickers
# 3. Complete payment with Stripe test card
# 4. Verify order created in database
# 5. Verify Printful order created
# 6. Check Printful dashboard for order
# 7. Wait for webhook (or trigger manually)
# 8. Verify status updated in database
# 9. Verify email sent to customer
```

**Test Background Generation:**
```bash
# Visit in browser:
https://your-app.com/api/sticker-backgrounds/fire/medium
https://your-app.com/api/sticker-backgrounds/ocean/large
https://your-app.com/api/sticker-backgrounds/minimal/small

# Should return valid SVG images
# Download and check in Illustrator/Inkscape
# Verify 600 DPI quality
```

**Test Webhook Handling:**
```bash
# Use Printful's webhook testing tool
# Or use curl to send test webhook:
curl -X POST https://your-app.com/api/webhooks/printful \
  -H "Content-Type: application/json" \
  -H "X-Pf-Signature: test_signature" \
  -d @test-webhook-payload.json

# Check logs for handling
# Verify database updated
# Verify email sent (if applicable)
```

---

## 📋 Deployment Checklist

### Before Merging

- [ ] Code review completed
- [ ] All tests passing
- [ ] TypeScript builds without errors
- [ ] No console errors in browser
- [ ] Pricing calculations verified
- [ ] Background images render correctly
- [ ] Printful test order succeeds

### Environment Variables

```bash
# Production .env
PRINTFUL_API_KEY=prod_key_here
PRINTFUL_WEBHOOK_SECRET=prod_secret_here
NEXT_PUBLIC_BASE_URL=https://lightmyfire.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
RESEND_API_KEY=re_live_...
```

### Database Migrations

```bash
# Run in Supabase SQL Editor:
cat database-migrations.sql | pbcopy
# Paste and execute in SQL Editor
```

### Webhook Configuration

```bash
# Printful Dashboard:
1. Go to Settings → Webhooks
2. Update webhook URL to production
3. Test webhook delivery
4. Verify events are received

# Stripe Dashboard:
1. Go to Developers → Webhooks
2. Update webhook URL to production
3. Test webhook delivery
4. Verify events are received
```

### Post-Deployment Verification

```bash
# 1. Test complete order flow
# 2. Verify pricing displays correctly
# 3. Test background generation
# 4. Place test order (small quantity)
# 5. Verify Printful receives order
# 6. Wait for fulfillment
# 7. Verify webhook updates status
# 8. Verify tracking email sent
# 9. Verify package arrives
# 10. Confirm sticker quality

# Monitor for 24-48 hours:
- Check error logs
- Monitor webhook delivery
- Track order success rate
- Review customer feedback
```

---

## 🐛 Known Limitations

### Pricing System

1. **Single Currency:** Only EUR supported currently
   - Future: Multi-currency with regional pricing
   - Workaround: Use Stripe automatic currency conversion

2. **Fixed Costs:** Assumes constant infrastructure costs
   - Reality: Costs scale with volume
   - Solution: Periodically update cost assumptions

3. **No Dynamic Pricing:** Prices are static in code
   - Future: Admin dashboard to update prices
   - Workaround: Update code and redeploy

### Background Generator

1. **Server-Side Only:** Generates on API request
   - Could be slow for first request
   - Solution: Cache SVGs with CDN

2. **Limited Themes:** Only 6 themes available
   - Future: User-uploaded custom backgrounds
   - Workaround: Add more themes as needed

3. **No Preview:** Users can't preview backgrounds before ordering
   - Future: Background preview in checkout
   - Workaround: Show theme samples on product page

### Printful Integration

1. **No Order Modification:** Once confirmed, orders can't be modified
   - Printful limitation
   - Workaround: Cancel and recreate order (if not fulfilled)

2. **Limited Product Support:** Only kiss-cut sticker sheets
   - Future: Add more Printful products
   - Workaround: Create new product configurations

3. **Webhook Delays:** Status updates may take several hours
   - Printful processes orders in batches
   - Workaround: Provide estimated delivery times, not real-time tracking

4. **No Bulk Discounts:** Printful pricing is per-sheet
   - Higher volume doesn't reduce per-unit cost
   - Alternative: Switch to bulk manufacturer at 1,000+ stickers/month

---

## 💰 Cost Summary

### Implementation Costs (One-Time)

- Development: ✅ Completed
- Testing: 2-4 hours
- Initial sticker order (200 stickers): €120

**Total: ~€120**

### Monthly Operating Costs (at 500 stickers/month)

| Service | Cost |
|---------|------|
| Vercel (hosting) | €20 |
| Supabase (database) | €25 |
| Domain & CDN | €5 |
| Resend (email) | €10 |
| Marketing | €100 |
| **Total** | **€160/month** |

### Variable Costs (Per Order)

**10-pack @ €19.90:**
- Manufacturing: €6.00
- Stripe: €0.47
- Shipping: €3.50
- **Total:** €9.97
- **Margin:** €9.93 (50%)

**20-pack @ €29.90:**
- Manufacturing: €12.00
- Stripe: €0.91
- Shipping: €3.50
- **Total:** €16.41
- **Margin:** €13.49 (45%)

**50-pack @ €69.90:**
- Manufacturing: €27.50
- Stripe: €1.79
- Shipping: €5.50
- **Total:** €34.79
- **Margin:** €35.11 (50%)

---

## 🚀 Next Steps

### Immediate (Before Launch)

1. **Review this code carefully**
   - Check calculations in pricing analysis
   - Verify Printful API usage
   - Test background generation

2. **Build and test locally**
   ```bash
   npm run build
   npm run start
   ```

3. **Order test stickers**
   - Place a small test order
   - Verify quality and printing
   - Check packaging and packing slip

4. **Configure production environment**
   - Set up Printful account
   - Get API keys
   - Configure webhooks

### Short-Term (First Month)

5. **Launch with MVP pricing**
   - €19.90 / €29.90 / €69.90
   - Monitor conversion rates
   - Gather customer feedback

6. **Track key metrics**
   - Orders per day/week
   - Average order size
   - Fulfillment time
   - Customer satisfaction
   - Margin per order

7. **Iterate based on data**
   - Adjust prices if needed
   - Add new background themes
   - Optimize fulfillment process

### Long-Term (3-6 Months)

8. **Scale manufacturing**
   - Move to bulk orders if volume justifies
   - Negotiate better Printful rates
   - Consider in-house fulfillment

9. **Expand product line**
   - Different sticker sizes
   - Sticker books
   - Merchandise (t-shirts, etc.)

10. **International expansion**
    - Regional pricing
    - Local fulfillment centers
    - Multi-currency support

---

## 📞 Support & Resources

### Documentation

- **Printful API Docs:** https://developers.printful.com/
- **Stripe API Docs:** https://stripe.com/docs/api
- **Supabase Docs:** https://supabase.com/docs

### Internal References

- `STICKER_PRICING_ANALYSIS.md` - Detailed cost breakdown
- `lib/pricing.ts` - Pricing configuration
- `lib/sticker-backgrounds.ts` - Background generation
- `lib/printful.ts` - Printful API client

### Getting Help

If you encounter issues:

1. Check error logs in Vercel/Supabase
2. Verify environment variables are set
3. Test webhooks using Printful's test tool
4. Review Printful dashboard for order status
5. Check Stripe dashboard for payment issues

---

## ✅ Implementation Checklist

Copy this checklist when implementing:

### Setup
- [ ] Review all code in this branch
- [ ] Run `npm install` to ensure dependencies
- [ ] Build successfully (`npm run build`)
- [ ] No TypeScript errors

### Configuration
- [ ] Create Printful account
- [ ] Get Printful API key
- [ ] Configure Printful webhook
- [ ] Add environment variables to production
- [ ] Update database schema (if needed)

### Testing
- [ ] Test pricing calculations manually
- [ ] Generate all background themes
- [ ] Place test order through Printful
- [ ] Verify webhook delivery
- [ ] Test email notifications
- [ ] Verify tracking updates

### Launch
- [ ] Merge to main branch
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Place real test order
- [ ] Verify end-to-end flow
- [ ] Update documentation with learnings

---

**Ready for Review! 🎉**

This implementation is complete but **untested**. Please review carefully before merging and deploying to production.

**Questions?** Review the code, test locally, and iterate as needed!
