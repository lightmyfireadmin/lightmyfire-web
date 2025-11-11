import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import { createSuccessResponse, createErrorResponse, ErrorCodes, createPaginatedResponse } from '@/lib/api-response';

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
        createErrorResponse(ErrorCodes.UNAUTHORIZED, 'Unauthorized - Please log in'),
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
        createErrorResponse(ErrorCodes.FORBIDDEN, 'Forbidden - Admin access required'),
        { status: 403 }
      );
    }

    // Get user ID from URL params
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        createErrorResponse(ErrorCodes.VALIDATION_ERROR, 'Missing userId parameter'),
        { status: 400 }
      );
    }

    // Get pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    // Get total count
    const { count: totalCount } = await supabase
      .from('sticker_orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Fetch user's orders with pagination
    const { data: orders, error: ordersError } = await supabase
      .from('sticker_orders')
      .select('id, quantity, amount_paid, lighter_names, created_at, payment_intent_id, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (ordersError) {
      logger.error('Error fetching user orders', {
        error: ordersError.message,
        userId,
      });
      return NextResponse.json(
        createErrorResponse(ErrorCodes.DATABASE_ERROR, 'Failed to fetch orders'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createPaginatedResponse(orders || [], page, limit, totalCount || 0)
    );
  } catch (error: any) {
    logger.error('Error in user-orders endpoint', {
      error: error.message || 'Unknown error',
    });
    return NextResponse.json(
      createErrorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, error.message || 'Internal server error'),
      { status: 500 }
    );
  }
}
