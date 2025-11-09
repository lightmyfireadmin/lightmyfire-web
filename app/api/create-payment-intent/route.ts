import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rateLimit';
import { validatePaymentEnvironment } from '@/lib/env';
import { PACK_PRICING, VALID_PACK_SIZES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const envValidation = validatePaymentEnvironment();
  if (!envValidation.valid) {
    console.error('Payment environment validation failed:', envValidation.errors);
    return NextResponse.json(
      { error: 'Payment system not properly configured. Please contact support.' },
      { status: 500 }
    );
  }

  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please log in to create a payment.' }, { status: 401 });
  }

  const rateLimitResult = rateLimit(request, 'payment', session.user.id);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        }
      }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  try {
    const body = await request.json();

    const {
      orderId,
      currency = 'eur',
      cardholderEmail,
      packSize,
      shippingRate,
    } = body;

    if (!orderId || !cardholderEmail || !packSize) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, cardholderEmail, packSize' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe configuration missing. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      );
    }

        // Validate pack size
    if (!VALID_PACK_SIZES.includes(packSize as any)) {
      return NextResponse.json(
        { error: 'Invalid pack size. Must be 10, 20, or 50 stickers.' },
        { status: 400 }
      );
    }

    // Calculate amount server-side to prevent manipulation
    const basePrice = PACK_PRICING[packSize as keyof typeof PACK_PRICING];
    const shipping = parseInt(shippingRate) || 0;

    // Validate shipping is reasonable (0 to 5000 cents = €0 to €50)
    if (shipping < 0 || shipping > 5000) {
      return NextResponse.json(
        { error: 'Invalid shipping rate' },
        { status: 400 }
      );
    }

    const amountInCents = basePrice + shipping;

    if (amountInCents < 50) {
      return NextResponse.json(
        { error: 'Amount must be at least €0.50' },
        { status: 400 }
      );
    }

        const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        orderId,
        customerEmail: cardholderEmail,
        packSize: packSize || 'unknown',
      },
      receipt_email: cardholderEmail,
      description: `LightMyFire Sticker Pack - Order ${orderId}`,
    });

        return NextResponse.json(
      {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment intent creation error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      const statusCode = error.statusCode || 400;

      let userMessage = 'Payment processing failed. Please try again.';
      if (error.type === 'StripeCardError') {
        userMessage = error.message;
      } else if (error.type === 'StripeInvalidRequestError') {
        userMessage = 'Invalid payment request. Please check your information.';
      } else if (error.type === 'StripeAPIError') {
        userMessage = 'Payment service temporarily unavailable. Please try again shortly.';
      } else if (error.type === 'StripeAuthenticationError') {
        userMessage = 'Payment authentication failed. Please contact support.';
        console.error('CRITICAL: Stripe authentication error - check API keys');
      }

      return NextResponse.json(
        {
          error: userMessage,
          code: error.code,
          type: error.type,
        },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent. Please try again.' },
      { status: 500 }
    );
  }
}
