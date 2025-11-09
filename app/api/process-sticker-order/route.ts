import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import Stripe from 'stripe';
import { PACK_PRICING, VALID_PACK_SIZES } from '@/lib/constants';
import { rateLimit } from '@/lib/rateLimit';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { SupportedEmailLanguage } from '@/lib/email-i18n';
import { generateInternalAuthToken } from '@/lib/internal-auth';

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

    // Validate shipping address
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    const { name, email, address, city, postalCode, country } = shippingAddress;

    // Validate required fields presence and types
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Shipping name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json({ error: 'Shipping email is required' }, { status: 400 });
    }
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }
    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return NextResponse.json({ error: 'Shipping city is required' }, { status: 400 });
    }
    if (!postalCode || typeof postalCode !== 'string' || postalCode.trim().length === 0) {
      return NextResponse.json({ error: 'Shipping postal code is required' }, { status: 400 });
    }
    if (!country || typeof country !== 'string' || country.trim().length === 0) {
      return NextResponse.json({ error: 'Shipping country is required' }, { status: 400 });
    }

    // Validate field lengths (prevent abuse and database overflow)
    if (name.length > 100) {
      return NextResponse.json({ error: 'Shipping name too long (max 100 characters)' }, { status: 400 });
    }
    if (email.length > 255) {
      return NextResponse.json({ error: 'Shipping email too long (max 255 characters)' }, { status: 400 });
    }
    if (address.length > 200) {
      return NextResponse.json({ error: 'Shipping address too long (max 200 characters)' }, { status: 400 });
    }
    if (city.length > 100) {
      return NextResponse.json({ error: 'Shipping city too long (max 100 characters)' }, { status: 400 });
    }
    if (postalCode.length > 20) {
      return NextResponse.json({ error: 'Shipping postal code too long (max 20 characters)' }, { status: 400 });
    }
    if (country.length > 2) {
      return NextResponse.json({ error: 'Shipping country code too long (must be 2-letter ISO code)' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid shipping email format' }, { status: 400 });
    }

    // Validate country code format (2-letter ISO code)
    const countryRegex = /^[A-Z]{2}$/i;
    if (!countryRegex.test(country)) {
      return NextResponse.json({ error: 'Invalid country code format (must be 2-letter ISO code like US, FR, DE)' }, { status: 400 });
    }

        if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });

    // Retrieve and validate payment intent once, reuse throughout function
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

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

        console.log('Generating sticker PNGs...');

        const internalAuthToken = generateInternalAuthToken(session.user.id);

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

    const generateResult = await generateResponse.json();
    console.log(`✅ Sticker generation successful: ${generateResult.numSheets} sheet(s) generated`);
    console.log(`📊 Sheet details:`, generateResult.sheets.map((s: any) => ({
      filename: s.filename,
      size: `${(s.size / 1024).toFixed(2)} KB`
    })));

        // Upload all sheets to storage and collect URLs
    const stickerFileUrls: string[] = [];
    const stickerFiles: { filename: string; buffer: Buffer }[] = [];

    for (let i = 0; i < generateResult.sheets.length; i++) {
      const sheet = generateResult.sheets[i];
      const fileBuffer = Buffer.from(sheet.data, 'base64');
      const fileName = `${session.user.id}/${paymentIntentId}-sheet-${i + 1}.png`;

      // Verify this is a valid PNG
      const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      if (!fileBuffer.subarray(0, 8).equals(pngSignature)) {
        console.error(`❌ Invalid PNG signature for sheet ${i + 1}`);
        throw new Error(`Sheet ${i + 1} is not a valid PNG file`);
      }
      console.log(`✅ Sheet ${i + 1} verified as valid PNG (${(fileBuffer.length / 1024).toFixed(2)} KB)`);

      // Store buffer for email attachment
      stickerFiles.push({
        filename: sheet.filename,
        buffer: fileBuffer
      });

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('sticker-orders')
        .upload(fileName, fileBuffer, {
          contentType: 'image/png',
          upsert: false,
        });

      if (uploadError) {
        console.error(`Failed to upload sheet ${i + 1} to storage:`, uploadError);
      } else {
        const { data: urlData } = await supabaseAdmin.storage
          .from('sticker-orders')
          .createSignedUrl(fileName, 604800);
        if (urlData?.signedUrl) {
          stickerFileUrls.push(urlData.signedUrl);
          console.log(`Sheet ${i + 1} uploaded to storage:`, urlData.signedUrl);
        }
      }
    }

    const stickerFileUrl = stickerFileUrls.length > 0 ? stickerFileUrls[0] : null;
    const totalFileSize = stickerFiles.reduce((sum, f) => sum + f.buffer.length, 0);

        const { error: orderError } = await supabaseAdmin
      .from('sticker_orders')
      .insert({
        user_id: session.user.id,
        payment_intent_id: paymentIntentId,
        quantity: lighterData.length,
        amount_paid: paymentIntent.amount,
        shipping_name: shippingAddress.name,
        shipping_email: shippingAddress.email,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_postal_code: shippingAddress.postalCode,
        shipping_country: shippingAddress.country,
        sticker_file_url: stickerFileUrl,
        sticker_file_size: totalFileSize,
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

✅ ${stickerFiles.length} sticker sheet PNG file(s) are attached to this email.
📊 Each sheet contains up to 10 stickers arranged for optimal Printful printing.
🖨️  Please print all ${stickerFiles.length} sheet(s) to fulfill this ${lighterData.length}-sticker order.
    `;

    const fulfillmentEmail = process.env.FULFILLMENT_EMAIL || 'mitch@lightmyfire.app';
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
                  <p><strong>Quantity:</strong> ${lighterData.length} stickers across <strong>${stickerFiles.length} sheet(s)</strong></p>
                  <p><strong>User ID:</strong> ${session.user.id}</p>
                  <p><strong>Sheets to Print:</strong> ${stickerFiles.length} PNG file(s) attached (each contains up to 10 stickers)</p>

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

                  <h3>📎 Attached Files</h3>
                  <div style="background: #fff; padding: 15px; margin: 15px 0; border: 2px solid #4CAF50; border-radius: 8px;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #4CAF50;">
                      ✅ ${stickerFiles.length} PNG file(s) attached to this email:
                    </p>
                    <ul style="margin: 0; padding-left: 20px;">
                      ${stickerFiles.map((file, i) =>
                        `<li><code>${file.filename}</code> - ${(file.buffer.length / 1024).toFixed(2)} KB</li>`
                      ).join('')}
                    </ul>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
                      Each sheet is print-ready at 600 DPI for Printful.
                    </p>
                  </div>

                  ${stickerFileUrls.length > 0 ? `
                    <h3>🔗 Download Links (Backup)</h3>
                    <div style="background: #f0f0f0; padding: 15px; margin: 15px 0; border-radius: 8px;">
                      ${stickerFileUrls.map((url, i) =>
                        `<a href="${url}" class="download-button">Download Sheet ${i + 1}</a><br/>`
                      ).join('')}
                      <p style="font-size: 12px; color: #666; margin-top: 10px;">Links valid for 7 days</p>
                    </div>
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
        attachments: stickerFiles.map((file, i) => ({
          filename: file.filename,
          content: file.buffer,
        })),
      });
      fulfillmentEmailSent = true;
      console.log('✅ Fulfillment email sent successfully via Resend');
      console.log(`📧 Email sent to: ${fulfillmentEmail}`);
      console.log(`📎 Attachments included: ${stickerFiles.length} file(s):`);
      stickerFiles.forEach((file, i) => {
        console.log(`   ${i + 1}. ${file.filename} - ${(file.buffer.length / 1024).toFixed(2)} KB`);
      });

            await supabaseAdmin
        .from('sticker_orders')
        .update({ fulfillment_email_sent: true })
        .eq('payment_intent_id', paymentIntentId);

    } catch (emailError) {
      console.error('Failed to send fulfillment email:', emailError);
          }

        try {
      const emailLanguage = (lighterData[0]?.language || 'en') as SupportedEmailLanguage;

      // Reuse already-retrieved paymentIntent instead of fetching again
      const totalAmount = (paymentIntent.amount / 100).toFixed(2);
      const currency = paymentIntent.currency;

      const result = await sendOrderConfirmationEmail({
        userEmail: shippingAddress.email,
        userName: shippingAddress.name,
        orderId: paymentIntentId,
        quantity: lighterData.length,
        lighterNames: createdLighters.map((l: any) => l.lighter_name),
        shippingAddress: {
          name: shippingAddress.name,
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        totalAmount,
        currency,
        orderDetailsUrl: `https://lightmyfire.app/${emailLanguage}/my-orders`,
        language: emailLanguage,
      });

      if (result.success) {
        customerEmailSent = true;
        console.log('Customer confirmation email sent successfully via Resend');

        await supabaseAdmin
          .from('sticker_orders')
          .update({ customer_email_sent: true })
          .eq('payment_intent_id', paymentIntentId);
      } else {
        console.error('Failed to send customer email:', result.error);
      }
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
