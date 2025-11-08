import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { PACK_PRICING, VALID_PACK_SIZES } from '@/lib/constants';
import { rateLimit } from '@/lib/rateLimit';

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

export async function POST(request: NextRequest) {
  try {
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

        const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

        const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

            const rateLimitResult = rateLimit(request, 'payment', session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many order attempts. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    const { paymentIntentId, lighterData, shippingAddress }: OrderRequest = await request.json();

        if (!paymentIntentId || !lighterData || lighterData.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

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

            const packSize = lighterData.length;

            if (!VALID_PACK_SIZES.includes(packSize as any)) {
        console.error('Invalid pack size:', packSize);
        return NextResponse.json({
          error: 'Invalid pack size. Must be 10, 20, or 50 stickers.'
        }, { status: 400 });
      }

            const expectedBaseAmount = PACK_PRICING[packSize as keyof typeof PACK_PRICING];

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

        console.log('Creating lighters for user:', session.user.id);
    console.log('Lighter data to create:', JSON.stringify(lighterData, null, 2));

    const { data: createdLighters, error: dbError } = await supabaseAdmin.rpc('create_bulk_lighters', {
      p_user_id: session.user.id,
      p_lighter_data: lighterData,
    });

    if (dbError) {
      console.error('Database error creating lighters:', {
        error: dbError,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code
      });
      return NextResponse.json({
        error: 'Failed to create lighters',
        details: dbError.message,
        hint: dbError.hint
      }, { status: 500 });
    }

    if (!createdLighters || createdLighters.length === 0) {
      console.error('No lighters were created - function returned empty result');
      return NextResponse.json({
        error: 'Failed to create lighters - no data returned from database'
      }, { status: 500 });
    }

    console.log('Successfully created lighters:', createdLighters);

            const stickerData = createdLighters.map((lighter: any) => ({
      id: lighter.lighter_id,
      name: lighter.lighter_name,
      pinCode: lighter.pin_code,
      backgroundColor: lighter.background_color,
      language: lighter.sticker_language || 'en',
    }));

    console.log('Sticker data for generation:', stickerData);

        console.log('Generating sticker PNG...');

            const internalAuthToken = Buffer.from(
      `${session.user.id}:${Date.now()}:${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    ).toString('base64');

    const generateResponse = await fetch(`${request.nextUrl.origin}/api/generate-printful-stickers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-auth': internalAuthToken,
        'x-user-id': session.user.id,
      },
      body: JSON.stringify({
        stickers: stickerData,
        brandingText: 'LightMyFire',
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('Sticker generation failed:', {
        status: generateResponse.status,
        statusText: generateResponse.statusText,
        error: errorText
      });
      return NextResponse.json({
        error: 'Failed to generate stickers',
        details: errorText
      }, { status: 500 });
    }

    const fileBuffer = await generateResponse.arrayBuffer();
    const contentType = generateResponse.headers.get('Content-Type') || 'image/png';
    const fileExtension = contentType === 'application/zip' ? 'zip' : 'png';
    console.log(`Sticker file generated successfully (${contentType}), size: ${fileBuffer.byteLength} bytes`);

        const fileName = `${session.user.id}/${paymentIntentId}.${fileExtension}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('sticker-orders')
      .upload(fileName, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Failed to upload sticker to storage:', uploadError);
          }

        let stickerFileUrl = null;
    if (uploadData) {
      const { data: urlData } = await supabaseAdmin.storage
        .from('sticker-orders')
        .createSignedUrl(fileName, 604800); 
      stickerFileUrl = urlData?.signedUrl || null;
      console.log('Sticker uploaded to storage:', stickerFileUrl);
    }

        const { error: orderError } = await supabaseAdmin
      .from('sticker_orders')
      .insert({
        user_id: session.user.id,
        payment_intent_id: paymentIntentId,
        quantity: lighterData.length,
        amount_paid: await stripe.paymentIntents.retrieve(paymentIntentId).then(pi => pi.amount),
        shipping_name: shippingAddress.name,
        shipping_email: shippingAddress.email,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_postal_code: shippingAddress.postalCode,
        shipping_country: shippingAddress.country,
        sticker_file_url: stickerFileUrl,
        sticker_file_size: fileBuffer.byteLength,
        lighter_ids: createdLighters.map((l: any) => l.lighter_id),
        lighter_names: createdLighters.map((l: any) => l.lighter_name),
        paid_at: new Date().toISOString(),
      });

    if (orderError) {
      console.error('Failed to save order to database:', orderError);
          } else {
      console.log('Order saved to database successfully');
    }

        const resend = new Resend(process.env.RESEND_API_KEY);

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

        const fulfillmentEmail = process.env.FULFILLMENT_EMAIL || 'editionsrevel@gmail.com';
    let fulfillmentEmailSent = false;
    let customerEmailSent = false;

    try {
      await resend.emails.send({
        from: 'LightMyFire Orders <orders@lightmyfire.app>',
        to: [fulfillmentEmail],
        subject: `New Sticker Order - ${lighterData.length} stickers - ${paymentIntentId}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #FF6B6B; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
                .lighter-list { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF6B6B; }
                .download-button {
                  display: inline-block;
                  background: #FF6B6B;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 15px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>🔥 New Sticker Order</h2>
                </div>
                <div class="content">
                  <h3>Order Details</h3>
                  <p><strong>Order ID:</strong> ${paymentIntentId}</p>
                  <p><strong>Quantity:</strong> ${lighterData.length} stickers</p>
                  <p><strong>User ID:</strong> ${session.user.id}</p>

                  <h3>Shipping Information</h3>
                  <p><strong>Name:</strong> ${shippingAddress.name}</p>
                  <p><strong>Email:</strong> ${shippingAddress.email}</p>
                  <p><strong>Address:</strong> ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}, ${shippingAddress.country}</p>

                  <h3>Lighter Details</h3>
                  <div class="lighter-list">
                    ${createdLighters.map((l: any, i: number) =>
                      `<p><strong>${i + 1}.</strong> ${l.lighter_name} (PIN: <code>${l.pin_code}</code>) - ${l.background_color}</p>`
                    ).join('')}
                  </div>

                  ${stickerFileUrl ? `
                    <h3>Download Sticker File</h3>
                    <a href="${stickerFileUrl}" class="download-button">Download Stickers PNG</a>
                    <p><small>Link valid for 7 days</small></p>
                  ` : ''}

                  <p style="margin-top: 20px; color: #666; font-size: 12px;">
                    Sent from LightMyFire Order System<br>
                    ${new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
        attachments: [
          {
            filename: `stickers-${paymentIntentId}.${fileExtension}`,
            content: Buffer.from(fileBuffer),
          },
        ],
      });
      fulfillmentEmailSent = true;
      console.log('Fulfillment email sent successfully via Resend');

            await supabaseAdmin
        .from('sticker_orders')
        .update({ fulfillment_email_sent: true })
        .eq('payment_intent_id', paymentIntentId);

    } catch (emailError) {
      console.error('Failed to send fulfillment email:', emailError);
          }

        try {
      await resend.emails.send({
        from: 'LightMyFire <onboarding@resend.dev>',
        to: [shippingAddress.email],
        subject: `Order Confirmed - ${lighterData.length} LightMyFire Stickers`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #ffffff; padding: 30px 20px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .section { margin: 25px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }
                .lighter-list { list-style: none; padding: 0; }
                .lighter-item { padding: 10px; margin: 5px 0; background: white; border-left: 4px solid #FF6B6B; }
                .pin-code { font-family: 'Courier New', monospace; font-weight: bold; background: #FFE66D; padding: 2px 6px; border-radius: 3px; }
                .steps { counter-reset: step; }
                .step { counter-increment: step; padding-left: 35px; position: relative; margin: 15px 0; }
                .step:before { content: counter(step); position: absolute; left: 0; background: #FF6B6B; color: white; width: 25px; height: 25px; border-radius: 50%; text-align: center; line-height: 25px; font-weight: bold; }
                .button { display: inline-block; background: #FF6B6B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0; font-size: 32px;">🔥 Order Confirmed!</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your LightMyFire order</p>
                </div>
                <div class="content">
                  <p>Hi <strong>${shippingAddress.name}</strong>,</p>
                  <p>Great news! Your custom LightMyFire stickers have been confirmed and are being prepared.</p>

                  <div class="section">
                    <h3 style="margin-top: 0; color: #FF6B6B;">📦 Order Summary</h3>
                    <p><strong>Order ID:</strong> ${paymentIntentId}</p>
                    <p><strong>Quantity:</strong> ${lighterData.length} custom stickers</p>
                    <p><strong>Shipping to:</strong><br>
                    ${shippingAddress.address}<br>
                    ${shippingAddress.city}, ${shippingAddress.postalCode}<br>
                    ${shippingAddress.country}</p>
                  </div>

                  <div class="section">
                    <h3 style="margin-top: 0; color: #FF6B6B;">🔥 Your Lighters</h3>
                    <p>Your lighters are already active! Here are your unique PIN codes:</p>
                    <ul class="lighter-list">
                      ${createdLighters.map((l: any, i: number) =>
                        `<li class="lighter-item"><strong>${l.lighter_name}</strong><br>PIN: <span class="pin-code">${l.pin_code}</span></li>`
                      ).join('')}
                    </ul>
                  </div>

                  <div class="section">
                    <h3 style="margin-top: 0; color: #FF6B6B;">📋 What Happens Next?</h3>
                    <div class="steps">
                      <div class="step">Your custom stickers are being prepared with your unique PIN codes</div>
                      <div class="step">Our team will process your order and prepare it for shipping</div>
                      <div class="step">Stickers are carefully packaged and shipped within 5-7 business days</div>
                      <div class="step">You'll receive a tracking number via email once shipped</div>
                    </div>
                  </div>

                  <div style="text-align: center;">
                    <p><strong>Your lighters are already active!</strong></p>
                    <p>Start adding posts to them right now:</p>
                    <a href="https://lightmyfire.app/en/my-profile" class="button">Go to My Profile</a>
                  </div>

                  <div class="footer">
                    <p>Questions? Reply to this email or contact us at <a href="mailto:editionsrevel@gmail.com">editionsrevel@gmail.com</a></p>
                    <p>Thank you for being part of the LightMyFire community! 🔥</p>
                    <p style="font-size: 12px; color: #999;">Order placed: ${new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      customerEmailSent = true;
      console.log('Customer confirmation email sent successfully via Resend');

            await supabaseAdmin
        .from('sticker_orders')
        .update({ customer_email_sent: true })
        .eq('payment_intent_id', paymentIntentId);

    } catch (emailError) {
      console.error('Failed to send customer confirmation email:', emailError);
          }

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
