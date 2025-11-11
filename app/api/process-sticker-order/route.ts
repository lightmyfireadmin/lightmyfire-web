import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Stripe from 'stripe';
import { PACK_PRICING, VALID_PACK_SIZES } from '@/lib/constants';
import { rateLimit } from '@/lib/rateLimit';
import { sendOrderConfirmationEmail, sendFulfillmentEmail } from '@/lib/email';
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

interface CreatedLighter {
  lighter_id: string;
  lighter_name: string;
  pin_code: string;
  background_color: string;
  sticker_language: string;
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

            if (!VALID_PACK_SIZES.includes(packSize as 10 | 20 | 50)) {
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

      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown error';

      // Check for test/live mode mismatch
      if (errorMessage.includes('test mode') || errorMessage.includes('live mode')) {
        console.error('Test/Live mode mismatch detected:', {
          paymentIntentId,
          error: errorMessage
        });
        return NextResponse.json({
          error: 'This payment was created in test mode. Please create a new order with live payment.',
          details: 'Test mode payment intents cannot be used in production. Please start a new order.'
        }, { status: 400 });
      }

      return NextResponse.json({
        error: 'Payment verification failed',
        details: errorMessage
      }, { status: 500 });
    }

        // CRITICAL: Save order to database FIRST with "processing" status
    // This ensures the order is recorded even if subsequent steps fail
    const { error: initialOrderError } = await supabaseAdmin
      .from('sticker_orders')
      .insert({
        user_id: session.user.id,
        payment_intent_id: paymentIntentId,
        quantity: lighterData.length,
        amount_paid: paymentIntent.amount,
        user_email: shippingAddress.email,
        shipping_name: shippingAddress.name,
        shipping_email: shippingAddress.email,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_postal_code: shippingAddress.postalCode,
        shipping_country: shippingAddress.country,
        status: 'processing',
        paid_at: new Date().toISOString(),
      });

    if (initialOrderError) {
      console.error('CRITICAL: Failed to save order to database:', initialOrderError);
      // Still continue - we'll try to process the order anyway
    }

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

      // Update order status to failed
      await supabaseAdmin
        .from('sticker_orders')
        .update({
          status: 'failed',
          failure_reason: `Failed to create lighters: ${dbError.message}`,
        })
        .eq('payment_intent_id', paymentIntentId);

      // Return success but with empty lighterIds so user gets redirected
      return NextResponse.json({
        success: true,
        lighterIds: [],
        message: 'Payment received but order processing failed. Our team will contact you shortly.',
        error: 'Order processing failed - check My Orders for details'
      }, { status: 200 });
    }

    if (!createdLighters || createdLighters.length === 0) {
      console.error('No lighters were created - function returned empty result');

      // Update order status to failed
      await supabaseAdmin
        .from('sticker_orders')
        .update({
          status: 'failed',
          failure_reason: 'No lighters were created - database function returned empty result',
        })
        .eq('payment_intent_id', paymentIntentId);

      // Return success but with empty lighterIds so user gets redirected
      return NextResponse.json({
        success: true,
        lighterIds: [],
        message: 'Payment received but order processing failed. Our team will contact you shortly.',
        error: 'Order processing failed - check My Orders for details'
      }, { status: 200 });
    }

    const stickerData = (createdLighters as CreatedLighter[]).map((lighter) => ({
      id: lighter.lighter_id,
      name: lighter.lighter_name,
      pinCode: lighter.pin_code,
      backgroundColor: lighter.background_color,
      language: lighter.sticker_language || 'en',
    }));

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

      // Update order status to failed
      await supabaseAdmin
        .from('sticker_orders')
        .update({
          status: 'failed',
          failure_reason: `Sticker generation failed: ${errorText}`,
          lighter_ids: (createdLighters as CreatedLighter[]).map((l) => l.lighter_id),
          lighter_names: (createdLighters as CreatedLighter[]).map((l) => l.lighter_name),
        })
        .eq('payment_intent_id', paymentIntentId);

      // Return success so user gets redirected, but with error message
      return NextResponse.json({
        success: true,
        lighterIds: (createdLighters as CreatedLighter[]).map((l) => l.lighter_id),
        message: 'Payment received but sticker generation failed. Our team will contact you shortly.',
        error: 'Sticker generation failed - check My Orders for details'
      }, { status: 200 });
    }

    const generateResult = await generateResponse.json();

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
        }
      }
    }

    const stickerFileUrl = stickerFileUrls.length > 0 ? stickerFileUrls[0] : null;
    const totalFileSize = stickerFiles.reduce((sum, f) => sum + f.buffer.length, 0);

    const { error: orderError } = await supabaseAdmin
      .from('sticker_orders')
      .update({
        status: 'pending',
        sticker_file_url: stickerFileUrl,
        sticker_file_size: totalFileSize,
        lighter_ids: (createdLighters as CreatedLighter[]).map((l) => l.lighter_id),
        lighter_names: (createdLighters as CreatedLighter[]).map((l) => l.lighter_name),
      })
      .eq('payment_intent_id', paymentIntentId);

    if (orderError) {
      console.error('Failed to update order in database:', orderError);
    }

        // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('CRITICAL: RESEND_API_KEY is not configured - emails will not be sent!');
      // Don't throw error, allow order processing to complete
    }

    let fulfillmentEmailSent = false;
    let customerEmailSent = false;

    // Send fulfillment email using centralized email service with retry logic
    try {
      const result = await sendFulfillmentEmail({
        orderId: paymentIntentId,
        paymentIntentId,
        quantity: lighterData.length,
        userId: session.user.id,
        customerName: shippingAddress.name,
        customerEmail: shippingAddress.email,
        shippingAddress,
        lighters: createdLighters,
        stickerFiles,
        downloadUrls: stickerFileUrls,
      });

      if (result.success) {
        fulfillmentEmailSent = true;

        await supabaseAdmin
          .from('sticker_orders')
          .update({ fulfillment_email_sent: true })
          .eq('payment_intent_id', paymentIntentId);
      } else {
        console.error('Failed to send fulfillment email:', result.error);
      }
    } catch (emailError) {
      console.error('Failed to send fulfillment email:', {
        error: emailError,
        message: emailError instanceof Error ? emailError.message : 'Unknown error',
        apiKeyConfigured: !!process.env.RESEND_API_KEY
      });
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

        await supabaseAdmin
          .from('sticker_orders')
          .update({ customer_email_sent: true })
          .eq('payment_intent_id', paymentIntentId);
      } else {
        console.error('Failed to send customer email:', {
          error: result.error,
          recipient: shippingAddress.email,
          apiKeyConfigured: !!process.env.RESEND_API_KEY
        });
      }
    } catch (emailError) {
      console.error('Failed to send customer confirmation email:', {
        error: emailError,
        message: emailError instanceof Error ? emailError.message : 'Unknown error',
        recipient: shippingAddress.email,
        apiKeyConfigured: !!process.env.RESEND_API_KEY
      });
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
