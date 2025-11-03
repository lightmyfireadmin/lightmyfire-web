import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

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

    // TODO: Verify payment with Stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const payment = await stripe.paymentIntents.retrieve(paymentIntentId);
    // if (payment.status !== 'succeeded') {
    //   return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    // }

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

    // Return success with created lighter IDs
    return NextResponse.json({
      success: true,
      lighterIds: createdLighters.map((l: any) => l.lighter_id),
      message: 'Order processed successfully. You will receive a confirmation email shortly.',
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
