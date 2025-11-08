import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

/**
 * Admin endpoint to manually resend fulfillment email with sticker files
 * POST /api/admin/resend-fulfillment-email
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing required field: orderId' },
        { status: 400 }
      );
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('sticker_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Fetch lighter data for this order
    const { data: lighters, error: lightersError } = await supabase
      .from('lighters')
      .select('lighter_name, pin_code, background_color')
      .eq('payment_intent_id', order.payment_intent_id);

    if (lightersError || !lighters || lighters.length === 0) {
      return NextResponse.json(
        { error: 'No lighters found for this order' },
        { status: 404 }
      );
    }

    // Generate sticker file
    const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate-printful-stickers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lighters: lighters.map((l: any) => ({
          name: l.lighter_name,
          pinCode: l.pin_code,
          backgroundColor: l.background_color,
          language: 'en' // Default to English for existing orders
        }))
      }),
    });

    if (!generateResponse.ok) {
      throw new Error('Failed to generate sticker file');
    }

    const fileBuffer = await generateResponse.arrayBuffer();
    const fileExtension = lighters.length > 10 ? 'zip' : 'png';

    // Send fulfillment email
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fulfillmentEmail = process.env.FULFILLMENT_EMAIL || 'editionsrevel@gmail.com';

    await resend.emails.send({
      from: 'LightMyFire Orders <orders@lightmyfire.app>',
      to: [fulfillmentEmail],
      subject: `MANUAL RESEND - Order ${order.payment_intent_id} - ${lighters.length} stickers`,
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
              .warning { background: #FFF3CD; border: 2px solid #FFC107; padding: 15px; margin: 15px 0; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>🔥 Order Fulfillment - MANUAL RESEND</h2>
              </div>
              <div class="content">
                <div class="warning">
                  <strong>⚠️ MANUAL RESEND</strong><br>
                  This email was manually triggered by an administrator for testing or re-fulfillment purposes.
                </div>

                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Payment Intent ID:</strong> ${order.payment_intent_id}</p>
                <p><strong>Quantity:</strong> ${lighters.length} stickers</p>
                <p><strong>Pack Size:</strong> ${order.pack_size}</p>

                <h3>Shipping Information</h3>
                <p><strong>Name:</strong> ${order.shipping_name}</p>
                <p><strong>Email:</strong> ${order.shipping_email}</p>
                <p><strong>Address:</strong> ${order.shipping_address}, ${order.shipping_city}, ${order.shipping_postal_code}, ${order.shipping_country}</p>

                <h3>Lighter Details</h3>
                <div class="lighter-list">
                  ${lighters.map((l: any, i: number) =>
                    `<p><strong>${i + 1}.</strong> ${l.lighter_name} (PIN: <code>${l.pin_code}</code>) - ${l.background_color}</p>`
                  ).join('')}
                </div>

                <h3>Sticker File</h3>
                <p>The sticker file is attached to this email as a ${fileExtension.toUpperCase()} file.</p>
                ${lighters.length > 10 ? '<p><strong>Note:</strong> Multiple sheets are included in the ZIP file.</p>' : ''}

                <p style="margin-top: 20px; color: #666; font-size: 12px;">
                  Manually resent from LightMyFire Admin Panel<br>
                  Original order date: ${new Date(order.created_at).toLocaleString()}<br>
                  Resent: ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: `stickers-${order.payment_intent_id}-RESEND.${fileExtension}`,
          content: Buffer.from(fileBuffer),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: `Fulfillment email resent successfully to ${fulfillmentEmail}`,
      orderId: order.id,
      lighterCount: lighters.length,
    });

  } catch (error: any) {
    console.error('Error resending fulfillment email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resend fulfillment email' },
      { status: 500 }
    );
  }
}
