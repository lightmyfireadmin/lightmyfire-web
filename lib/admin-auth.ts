import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export interface AdminAuthResult {
  authorized: boolean;
  session?: any;
  supabase?: any;
  errorResponse?: NextResponse;
}

/**
 * Verify admin authentication and authorization
 * Returns an object with authorization status and error response if unauthorized
 */
export async function verifyAdminAuth(): Promise<AdminAuthResult> {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      ),
    };
  }

  // Check admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    session,
    supabase,
  };
}

/**
 * Verify moderator or admin authentication and authorization
 * Returns an object with authorization status and error response if unauthorized
 */
export async function verifyModeratorAuth(): Promise<AdminAuthResult> {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      ),
    };
  }

  // Check moderator or admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (
    profileError ||
    !profile ||
    (profile.role !== 'admin' && profile.role !== 'moderator')
  ) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: 'Forbidden - Moderator or admin access required' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    session,
    supabase,
  };
}
