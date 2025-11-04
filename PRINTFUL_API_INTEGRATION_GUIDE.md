# Printful API Integration Guide

## Overview
This guide explains how to integrate Printful API for dynamic pricing and order fulfillment for LightMyFire sticker sheets.

## Current Status
- ✅ Sticker generation working (PNG with correct dimensions)
- ✅ Payment processing working (Stripe)
- ✅ Order emails sent to editionsrevel@gmail.com for manual fulfillment
- ⏳ Printful API integration pending (supplier evaluation in progress)

## Printful API Setup

### 1. Get API Key
1. Create a Printful account at https://www.printful.com
2. Go to Settings → Stores → API
3. Generate an API key
4. Add to `.env.local`:
   ```
   PRINTFUL_API_KEY=your_api_key_here
   ```

### 2. Product Configuration

**Sticker Sheet Specifications:**
- Product: Custom Kiss-Cut Sticker Sheet
- Size: 5.83" × 8.27" (A5)
- Resolution: 300 DPI
- Format: PNG with transparent background
- Sticker dimensions: 2cm × 5cm per sticker
- Gap between stickers: 1cm
- Reserved branding area: 3" × 3" (bottom-right, left empty on PNG)
- Stickers per sheet: 10 (8 top section + 2 bottom-left section)

**Pack Sizes:**
- Starting LightSaver: 10 stickers (1 sheet)
- Committed LightSaver: 20 stickers (2 sheets)
- Community LightSaver: 50 stickers (5 sheets)

### 3. API Endpoints Needed

#### A. Get Product Pricing
```typescript
// GET https://api.printful.com/products/{product_id}
// Returns base product pricing

interface PrintfulProduct {
  id: number;
  name: string;
  variants: Array<{
    id: number;
    name: string;
    price: string; // Base price
  }>;
}
```

#### B. Calculate Shipping Cost
```typescript
// POST https://api.printful.com/shipping/rates
// Calculate shipping cost by country

interface ShippingRateRequest {
  recipient: {
    country_code: string; // ISO 3166-1 alpha-2
    state_code?: string;
    city?: string;
    zip?: string;
  };
  items: Array<{
    variant_id: number;
    quantity: number;
  }>;
}

interface ShippingRateResponse {
  rates: Array<{
    id: string;
    name: string;
    rate: string; // Shipping cost
    currency: string;
  }>;
}
```

#### C. Create Order
```typescript
// POST https://api.printful.com/orders
// Create fulfillment order after payment

interface PrintfulOrder {
  recipient: {
    name: string;
    address1: string;
    city: string;
    state_code?: string;
    country_code: string;
    zip: string;
    email: string;
  };
  items: Array<{
    variant_id: number;
    quantity: number;
    files: Array<{
      url: string; // Public URL to PNG file
    }>;
  }>;
  retail_costs?: {
    currency: string;
    subtotal: string;
    shipping: string;
    tax: string;
  };
}
```

## Implementation Steps

### Step 1: Create Printful API Client
Create `/app/api/lib/printful.ts`:

```typescript
export class PrintfulClient {
  private apiKey: string;
  private baseUrl = 'https://api.printful.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  }

  async getProduct(productId: number) {
    return this.request(`/products/${productId}`);
  }

  async calculateShipping(request: ShippingRateRequest) {
    return this.request('/shipping/rates', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async createOrder(order: PrintfulOrder) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }
}
```

### Step 2: Create Price Calculation API Route
Create `/app/api/calculate-sticker-price/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrintfulClient } from '../lib/printful';

const STICKER_SHEET_PRODUCT_ID = 123; // Replace with actual Printful product ID

export async function POST(request: NextRequest) {
  try {
    const { quantity, country } = await request.json();

    const printful = new PrintfulClient(process.env.PRINTFUL_API_KEY!);

    // Get base product price
    const product = await printful.getProduct(STICKER_SHEET_PRODUCT_ID);
    const basePrice = parseFloat(product.variants[0].price);

    // Calculate number of sheets needed (10 stickers per sheet)
    const sheets = Math.ceil(quantity / 10);
    const productCost = basePrice * sheets;

    // Calculate shipping
    const shippingRates = await printful.calculateShipping({
      recipient: { country_code: country },
      items: [{
        variant_id: product.variants[0].id,
        quantity: sheets,
      }],
    });

    const shippingCost = parseFloat(shippingRates.rates[0].rate);
    const total = productCost + shippingCost;

    return NextResponse.json({
      productCost,
      shippingCost,
      total,
      currency: 'EUR',
      sheets,
    });
  } catch (error) {
    console.error('Price calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate price' },
      { status: 500 }
    );
  }
}
```

