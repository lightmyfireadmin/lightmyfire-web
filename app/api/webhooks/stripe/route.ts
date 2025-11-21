import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase configuration missing');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature and timestamp (timing-safe comparison built into Stripe SDK)
      // Stripe's constructEvent includes:
      // 1. HMAC-based signature verification using timing-safe comparison
      // 2. Timestamp validation to prevent replay attacks (default tolerance: 5 minutes)
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errorMessage);

      // Log additional details for debugging (without exposing sensitive data)
      if (err instanceof Error && err.message.includes('timestamp')) {
        console.error('Webhook timestamp validation failed - possible replay attack or clock skew');
      }

      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Additional timestamp validation: Reject events older than 5 minutes
    const eventTimestamp = event.created;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeDifference = currentTimestamp - eventTimestamp;
    const MAX_WEBHOOK_AGE = 300; // 5 minutes in seconds

    if (timeDifference > MAX_WEBHOOK_AGE) {
      console.error(`Webhook event too old: ${timeDifference}s old (max ${MAX_WEBHOOK_AGE}s)`);
      return NextResponse.json(
        { error: 'Webhook event too old' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

        const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('id', event.id)
      .single();

    if (existingEvent) {
      logger.info('Webhook event already processed', { eventId: event.id, type: event.type });
      return NextResponse.json({ received: true, status: 'already_processed' }, { status: 200 });
    }

        const { error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        id: event.id,
        event_type: event.type,
        payload: event as unknown as Record<string, unknown>,
      });

    if (insertError) {
            if (insertError.code === '23505') {
        logger.info('Webhook event processed by another instance', { eventId: event.id });
        return NextResponse.json({ received: true, status: 'already_processed' }, { status: 200 });
      }
      console.error('Failed to insert webhook event:', insertError);
      return NextResponse.json({ error: 'Failed to track webhook event' }, { status: 500 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.event('stripe_payment_succeeded', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        });

        const { data, error } = await supabase.rpc('update_order_payment_succeeded', {
          p_payment_intent_id: paymentIntent.id,
        });

        if (error) {
          console.error('Failed to update order via RPC:', {
            paymentIntentId: paymentIntent.id,
            error: error.message,
            details: error.details,
            hint: error.hint,
          });
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        logger.info('Order updated after payment success', {
          paymentIntentId: paymentIntent.id,
          orderId: paymentIntent.metadata.orderId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const lastError = paymentIntent.last_payment_error;

        console.error("Payment failed:", {
          paymentIntentId: paymentIntent.id,
          orderId: paymentIntent.metadata.orderId,
          errorCode: lastError?.code,
          errorMessage: lastError?.message,
          errorType: lastError?.type,
          declineCode: lastError?.decline_code,
        });

        // Update order in database to reflect payment failure
        const { error: updateError } = await supabase
          .from('sticker_orders')
          .update({
            payment_failed: true,
            payment_error_code: lastError?.code || null,
            payment_error_message: lastError?.message || null,
            payment_error_type: lastError?.type || null,
            updated_at: new Date().toISOString(),
          })
          .eq('payment_intent_id', paymentIntent.id);

        if (updateError) {
          console.error('Failed to update order payment failure:', {
            paymentIntentId: paymentIntent.id,
            error: updateError.message,
            details: updateError.details,
          });
          // Don't return error - webhook should still return 200 to prevent retries
        } else {
          logger.event('order_payment_failed', { paymentIntentId: paymentIntent.id });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;

        logger.event('stripe_charge_refunded', {
          chargeId: charge.id,
          amount: charge.amount_refunded,
          currency: charge.currency,
          paymentIntentId: charge.payment_intent,
          refunded: charge.refunded,
        });

        if (typeof charge.payment_intent === 'string') {
          const latestRefund = charge.refunds?.data?.[0];

          logger.event('order_refunded', {
            paymentIntentId: charge.payment_intent,
            amount: charge.amount_refunded,
            reason: latestRefund?.reason || 'unknown',
          });

          // Update order with refund information
          // Note: sticker_orders table currently lacks dedicated refund columns
          // Storing refund info in cancellation_reason as workaround
          const refundInfo = {
            refunded: true,
            amount: charge.amount_refunded,
            reason: latestRefund?.reason || 'unknown',
            at: new Date().toISOString()
          };

          const { error: refundError } = await supabase
            .from('sticker_orders')
            .update({
              status: 'refunded',
              cancellation_reason: `Refunded: ${refundInfo.reason} (${refundInfo.amount} cents)`,
              updated_at: new Date().toISOString(),
            })
            .eq('payment_intent_id', charge.payment_intent);

          if (refundError) {
            console.error('Failed to update order refund status:', {
              paymentIntentId: charge.payment_intent,
              error: refundError.message,
              details: refundError.details,
            });
          } else {
            logger.info('Order refund status updated successfully', {
              paymentIntentId: charge.payment_intent,
              amount: charge.amount_refunded,
            });
          }
        }
        break;
      }

      default:
        logger.info('Unhandled webhook event type', { eventType: event.type });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
