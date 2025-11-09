
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
        const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view orders.' },
        { status: 401 }
      );
    }

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
        fulfillment_status,
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

        // Transform orders to include only customer-facing data
    // DO NOT expose: payment_intent_id, printful_order_id, sticker_file_url, lighter_ids, internal reasons
    const transformedOrders = orders?.map((order) => ({
      id: order.id,
      orderId: `LMF-${order.id}`,
      status: order.fulfillment_status || 'pending',
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

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
    });
  } catch (error) {
    console.error('Error in /api/my-orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
