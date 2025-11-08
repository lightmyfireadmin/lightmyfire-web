// app/api/my-orders/route.ts
// API route to fetch user's sticker orders

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to view orders.' },
        { status: 401 }
      );
    }

    // Fetch user's orders
    const { data: orders, error } = await supabase
      .from('sticker_orders')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Transform orders for frontend
    const transformedOrders = orders?.map((order) => ({
      id: order.id,
      orderId: order.order_id || `LMF-${order.id}`,
      status: order.status,
      quantity: order.quantity,
      amount: order.amount,
      currency: order.currency || 'EUR',
      customerName: order.customer_name,
      customerEmail: order.customer_email,
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
      printfulOrderId: order.printful_order_id,
      onHold: order.on_hold,
      holdReason: order.hold_reason,
      failureReason: order.failure_reason,
      cancellationReason: order.cancellation_reason,
      createdAt: order.created_at,
      paidAt: order.paid_at,
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at,
      updatedAt: order.updated_at,
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
