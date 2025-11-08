// app/api/admin/verify-testing-password/route.ts
// Server-side password verification for admin testing dashboard

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user and verify admin status
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Check if user is admin
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

    // Get password from request
    const { password } = await request.json();

    // Get server-side password from environment
    const ADMIN_TESTING_PASSWORD = process.env.ADMIN_TESTING_PASSWORD || 'lightmyfire2025';

    // Verify password
    if (password === ADMIN_TESTING_PASSWORD) {
      return NextResponse.json({
        success: true,
        authenticated: true,
      });
    } else {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in /api/admin/verify-testing-password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
