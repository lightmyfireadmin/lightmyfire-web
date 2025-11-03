import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Mark this route as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Initialize Stripe with secret key (at request time, not build time)
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  try {
    const body = await request.json();

    const {
      orderId,
      amount,
      currency = 'eur',
      cardholderEmail,
      packSize,
    } = body;

    // Validation
    if (!orderId || !amount || !cardholderEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, cardholderEmail' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe configuration missing. Please set STRIPE_SECRET_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Calculate amount in cents (smallest currency unit)
    // Amount from client should already be in cents, but we ensure it's an integer
    const amountInCents = Math.round(amount);

    if (amountInCents < 50) {
      return NextResponse.json(
        { error: 'Amount must be at least €0.50' },
        { status: 400 }
      );
    }

    // Create Stripe Payment Intent
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

    // Return client secret to client
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
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent. Please try again.' },
      { status: 500 }
    );
  }
}
