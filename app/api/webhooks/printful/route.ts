// app/api/webhooks/printful/route.ts
// Printful Webhook Handler for Order Status Updates

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { verifyPrintfulWebhook, getPrintfulOrderStatus } from '@/lib/printful';
import { sendOrderShippedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * Printful Webhook Events
 * Docs: https://developers.printful.com/docs/#section/Webhooks
 */
type PrintfulWebhookEvent =
  | 'package_shipped'
  | 'package_returned'
  | 'order_failed'
  | 'order_canceled'
  | 'product_synced'
  | 'order_put_hold'
  | 'order_remove_hold';

interface PrintfulWebhookPayload {
  type: PrintfulWebhookEvent;
  created: number;
  retries: number;
  store: number;
  data: {
    order?: {
      id: number;
      external_id: string;
      status: string;
    };
    shipment?: {
      id: number;
      carrier: string;
      service: string;
      tracking_number: string;
      tracking_url: string;
      ship_date: string;
      shipped_at: number;
      reshipment: boolean;
    };
    reason?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-pf-signature');

    // Verify webhook signature
    if (!signature || !verifyPrintfulWebhook(body, signature)) {
      console.error('Invalid Printful webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload: PrintfulWebhookPayload = JSON.parse(body);

    console.log('Printful webhook received:', {
      type: payload.type,
      orderId: payload.data.order?.id,
      externalId: payload.data.order?.external_id,
    });

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Handle different webhook events
    switch (payload.type) {
      case 'package_shipped':
        await handlePackageShipped(supabase, payload);
        break;

      case 'package_returned':
        await handlePackageReturned(supabase, payload);
        break;

      case 'order_failed':
        await handleOrderFailed(supabase, payload);
        break;

      case 'order_canceled':
        await handleOrderCanceled(supabase, payload);
        break;

      case 'order_put_hold':
      case 'order_remove_hold':
        await handleOrderHoldStatus(supabase, payload);
        break;

      default:
        console.log('Unhandled Printful webhook type:', payload.type);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Printful webhook:', error);

    // Still return 200 to prevent retries for parsing errors
    return NextResponse.json(
      { success: false, error: 'Processing error' },
      { status: 200 }
    );
  }
}

/**
 * Handle package shipped event
 */
async function handlePackageShipped(
  supabase: any,
  payload: PrintfulWebhookPayload
) {
  const { order, shipment } = payload.data;

  if (!order || !shipment) {
    console.error('Missing order or shipment data in package_shipped event');
    return;
  }

  try {
    // Find order in database by Printful order ID
    const { data: stickerOrder, error: findError } = await supabase
      .from('sticker_orders')
      .select('*')
      .eq('printful_order_id', order.id)
      .single();

    if (findError || !stickerOrder) {
      console.error('Order not found in database:', order.id);
      return;
    }

    // Update order with shipping info
    const { error: updateError } = await supabase
      .from('sticker_orders')
      .update({
        status: 'shipped',
        tracking_number: shipment.tracking_number,
        tracking_url: shipment.tracking_url,
        carrier: shipment.carrier,
        shipped_at: new Date(shipment.shipped_at * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', stickerOrder.id);

    if (updateError) {
      console.error('Failed to update order status:', updateError);
      return;
    }

    // Get customer email from order
    const customerEmail = stickerOrder.customer_email;
    const customerName = stickerOrder.customer_name || 'LightSaver';

    // Send shipping notification email
    if (customerEmail) {
      await sendOrderShippedEmail({
        orderId: stickerOrder.id,
        customerEmail,
        customerName,
        trackingNumber: shipment.tracking_number,
        trackingUrl: shipment.tracking_url,
        carrier: shipment.carrier,
        quantity: stickerOrder.quantity || 0,
        lighterNames: stickerOrder.lighter_names || [],
        estimatedDelivery: '5-10 business days',
      });

      console.log('Shipping notification sent:', {
        orderId: stickerOrder.id,
        email: customerEmail,
      });
    }
  } catch (error) {
    console.error('Error handling package_shipped:', error);
  }
}

/**
 * Handle package returned event
 */
async function handlePackageReturned(
  supabase: any,
  payload: PrintfulWebhookPayload
) {
  const { order } = payload.data;

  if (!order) {
    console.error('Missing order data in package_returned event');
    return;
  }

  try {
    // Update order status
    const { error } = await supabase
      .from('sticker_orders')
      .update({
        status: 'returned',
        updated_at: new Date().toISOString(),
      })
      .eq('printful_order_id', order.id);

    if (error) {
      console.error('Failed to update order status:', error);
      return;
    }

    // TODO: Send customer notification email
    // TODO: Process refund if applicable

    console.log('Order marked as returned:', order.id);
  } catch (error) {
    console.error('Error handling package_returned:', error);
  }
}

/**
 * Handle order failed event
 */
async function handleOrderFailed(
  supabase: any,
  payload: PrintfulWebhookPayload
) {
  const { order, reason } = payload.data;

  if (!order) {
    console.error('Missing order data in order_failed event');
    return;
  }

  try {
    // Update order status
    const { error } = await supabase
      .from('sticker_orders')
      .update({
        status: 'failed',
        failure_reason: reason || 'Unknown error',
        updated_at: new Date().toISOString(),
      })
      .eq('printful_order_id', order.id);

    if (error) {
      console.error('Failed to update order status:', error);
      return;
    }

    // TODO: Send customer notification email
    // TODO: Process refund
    // TODO: Alert admin

    console.error('Order failed:', { orderId: order.id, reason });
  } catch (error) {
    console.error('Error handling order_failed:', error);
  }
}

/**
 * Handle order canceled event
 */
async function handleOrderCanceled(
  supabase: any,
  payload: PrintfulWebhookPayload
) {
  const { order, reason } = payload.data;

  if (!order) {
    console.error('Missing order data in order_canceled event');
    return;
  }

  try {
    // Update order status
    const { error } = await supabase
      .from('sticker_orders')
      .update({
        status: 'canceled',
        cancellation_reason: reason || 'Canceled by Printful',
        updated_at: new Date().toISOString(),
      })
      .eq('printful_order_id', order.id);

    if (error) {
      console.error('Failed to update order status:', error);
      return;
    }

    // TODO: Process refund if payment was captured
    // TODO: Send customer notification email

    console.log('Order canceled:', { orderId: order.id, reason });
  } catch (error) {
    console.error('Error handling order_canceled:', error);
  }
}

/**
 * Handle order hold status changes
 */
async function handleOrderHoldStatus(
  supabase: any,
  payload: PrintfulWebhookPayload
) {
  const { order, reason } = payload.data;

  if (!order) {
    console.error('Missing order data in order hold event');
    return;
  }

  const isOnHold = payload.type === 'order_put_hold';

  try {
    // Update order with hold status
    const { error } = await supabase
      .from('sticker_orders')
      .update({
        on_hold: isOnHold,
        hold_reason: isOnHold ? reason : null,
        updated_at: new Date().toISOString(),
      })
      .eq('printful_order_id', order.id);

    if (error) {
      console.error('Failed to update order hold status:', error);
      return;
    }

    console.log(`Order ${isOnHold ? 'put on' : 'removed from'} hold:`, {
      orderId: order.id,
      reason,
    });
  } catch (error) {
    console.error('Error handling order hold status:', error);
  }
}

/**
 * Manual sync endpoint (for testing/debugging)
 * GET /api/webhooks/printful?orderId=123
 */
export async function GET(request: NextRequest) {
  // Only allow in development or with admin auth
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const printfulOrderId = searchParams.get('orderId');

  if (!printfulOrderId) {
    return NextResponse.json({ error: 'Missing orderId parameter' }, { status: 400 });
  }

  try {
    const status = await getPrintfulOrderStatus(Number(printfulOrderId));

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
