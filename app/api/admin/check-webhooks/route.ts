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

    // Get recent webhook events
    const { data: webhooks, error: webhooksError } = await supabaseAdmin
      .from('webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // Get recent sticker orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('sticker_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      webhooks: {
        count: webhooks?.length || 0,
        recent: webhooks || [],
        error: webhooksError?.message || null,
      },
      orders: {
        count: orders?.length || 0,
        recent: orders || [],
        error: ordersError?.message || null,
      },
      analysis: {
        hasWebhooks: (webhooks?.length || 0) > 0,
        hasOrders: (orders?.length || 0) > 0,
        possibleIssues: [
          (webhooks?.length || 0) === 0 && 'No webhook events recorded - Stripe webhook might not be configured',
          (orders?.length || 0) === 0 && 'No orders exist - frontend might not be calling process-sticker-order endpoint',
          (webhooks?.length || 0) > 0 && (orders?.length || 0) === 0 && 'Webhooks exist but no orders - order processing is failing before DB writes',
        ].filter(Boolean),
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check webhooks and orders',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
