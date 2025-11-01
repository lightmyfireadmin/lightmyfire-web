import { NextRequest, NextResponse } from 'next/server';

// Placeholder Stripe secret key - replace with actual key when available
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_do_not_use';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      orderId,
      amount,
      currency = 'EUR',
      cardholderName,
      cardholderEmail,
      billingAddress,
    } = body;

    // Validation
    if (!orderId || !amount || !cardholderEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Placeholder response - will be replaced with actual Stripe API call
    // when real keys are available
    const paymentIntentData = {
      amount: Math.round(amount), // Amount in smallest currency unit (cents for EUR)
      currency: currency.toLowerCase(),
      orderId,
      cardholderName,
      cardholderEmail,
      billingAddress,
      metadata: {
        orderId,
        customerEmail: cardholderEmail,
      },
    };

    // TODO: Replace this with actual Stripe API call:
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: paymentIntentData.amount,
    //   currency: paymentIntentData.currency,
    //   metadata: paymentIntentData.metadata,
    //   receipt_email: cardholderEmail,
    // });

    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      message: 'Payment intent created (placeholder)',
      clientSecret: 'pi_placeholder_client_secret_do_not_use',
      paymentIntentId: `pi_${Date.now()}`,
      orderData: paymentIntentData,
      // This should contain the actual client secret from Stripe
      // when real integration is in place
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
