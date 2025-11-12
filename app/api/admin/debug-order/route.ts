import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Get the most recent order
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('sticker_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (ordersError) {
      return NextResponse.json({ error: 'Failed to fetch orders', details: ordersError }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ message: 'No orders found' });
    }

    const order = orders[0];

    // Check storage bucket
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();

    const stickerOrdersBucket = buckets?.find(b => b.name === 'sticker-orders');

    // Try to list files in the user's folder
    let storageFiles = null;
    let storageError = null;

    if (order.user_id) {
      const { data: files, error: filesError } = await supabaseAdmin.storage
        .from('sticker-orders')
        .list(order.user_id, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      storageFiles = files;
      storageError = filesError;
    }

    return NextResponse.json({
      mostRecentOrder: {
        payment_intent_id: order.payment_intent_id,
        status: order.status,
        quantity: order.quantity,
        created_at: order.created_at,
        paid_at: order.paid_at,
        user_id: order.user_id,
        shipping_name: order.shipping_name,
        shipping_email: order.shipping_email,
        sticker_file_url: order.sticker_file_url,
        sticker_file_size: order.sticker_file_size,
        fulfillment_email_sent: order.fulfillment_email_sent,
        customer_email_sent: order.customer_email_sent,
        failure_reason: order.failure_reason,
        lighter_ids: order.lighter_ids,
        lighter_names: order.lighter_names,
      },
      storage: {
        bucketExists: !!stickerOrdersBucket,
        bucketInfo: stickerOrdersBucket ? {
          id: stickerOrdersBucket.id,
          name: stickerOrdersBucket.name,
          public: stickerOrdersBucket.public,
        } : null,
        userFolderPath: order.user_id ? `${order.user_id}/` : 'N/A',
        filesInUserFolder: storageFiles,
        storageError: storageError,
      },
      diagnostics: {
        hasPaymentIntentId: !!order.payment_intent_id,
        hasStickerFileUrl: !!order.sticker_file_url,
        hasLighterIds: Array.isArray(order.lighter_ids) && order.lighter_ids.length > 0,
        emailsSent: {
          fulfillment: order.fulfillment_email_sent,
          customer: order.customer_email_sent,
        },
        possibleIssues: [
          !order.sticker_file_url && 'No sticker file URL - file upload may have failed',
          !order.fulfillment_email_sent && 'Fulfillment email not sent',
          !order.customer_email_sent && 'Customer email not sent',
          order.status === 'failed' && `Order failed: ${order.failure_reason}`,
        ].filter(Boolean),
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
