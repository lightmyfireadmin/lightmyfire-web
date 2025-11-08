
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
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

        const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

        const [
      usersResult,
      ordersResult,
      lightersResult,
      postsResult
    ] = await Promise.all([
            supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),

            supabase
        .from('sticker_orders')
        .select('id', { count: 'exact', head: true }),

            supabase
        .from('lighters')
        .select('id', { count: 'exact', head: true }),

            supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
    ]);

        if (usersResult.error) throw usersResult.error;
    if (ordersResult.error) throw ordersResult.error;
    if (lightersResult.error) throw lightersResult.error;
    if (postsResult.error) throw postsResult.error;

        const stats = {
      userCount: usersResult.count || 0,
      orderCount: ordersResult.count || 0,
      lighterCount: lightersResult.count || 0,
      postCount: postsResult.count || 0,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error in /api/admin/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
