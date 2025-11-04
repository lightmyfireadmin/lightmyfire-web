import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';

interface LighterData {
  name: string;
  backgroundColor: string;
  language: string;
}

interface OrderRequest {
  paymentIntentId: string;
  lighterData: LighterData[];
  shippingAddress: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

/**
 * Process sticker order after successful payment
 * 1. Verify payment with Stripe
 * 2. Create lighters in database with auto-generated PINs
 * 3. Generate sticker PNG files with real PINs
 * 4. Email files to dev email for fulfillment
 * 5. Check for trophy unlocks
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentIntentId, lighterData, shippingAddress }: OrderRequest = await request.json();

    // Validate input
    if (!paymentIntentId || !lighterData || lighterData.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Verify payment with Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        console.error('Payment not successful:', paymentIntent.status);
        return NextResponse.json({
          error: 'Payment not successful',
          status: paymentIntent.status
        }, { status: 400 });
      }

      // Additional verification: check amount matches expected
      const expectedAmount = lighterData.length * 250; // 2.50€ per sticker in cents
      if (paymentIntent.amount !== expectedAmount) {
        console.error('Payment amount mismatch:', {
          expected: expectedAmount,
          received: paymentIntent.amount
        });
        return NextResponse.json({
          error: 'Payment amount verification failed'
        }, { status: 400 });
      }
    } catch (stripeError) {
      console.error('Stripe verification error:', stripeError);
      return NextResponse.json({
        error: 'Payment verification failed',
        details: stripeError instanceof Error ? stripeError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Create lighters in database and get PINs
    const { data: createdLighters, error: dbError } = await supabase.rpc('create_bulk_lighters', {
      p_user_id: session.user.id,
      p_lighter_data: lighterData,
    });

    if (dbError || !createdLighters) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to create lighters' }, { status: 500 });
    }

    // Generate sticker PNG with real PIN codes
    const stickerData = createdLighters.map((lighter: any) => ({
      id: lighter.lighter_id,
      name: lighter.lighter_name,
      pinCode: lighter.pin_code,
      backgroundColor: lighter.background_color,
      language: lighterData.find((ld) => ld.name === lighter.lighter_name)?.language || 'en',
    }));

    // Generate PNG (reuse existing generation logic)
    const generateResponse = await fetch(`${request.nextUrl.origin}/api/generate-printful-stickers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stickers: stickerData,
        brandingText: 'LightMyFire',
      }),
    });

    if (!generateResponse.ok) {
      return NextResponse.json({ error: 'Failed to generate stickers' }, { status: 500 });
    }

    const pngBuffer = await generateResponse.arrayBuffer();

    // Send email to dev address with sticker file and order details
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const orderDetails = `
New Sticker Order - ${paymentIntentId}

Customer Information:
- Name: ${shippingAddress.name}
- Email: ${shippingAddress.email}
- Address: ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}, ${shippingAddress.country}

Order Details:
- Quantity: ${lighterData.length} stickers
- Payment ID: ${paymentIntentId}
- User ID: ${session.user.id}

Lighter Details:
${createdLighters
  .map(
    (l: any, i: number) =>
      `${i + 1}. ${l.lighter_name} (PIN: ${l.pin_code}) - Color: ${l.background_color}`
  )
  .join('\n')}

The sticker PNG file is attached. Please fulfill this order.
    `;

    // Send order to fulfillment email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'editionsrevel@gmail.com',
      subject: `New Sticker Order - ${lighterData.length} stickers - ${paymentIntentId}`,
      text: orderDetails,
      attachments: [
        {
          filename: `stickers-${paymentIntentId}.png`,
          content: Buffer.from(pngBuffer),
        },
      ],
    });

    // Send confirmation email to customer
    const customerEmail = `
Hi ${shippingAddress.name},

Thank you for your LightMyFire order!

Your order has been confirmed and is being prepared.

Order Details:
- Order ID: ${paymentIntentId}
- Quantity: ${lighterData.length} custom stickers
- Shipping to: ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}, ${shippingAddress.country}

Your Lighters:
${createdLighters.map((l: any, i: number) => `${i + 1}. ${l.lighter_name} (PIN: ${l.pin_code})`).join('\n')}

What's Next?
1. Your custom stickers are being prepared with your unique PIN codes
2. Our team will process your order and prepare it for shipping
3. Stickers are carefully packaged and shipped within 5-7 business days
4. You'll receive a tracking number via email once shipped

Your lighters are already active in your account! You can start adding posts to them at:
https://lightmyfire.app

Questions? Reply to this email or contact us at editionsrevel@gmail.com

Thank you for being part of the LightMyFire community!

The LightMyFire Team
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: shippingAddress.email,
      subject: `Order Confirmed - ${lighterData.length} LightMyFire Stickers`,
      text: customerEmail,
    });

    // Return success with created lighter IDs
    return NextResponse.json({
      success: true,
      lighterIds: createdLighters.map((l: any) => l.lighter_id),
      message: 'Order processed successfully. Confirmation emails sent.',
    });
  } catch (error) {
    console.error('Order processing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
