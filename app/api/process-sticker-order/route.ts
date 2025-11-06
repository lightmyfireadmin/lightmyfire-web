import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';
import Stripe from 'stripe';
import { PACK_PRICING, VALID_PACK_SIZES } from '@/lib/constants';

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
    // Use service role key for admin operations (creating lighters, bypassing RLS)
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

    // Create separate client for user session verification (with cookies)
    const cookieStore = cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
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

      // Additional verification: validate pack size and check amount
      const packSize = lighterData.length;

      // Validate pack size
      if (!VALID_PACK_SIZES.includes(packSize as any)) {
        console.error('Invalid pack size:', packSize);
        return NextResponse.json({
          error: 'Invalid pack size. Must be 10, 20, or 50 stickers.'
        }, { status: 400 });
      }

      // Get expected base price (stickers only, without shipping)
      const expectedBaseAmount = PACK_PRICING[packSize as keyof typeof PACK_PRICING];

      // Payment intent includes shipping cost, so total should be >= base amount
      // We verify the amount is at least the base sticker price
      // (shipping rates vary by country, so we can't do exact match)
      if (paymentIntent.amount < expectedBaseAmount) {
        console.error('Payment amount too low:', {
          expectedMinimum: expectedBaseAmount,
          received: paymentIntent.amount,
          packSize
        });
        return NextResponse.json({
          error: 'Payment amount verification failed'
        }, { status: 400 });
      }

      // Sanity check: amount shouldn't be more than 10x the base price
      // (prevents fraudulent high charges)
      const maxReasonableAmount = expectedBaseAmount * 10;
      if (paymentIntent.amount > maxReasonableAmount) {
        console.error('Payment amount suspiciously high:', {
          received: paymentIntent.amount,
          maximum: maxReasonableAmount,
          packSize
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

    // Create lighters in database and get PINs (using admin client to bypass RLS)
    const { data: createdLighters, error: dbError } = await supabaseAdmin.rpc('create_bulk_lighters', {
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
    const fulfillmentEmail = process.env.FULFILLMENT_EMAIL || 'editionsrevel@gmail.com';
    let fulfillmentEmailSent = false;
    let customerEmailSent = false;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: fulfillmentEmail,
        subject: `New Sticker Order - ${lighterData.length} stickers - ${paymentIntentId}`,
        text: orderDetails,
        attachments: [
          {
            filename: `stickers-${paymentIntentId}.png`,
            content: Buffer.from(pngBuffer),
          },
        ],
      });
      fulfillmentEmailSent = true;
      console.log('Fulfillment email sent successfully');
    } catch (emailError) {
      console.error('Failed to send fulfillment email:', emailError);
      // Don't fail the order, but log for manual follow-up
      // TODO: Store failed email in database for retry
    }

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

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: shippingAddress.email,
        subject: `Order Confirmed - ${lighterData.length} LightMyFire Stickers`,
        text: customerEmail,
      });
      customerEmailSent = true;
      console.log('Customer confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send customer confirmation email:', emailError);
      // Don't fail the order, customer can still see order in their account
    }

    // Return success with created lighter IDs and email status
    const warnings = [];
    if (!fulfillmentEmailSent) {
      warnings.push('Fulfillment email failed to send - manual follow-up required');
    }
    if (!customerEmailSent) {
      warnings.push('Customer confirmation email failed to send');
    }

    return NextResponse.json({
      success: true,
      lighterIds: createdLighters.map((l: any) => l.lighter_id),
      message: warnings.length > 0
        ? `Order processed successfully but some emails failed: ${warnings.join(', ')}`
        : 'Order processed successfully. Confirmation emails sent.',
      warnings: warnings.length > 0 ? warnings : undefined,
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
