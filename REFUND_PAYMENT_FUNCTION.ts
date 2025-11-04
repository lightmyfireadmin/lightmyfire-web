// Supabase Edge Function: refund-payment
// Location: supabase/functions/refund-payment/index.ts
//
// This function handles payment refunds through Stripe
// To deploy: supabase functions deploy refund-payment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RefundRequest {
  paymentIntentId: string
  amount?: number // Optional: partial refund amount in cents
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  orderId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify Stripe secret key is configured
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Parse request body
    const { paymentIntentId, amount, reason, orderId }: RefundRequest = await req.json()

    // Validate required fields
    if (!paymentIntentId) {
      return new Response(
        JSON.stringify({ error: 'Payment intent ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Retrieve the payment intent to verify it exists and get details
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    // Verify payment was successful before refunding
    if (paymentIntent.status !== 'succeeded') {
      return new Response(
        JSON.stringify({
          error: 'Cannot refund payment that has not succeeded',
          status: paymentIntent.status,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if payment has already been refunded
    if (paymentIntent.amount_refunded > 0) {
      return new Response(
        JSON.stringify({
          error: 'Payment has already been partially or fully refunded',
          amount_refunded: paymentIntent.amount_refunded,
          amount_capturable: paymentIntent.amount - paymentIntent.amount_refunded,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate refund amount if provided
    if (amount && amount > paymentIntent.amount) {
      return new Response(
        JSON.stringify({
          error: 'Refund amount cannot exceed payment amount',
          payment_amount: paymentIntent.amount,
          requested_refund: amount,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create the refund
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    }

    // Add optional parameters
    if (amount) {
      refundParams.amount = amount
    }
    if (reason) {
      refundParams.reason = reason
    }
    if (orderId) {
      refundParams.metadata = { order_id: orderId }
    }

    const refund = await stripe.refunds.create(refundParams)

    // Log refund for audit trail
    console.log('Refund created:', {
      refund_id: refund.id,
      payment_intent_id: paymentIntentId,
      amount: refund.amount,
      status: refund.status,
      order_id: orderId,
    })

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
          reason: refund.reason,
          created: refund.created,
        },
        payment_intent: {
          id: paymentIntent.id,
          amount_refunded: paymentIntent.amount_refunded + refund.amount,
          total_amount: paymentIntent.amount,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Refund error:', error)

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return new Response(
        JSON.stringify({
          error: 'Stripe error',
          message: error.message,
          type: error.type,
          code: error.code,
        }),
        {
          status: error.statusCode || 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Handle generic errors
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
