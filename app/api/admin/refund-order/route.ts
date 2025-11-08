import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

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

        const { data: refundData, error: refundError } = await supabase.functions.invoke('refund-payment', {
      body: {
        paymentIntentId,
        orderId,
      },
    });

    if (refundError) {
      console.error('Refund Edge Function error:', refundError);
      return NextResponse.json(
        { error: refundError.message || 'Refund failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      refund: refundData.refund,
      order: refundData.order,
    });
  } catch (error) {
    console.error('Refund API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
