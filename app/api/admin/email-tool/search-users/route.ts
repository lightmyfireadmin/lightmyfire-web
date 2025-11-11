import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication and authorization
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { supabase } = auth;

    // Get search query from URL params
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search ALL users via RPC function (includes users without orders)
    const { data: allUsers, error: rpcError } = await supabase
      .rpc('admin_search_users_by_email', { search_query: query });

    if (rpcError) {
      console.error('Error searching all users:', rpcError);
      // If RPC fails, fall back to order search only
      console.warn('Falling back to order-based search only');
    }

    // Also search in sticker_orders for additional context (shipping names)
    // Escape LIKE wildcards to prevent SQL injection
    const escapedQuery = query.replace(/[%_]/g, '\\$&');
    const { data: orders } = await supabase
      .from('sticker_orders')
      .select('user_id, user_email, shipping_name')
      .ilike('user_email', `%${escapedQuery}%`)
      .not('user_email', 'is', null)
      .limit(20);

    // Merge results - prioritize all users, but use shipping name from orders if available
    const emailMap = new Map();

    // First, add all users from RPC (these are guaranteed to have valid emails)
    if (allUsers && Array.isArray(allUsers)) {
      for (const user of allUsers) {
        if (user.email) {
          emailMap.set(user.email.toLowerCase(), {
            id: user.id,
            email: user.email,
            username: user.username || null,
          });
        }
      }
    }

    // Then, overlay order data to get better shipping names
    if (orders && Array.isArray(orders)) {
      for (const order of orders) {
        if (order.user_email) {
          const existing = emailMap.get(order.user_email.toLowerCase());
          if (existing) {
            // Update username with shipping name if it's better
            if (order.shipping_name && (!existing.username || existing.username === 'Unknown')) {
              existing.username = order.shipping_name;
            }
          } else {
            // Add order-based user if not found in all users
            emailMap.set(order.user_email.toLowerCase(), {
              id: order.user_id,
              email: order.user_email,
              username: order.shipping_name || null,
            });
          }
        }
      }
    }

    const users = Array.from(emailMap.values()).slice(0, 20);

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error in search-users endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
