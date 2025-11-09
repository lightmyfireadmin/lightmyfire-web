import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    // Check admin role
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

    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search users by email in sticker_orders table
    // Get unique user emails from orders
    const { data: orders, error: searchError } = await supabase
      .from('sticker_orders')
      .select('user_id, user_email, shipping_name')
      .ilike('user_email', `%${query}%`)
      .not('user_email', 'is', null)
      .limit(20);

    if (searchError) {
      console.error('Error searching users:', searchError);
      return NextResponse.json(
        { error: 'Failed to search users' },
        { status: 500 }
      );
    }

    // Deduplicate by email and get profile info
    const emailMap = new Map();
    for (const order of orders || []) {
      if (order.user_email && !emailMap.has(order.user_email)) {
        emailMap.set(order.user_email, {
          id: order.user_id,
          email: order.user_email,
          username: order.shipping_name || null,
        });
      }
    }

    const users = Array.from(emailMap.values()).slice(0, 10);

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error in search-users endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
