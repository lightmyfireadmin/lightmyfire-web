# Refund Payment Function - Setup Guide

## Overview
Supabase Edge Function to handle Stripe payment refunds for LightMyFire sticker orders.

## Installation

### 1. Create Function Directory
```bash
cd /Users/utilisateur/Desktop/LMFNEW/lightmyfire-web
mkdir -p supabase/functions/refund-payment
```

### 2. Copy Function Code
Copy the contents of `REFUND_PAYMENT_FUNCTION.ts` to:
```
supabase/functions/refund-payment/index.ts
```

### 3. Configure Environment Variables
Add to Supabase project settings:
```bash
STRIPE_SECRET_KEY=sk_live_51QgeN5FayiEdCFiW...
```

Or set locally for testing:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

### 4. Deploy Function
```bash
supabase functions deploy refund-payment
```

## Usage

### Frontend Integration

#### Example: Refund from Admin Panel
```typescript
// app/[locale]/admin/refunds/page.tsx
async function processRefund(paymentIntentId: string, orderId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/refund-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          paymentIntentId,
          orderId,
          reason: 'requested_by_customer',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Refund failed')
    }

    const data = await response.json()
    console.log('Refund successful:', data)
    return data
  } catch (error) {
    console.error('Refund error:', error)
    throw error
  }
}
```

#### Example: Partial Refund
```typescript
async function processPartialRefund(
  paymentIntentId: string,
  refundAmount: number // in cents
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/refund-payment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        paymentIntentId,
        amount: refundAmount, // e.g., 1000 for €10.00
        reason: 'requested_by_customer',
      }),
    }
  )

  return response.json()
}
```

## API Reference

### Request Body

```typescript
interface RefundRequest {
  paymentIntentId: string // Required: Stripe payment intent ID
  amount?: number         // Optional: Refund amount in cents (full refund if omitted)
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' // Optional
  orderId?: string        // Optional: For reference/logging
}
```

### Success Response

```typescript
interface RefundResponse {
  success: true
  refund: {
    id: string           // Stripe refund ID
    amount: number       // Refunded amount in cents
    currency: string     // e.g., "eur"
    status: string       // e.g., "succeeded", "pending"
    reason: string | null
    created: number      // Unix timestamp
  }
  payment_intent: {
    id: string
    amount_refunded: number  // Total amount refunded
    total_amount: number     // Original payment amount
  }
}
```

### Error Response

```typescript
interface RefundError {
  error: string
  message?: string
  type?: string   // Stripe error type
  code?: string   // Stripe error code
}
```

## Error Handling

### Common Errors

1. **Payment not succeeded**
```json
{
  "error": "Cannot refund payment that has not succeeded",
  "status": "requires_payment_method"
}
```

2. **Already refunded**
```json
{
  "error": "Payment has already been partially or fully refunded",
  "amount_refunded": 2500,
  "amount_capturable": 0
}
```

3. **Refund amount too high**
```json
{
  "error": "Refund amount cannot exceed payment amount",
  "payment_amount": 2500,
  "requested_refund": 3000
}
```

4. **Invalid payment intent**
```json
{
  "error": "Stripe error",
  "message": "No such payment_intent: 'pi_invalid'",
  "type": "invalid_request_error"
}
```

## Testing

### Test with Stripe Test Mode

1. Create a test payment:
```bash
# Use Stripe test card: 4242 4242 4242 4242
```

2. Get the payment intent ID from order confirmation

3. Call refund function:
```bash
curl -X POST \
  ${SUPABASE_URL}/functions/v1/refund-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -d '{
    "paymentIntentId": "pi_test_...",
    "reason": "requested_by_customer",
    "orderId": "LMF-1234567890"
  }'
```

### Test Cases

- ✅ Full refund
- ✅ Partial refund
- ✅ Refund with reason
- ❌ Refund non-existent payment
- ❌ Refund already-refunded payment
- ❌ Refund unsuccessful payment
- ❌ Partial refund exceeding original amount

## Integration with Order Management

### Add Refund Button to Admin Panel

```typescript
// app/[locale]/admin/orders/OrderRow.tsx
import { useState } from 'react'

function OrderRow({ order }: { order: Order }) {
  const [isRefunding, setIsRefunding] = useState(false)

  const handleRefund = async () => {
    if (!confirm(`Refund €${order.amount / 100} for order ${order.id}?`)) {
      return
    }

    setIsRefunding(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/refund-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            paymentIntentId: order.payment_intent_id,
            orderId: order.id,
            reason: 'requested_by_customer',
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Refund failed')
      }

      const data = await response.json()
      alert(`Refund successful: ${data.refund.id}`)

      // Refresh order list or update order status
      window.location.reload()
    } catch (error) {
      alert(`Refund failed: ${error.message}`)
    } finally {
      setIsRefunding(false)
    }
  }

  return (
    <tr>
      <td>{order.id}</td>
      <td>€{order.amount / 100}</td>
      <td>{order.status}</td>
      <td>
        {order.status === 'paid' && !order.refunded && (
          <button
            onClick={handleRefund}
            disabled={isRefunding}
            className="btn-danger"
          >
            {isRefunding ? 'Processing...' : 'Refund'}
          </button>
        )}
      </td>
    </tr>
  )
}
```

### Track Refunds in Database

Create a refunds table:

```sql
-- migrations/add_refunds_table.sql
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL,
  refund_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  reason TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  CONSTRAINT fk_payment_intent
    FOREIGN KEY (payment_intent_id)
    REFERENCES orders(payment_intent_id)
    ON DELETE CASCADE
);

-- Add index for faster lookups
CREATE INDEX idx_refunds_payment_intent ON refunds(payment_intent_id);
CREATE INDEX idx_refunds_order_id ON refunds(order_id);

-- RLS policies
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Only admins/moderators can view refunds
CREATE POLICY "Moderators can view refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'moderator'
    )
  );
```

### Update Function to Log Refunds

Add to the refund function after successful refund:

```typescript
// Log refund to database
const { error: dbError } = await supabaseClient
  .from('refunds')
  .insert({
    order_id: orderId,
    payment_intent_id: paymentIntentId,
    refund_id: refund.id,
    amount: refund.amount,
    reason: refund.reason,
    status: refund.status,
    created_by: userId, // Get from auth header
  })

if (dbError) {
  console.error('Failed to log refund:', dbError)
  // Continue anyway - refund was successful in Stripe
}
```

## Security Considerations

1. **Authentication**: Require authenticated users (preferably admin/moderator role)
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Audit Logging**: Log all refund attempts (success and failure)
4. **Validation**: Always validate payment intent exists and is refundable
5. **Permissions**: Restrict refund access to authorized personnel only

## Monitoring

Monitor refunds in:
- Stripe Dashboard: https://dashboard.stripe.com/refunds
- Supabase Logs: `supabase functions logs refund-payment`
- Database: Query `refunds` table

## Webhook Integration (Optional)

Set up Stripe webhook to track refund status changes:

```typescript
// supabase/functions/stripe-webhook/index.ts
if (event.type === 'charge.refunded') {
  const charge = event.data.object
  // Update order status in database
  await supabaseClient
    .from('orders')
    .update({ status: 'refunded', refunded_at: new Date() })
    .eq('payment_intent_id', charge.payment_intent)
}
```

## Support

For issues or questions:
- Stripe Support: https://support.stripe.com
- Supabase Support: https://supabase.com/support
- Internal: editionsrevel@gmail.com
