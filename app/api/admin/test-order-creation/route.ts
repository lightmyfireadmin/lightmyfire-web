import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    steps: [],
    finalResult: 'UNKNOWN',
  };

  try {
    // Step 1: Check auth
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    results.steps.push({ step: 'Authentication', status: 'PASSED', userId: session.user.id });

    // Step 2: Get payment intent from request
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment Intent ID required' }, { status: 400 });
    }

    results.paymentIntentId = paymentIntentId;

    // Step 3: Initialize Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      results.steps.push({ step: 'Stripe Init', status: 'FAILED', error: 'STRIPE_SECRET_KEY not configured' });
      return NextResponse.json(results, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });

    results.steps.push({ step: 'Stripe Init', status: 'PASSED' });

    // Step 4: Retrieve payment intent
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      results.steps.push({
        step: 'Retrieve Payment Intent',
        status: 'PASSED',
        data: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          livemode: paymentIntent.livemode,
        },
      });

      if (paymentIntent.status !== 'succeeded') {
        results.steps.push({
          step: 'Payment Status Check',
          status: 'FAILED',
          error: `Payment status is ${paymentIntent.status}, not succeeded`,
        });
        results.finalResult = 'PAYMENT_NOT_SUCCEEDED';
        return NextResponse.json(results, { status: 400 });
      }

      results.steps.push({ step: 'Payment Status Check', status: 'PASSED' });
    } catch (stripeError) {
      results.steps.push({
        step: 'Retrieve Payment Intent',
        status: 'FAILED',
        error: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error',
      });
      results.finalResult = 'STRIPE_ERROR';
      return NextResponse.json(results, { status: 500 });
    }

    // Step 5: Initialize Supabase Admin
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    results.steps.push({ step: 'Supabase Admin Init', status: 'PASSED' });

    // Step 6: Try to insert a test order
    const testOrderData = {
      user_id: session.user.id,
      payment_intent_id: `test_${paymentIntentId}_${Date.now()}`, // Unique to avoid conflicts
      quantity: 10,
      amount_paid: paymentIntent.amount,
      shipping_name: 'Test Name',
      shipping_email: session.user.email || 'test@example.com',
      shipping_address: 'Test Address',
      shipping_city: 'Test City',
      shipping_postal_code: '12345',
      shipping_country: 'US',
      status: 'processing',
      paid_at: new Date().toISOString(),
    };

    const { data: insertedOrder, error: insertError } = await supabaseAdmin
      .from('sticker_orders')
      .insert(testOrderData)
      .select()
      .single();

    if (insertError) {
      results.steps.push({
        step: 'Insert Test Order',
        status: 'FAILED',
        error: {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        },
      });
      results.finalResult = 'ORDER_INSERT_FAILED';

      // Try to get more details
      if (insertError.code === '23505') {
        results.steps.push({
          step: 'Error Analysis',
          analysis: 'Duplicate key violation - payment_intent_id already exists in database',
          suggestion: 'Check if an order with this payment intent already exists',
        });
      }

      return NextResponse.json(results, { status: 500 });
    }

    results.steps.push({
      step: 'Insert Test Order',
      status: 'PASSED',
      orderId: insertedOrder?.id,
    });

    // Step 7: Clean up test order
    await supabaseAdmin
      .from('sticker_orders')
      .delete()
      .eq('id', insertedOrder.id);

    results.steps.push({
      step: 'Cleanup Test Order',
      status: 'PASSED',
    });

    results.finalResult = 'SUCCESS - Order creation works!';

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    results.steps.push({
      step: 'Unexpected Error',
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    results.finalResult = 'UNEXPECTED_ERROR';

    return NextResponse.json(results, { status: 500 });
  }
}
