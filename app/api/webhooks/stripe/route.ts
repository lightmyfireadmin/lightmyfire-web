import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errorMessage);
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
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
      console.log(`Webhook event ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true, status: 'already_processed' }, { status: 200 });
    }

        const { error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        id: event.id,
        event_type: event.type,
        payload: event as any,
      });

    if (insertError) {
            if (insertError.code === '23505') {         console.log(`Webhook event ${event.id} was processed by another instance`);
        return NextResponse.json({ received: true, status: 'already_processed' }, { status: 200 });
      }
      console.error('Failed to insert webhook event:', insertError);
      return NextResponse.json({ error: 'Failed to track webhook event' }, { status: 500 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Processing payment_intent.succeeded: ${paymentIntent.id}`);

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

        console.log(`Payment succeeded and order updated:`, {
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

        console.error(`Payment failed:`, {
          paymentIntentId: paymentIntent.id,
          orderId: paymentIntent.metadata.orderId,
          errorCode: lastError?.code,
          errorMessage: lastError?.message,
          errorType: lastError?.type,
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;

        console.log(`Charge refunded:`, {
          chargeId: charge.id,
          amount: charge.amount_refunded,
          currency: charge.currency,
          paymentIntentId: charge.payment_intent,
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
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
