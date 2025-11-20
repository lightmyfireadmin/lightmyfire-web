import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

        const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

        const { data: userRole, error: roleError } = await supabase.rpc('get_my_role');

    if (roleError || userRole !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

        const { orderId, paymentIntentId } = await request.json();

    if (!orderId || !paymentIntentId) {
      return NextResponse.json({ error: 'Missing orderId or paymentIntentId' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });

    // Process refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    // Update order status in database using admin client
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

    const { data: updatedOrder, error: dbError } = await supabaseAdmin
      .from('sticker_orders')
      .update({ status: 'refunded' })
      .eq('id', orderId)
      .select()
      .single();

    if (dbError) {
      console.error('Failed to update order status to refunded:', dbError);
      // We still return success for the refund itself, but warn about DB sync
      return NextResponse.json({
        success: true,
        refund,
        message: 'Refund processed but failed to update database status',
      });
    }

    return NextResponse.json({
      success: true,
      refund,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Refund API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