### Step 3: Update SaveLighterFlow to Fetch Dynamic Prices

```typescript
// Add state for pricing
const [pricing, setPricing] = useState<{
  productCost: number;
  shippingCost: number;
  total: number;
} | null>(null);

// Fetch pricing when country is selected
useEffect(() => {
  if (shippingAddress?.country && selectedPack) {
    fetch('/api/calculate-sticker-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quantity: selectedPack,
        country: shippingAddress.country,
      }),
    })
      .then(res => res.json())
      .then(data => setPricing(data))
      .catch(err => console.error('Failed to fetch pricing:', err));
  }
}, [shippingAddress?.country, selectedPack]);
```

### Step 4: Update Order Processing to Use Printful

In `/app/api/process-sticker-order/route.ts`, after generating PNG:

```typescript
// Upload PNG to temporary hosting (e.g., Supabase Storage, AWS S3, etc.)
const pngUrl = await uploadToStorage(pngBuffer, `stickers-${paymentIntentId}.png`);

// Create Printful order
const printful = new PrintfulClient(process.env.PRINTFUL_API_KEY!);
const printfulOrder = await printful.createOrder({
  recipient: {
    name: shippingAddress.name,
    address1: shippingAddress.address,
    city: shippingAddress.city,
    country_code: shippingAddress.country,
    zip: shippingAddress.postalCode,
    email: shippingAddress.email,
  },
  items: [{
    variant_id: STICKER_VARIANT_ID,
    quantity: Math.ceil(lighterData.length / 10),
    files: [{ url: pngUrl }],
  }],
});

console.log('Printful order created:', printfulOrder.id);
```

## Current Temporary Solution

While evaluating suppliers:

1. **Price Calculation**: Hardcoded in `SaveLighterFlow.tsx` (lines 156-160)
   - 10 stickers: €25.00
   - 20 stickers: €45.00
   - 50 stickers: €100.00

2. **Fulfillment**: Email-based
   - PNG sent to editionsrevel@gmail.com
   - Manual order fulfillment
   - Customer confirmation email sent

## Migration Checklist

When switching to Printful (or final supplier):

- [ ] Add PRINTFUL_API_KEY to .env.local
- [ ] Identify correct product ID for custom sticker sheets
- [ ] Test API key with GET /products endpoint
- [ ] Implement PrintfulClient class
- [ ] Create calculate-sticker-price API route
- [ ] Update SaveLighterFlow to fetch dynamic prices
- [ ] Setup file hosting for PNG uploads (Supabase Storage recommended)
- [ ] Update process-sticker-order to create Printful orders
- [ ] Test end-to-end: payment → PNG generation → Printful order creation
- [ ] Setup Printful webhooks for order status updates
- [ ] Remove email-based fulfillment (or keep as backup)
- [ ] Update customer emails with tracking information from Printful

## Testing

Use Printful sandbox environment for testing:
- Sandbox API: https://api.printful.com/orders (with confirm=false)
- Test orders won't be fulfilled or charged

## Supplier Alternatives

If not using Printful, similar APIs available from:
- **Stickermule**: Custom API, good for bulk orders
- **StickerApp**: REST API, Europe-based
- **Sticker.com**: API available, US-based
- **CustomSticker.com**: API on request

## Notes

- Keep email fulfillment as backup in case API is down
- Log all Printful orders to database for tracking
- Consider adding order status webhooks for real-time updates
- Implement retry logic for failed API calls
- Cache product pricing for 1 hour to reduce API calls
