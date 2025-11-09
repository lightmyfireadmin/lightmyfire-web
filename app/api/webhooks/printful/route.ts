
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { verifyPrintfulWebhook, getPrintfulOrderStatus } from '@/lib/printful';
import { sendOrderShippedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

type PrintfulWebhookEvent =
  | 'package_shipped'
  | 'package_returned'
  | 'order_failed'
  | 'order_canceled'
  | 'product_synced'
  | 'order_put_hold'
  | 'order_remove_hold'
  | 'order_updated';

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
        const body = await request.text();
    const signature = request.headers.get('x-pf-signature');

        if (!signature || !verifyPrintfulWebhook(body, signature)) {
      console.error('Invalid Printful webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

        const payload: PrintfulWebhookPayload = JSON.parse(body);

    // Validate webhook timestamp (reject webhooks older than 5 minutes to prevent replay attacks)
    const webhookAge = Date.now() / 1000 - payload.created;
    const MAX_WEBHOOK_AGE = 300; // 5 minutes in seconds

    if (webhookAge > MAX_WEBHOOK_AGE) {
      console.error('Webhook timestamp too old:', {
        created: payload.created,
        age: webhookAge,
        maxAge: MAX_WEBHOOK_AGE
      });
      return NextResponse.json(
        { error: 'Webhook timestamp expired' },
        { status: 401 }
      );
    }

    if (webhookAge < -60) {
      // Webhook timestamp is more than 1 minute in the future
      console.error('Webhook timestamp in the future:', {
        created: payload.created,
        age: webhookAge
      });
      return NextResponse.json(
        { error: 'Invalid webhook timestamp' },
        { status: 401 }
      );
    }

    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Idempotency check: Generate unique webhook ID from payload
    const webhookId = `printful_${payload.type}_${payload.data.order?.id}_${payload.created}_${payload.retries}`;

    // Check if we've already processed this webhook
    const { data: existingWebhook } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('webhook_id', webhookId)
      .eq('source', 'printful')
      .single();

    if (existingWebhook) {
      console.log('Webhook already processed (idempotency check):', {
        webhookId,
        type: payload.type,
        orderId: payload.data.order?.id,
      });
      // Return 200 to prevent Printful from retrying
      return NextResponse.json({ success: true, already_processed: true });
    }

    // Log webhook receipt
    console.log('Printful webhook received:', {
      type: payload.type,
      orderId: payload.data.order?.id,
      externalId: payload.data.order?.external_id,
      retries: payload.retries,
    });

    // Record webhook event for idempotency
    const { error: webhookLogError } = await supabase
      .from('webhook_events')
      .insert({
        webhook_id: webhookId,
        source: 'printful',
        event_type: payload.type,
        payload: payload,
        processed_at: new Date().toISOString(),
      });

    if (webhookLogError) {
      console.error('Failed to log webhook event (continuing anyway):', webhookLogError);
      // Continue processing even if logging fails
    }

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

      case 'order_updated':
        await handleOrderUpdated(supabase, payload);
        break;

      default:
        console.log('Unhandled Printful webhook type:', payload.type);
    }

        return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Printful webhook:', error);

        return NextResponse.json(
      { success: false, error: 'Processing error' },
      { status: 200 }
    );
  }
}

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
        const { data: stickerOrder, error: findError } = await supabase
      .from('sticker_orders')
      .select('*')
      .eq('printful_order_id', order.id)
      .single();

    if (findError || !stickerOrder) {
      console.error('Order not found in database:', order.id);
      return;
    }

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

        const customerEmail = stickerOrder.shipping_email;
    const customerName = stickerOrder.shipping_name || 'LightSaver';

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

        
    console.log('Order marked as returned:', order.id);
  } catch (error) {
    console.error('Error handling package_returned:', error);
  }
}

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
    // Get order details for notification
    const { data: stickerOrder } = await supabase
      .from('sticker_orders')
      .select('*')
      .eq('printful_order_id', order.id)
      .single();

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

    console.error('Order failed:', { orderId: order.id, reason });

    // Send admin notification about failed order
    if (stickerOrder) {
      const adminEmail = process.env.FULFILLMENT_EMAIL || 'mitch@lightmyfire.app';

      // Import dynamically to avoid circular dependencies
      const { sendCustomEmail } = await import('@/lib/email');

      await sendCustomEmail({
        to: adminEmail,
        subject: `⚠️ Printful Order Failed - ${order.id}`,
        html: `
          <h2 style="color: #dc2626;">Order Failed in Printful</h2>
          <p><strong>Printful Order ID:</strong> ${order.id}</p>
          <p><strong>External Order ID:</strong> ${order.external_id}</p>
          <p><strong>Reason:</strong> ${reason || 'Unknown error'}</p>
          <p><strong>Customer:</strong> ${stickerOrder.shipping_name} (${stickerOrder.shipping_email})</p>
          <p><strong>Quantity:</strong> ${stickerOrder.quantity} stickers</p>
          <p><strong>Payment Intent:</strong> ${stickerOrder.payment_intent_id}</p>
          <hr>
          <p><strong>Action Required:</strong> Please review this failed order and contact the customer if needed.</p>
        `,
      }).catch((emailError) => {
        console.error('Failed to send admin notification for failed order:', emailError);
      });
    }
  } catch (error) {
    console.error('Error handling order_failed:', error);
  }
}

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
    // Get order details for notification
    const { data: stickerOrder } = await supabase
      .from('sticker_orders')
      .select('*')
      .eq('printful_order_id', order.id)
      .single();

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

    console.log('Order canceled:', { orderId: order.id, reason });

    // Send admin notification about canceled order
    if (stickerOrder) {
      const adminEmail = process.env.FULFILLMENT_EMAIL || 'mitch@lightmyfire.app';

      // Import dynamically to avoid circular dependencies
      const { sendCustomEmail } = await import('@/lib/email');

      await sendCustomEmail({
        to: adminEmail,
        subject: `🚫 Printful Order Canceled - ${order.id}`,
        html: `
          <h2 style="color: #ea580c;">Order Canceled in Printful</h2>
          <p><strong>Printful Order ID:</strong> ${order.id}</p>
          <p><strong>External Order ID:</strong> ${order.external_id}</p>
          <p><strong>Reason:</strong> ${reason || 'Canceled by Printful'}</p>
          <p><strong>Customer:</strong> ${stickerOrder.shipping_name} (${stickerOrder.shipping_email})</p>
          <p><strong>Quantity:</strong> ${stickerOrder.quantity} stickers</p>
          <p><strong>Payment Intent:</strong> ${stickerOrder.payment_intent_id}</p>
          <hr>
          <p><strong>Action Required:</strong> Please review this cancellation and contact the customer to explain and offer a refund if necessary.</p>
        `,
      }).catch((emailError) => {
        console.error('Failed to send admin notification for canceled order:', emailError);
      });
    }
  } catch (error) {
    console.error('Error handling order_canceled:', error);
  }
}

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
    // Get order details for notification
    const { data: stickerOrder } = await supabase
      .from('sticker_orders')
      .select('*')
      .eq('printful_order_id', order.id)
      .single();

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

    // Send admin notification when order is put on hold
    if (isOnHold && stickerOrder) {
      const adminEmail = process.env.FULFILLMENT_EMAIL || 'mitch@lightmyfire.app';

      // Import dynamically to avoid circular dependencies
      const { sendCustomEmail } = await import('@/lib/email');

      await sendCustomEmail({
        to: adminEmail,
        subject: `⏸️ Printful Order On Hold - ${order.id}`,
        html: `
          <h2 style="color: #f59e0b;">Order Put On Hold in Printful</h2>
          <p><strong>Printful Order ID:</strong> ${order.id}</p>
          <p><strong>External Order ID:</strong> ${order.external_id}</p>
          <p><strong>Hold Reason:</strong> ${reason || 'No reason provided'}</p>
          <p><strong>Customer:</strong> ${stickerOrder.shipping_name} (${stickerOrder.shipping_email})</p>
          <p><strong>Quantity:</strong> ${stickerOrder.quantity} stickers</p>
          <p><strong>Payment Intent:</strong> ${stickerOrder.payment_intent_id}</p>
          <hr>
          <p><strong>Action Required:</strong> Please check the Printful dashboard to resolve the hold and resume fulfillment.</p>
        `,
      }).catch((emailError) => {
        console.error('Failed to send admin notification for hold status:', emailError);
      });
    }
  } catch (error) {
    console.error('Error handling order hold status:', error);
  }
}

async function handleOrderUpdated(
  supabase: any,
  payload: PrintfulWebhookPayload
) {
  const { order } = payload.data;

  if (!order) {
    console.error('Missing order data in order_updated event');
    return;
  }

  try {
    // Fetch the latest order status from Printful API for complete data
    const orderStatus = await getPrintfulOrderStatus(order.id);

    if (!orderStatus) {
      console.error('Failed to fetch order status from Printful:', order.id);
      return;
    }

    // Update order in database with latest status
    const { error } = await supabase
      .from('sticker_orders')
      .update({
        printful_status: orderStatus.status,
        updated_at: new Date().toISOString(),
      })
      .eq('printful_order_id', order.id);

    if (error) {
      console.error('Failed to update order status:', error);
      return;
    }

    console.log('Order status updated:', {
      orderId: order.id,
      status: orderStatus.status,
    });
  } catch (error) {
    console.error('Error handling order_updated:', error);
  }
}

export async function GET(request: NextRequest) {
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
