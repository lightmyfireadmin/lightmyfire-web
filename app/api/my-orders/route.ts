
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { createPaginatedResponse, ErrorCodes, createErrorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
        const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        createErrorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized. Please sign in to view orders.'),
        { status: 401 }
      );
    }

    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const offset = (page - 1) * limit;

    // Get total count for pagination metadata
    const { count: totalCount } = await supabase
      .from('sticker_orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);

        const { data: orders, error } = await supabase
      .from('sticker_orders')
      .select(`
        id,
        created_at,
        quantity,
        amount_paid,
        currency,
        shipping_name,
        shipping_email,
        shipping_address,
        shipping_city,
        shipping_postal_code,
        shipping_country,
        status,
        tracking_number,
        tracking_url,
        carrier,
        lighter_names,
        on_hold,
        hold_reason,
        failure_reason,
        cancellation_reason,
        paid_at,
        shipped_at,
        delivered_at
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching orders', {
        error: error.message,
        userId: session.user.id,
      });
      return NextResponse.json(
        createErrorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to fetch orders'),
        { status: 500 }
      );
    }

        // Transform orders to include only customer-facing data
    // DO NOT expose: payment_intent_id, printful_order_id, sticker_file_url, lighter_ids, internal reasons
    const transformedOrders = orders?.map((order) => ({
      id: order.id,
      orderId: `LMF-${order.id}`,
      status: order.status || 'pending',
      quantity: order.quantity,
      amount: order.amount_paid,
      currency: order.currency || 'EUR',
      customerName: order.shipping_name,
      customerEmail: order.shipping_email,
      shippingAddress: {
        address: order.shipping_address,
        city: order.shipping_city,
        postalCode: order.shipping_postal_code,
        country: order.shipping_country,
      },
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
      carrier: order.carrier,
      lighterNames: order.lighter_names || [],
      onHold: order.on_hold || false,
      holdReason: order.hold_reason,
      failureReason: order.failure_reason,
      cancellationReason: order.cancellation_reason,
      createdAt: order.created_at,
      paidAt: order.paid_at,
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at,
    })) || [];

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return NextResponse.json(
      createPaginatedResponse(
        transformedOrders,
        {
          page,
          pageSize: limit,
          totalItems: totalCount || 0,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        }
      )
    );
  } catch (error) {
    logger.error('Error in /api/my-orders', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      createErrorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Internal server error'),
      { status: 500 }
    );
  }
}
