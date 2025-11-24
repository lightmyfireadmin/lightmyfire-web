import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Session, SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface representing the result of an admin authentication verification.
 */
export interface AdminAuthResult {
  /** Indicates if the user is authorized. */
  authorized: boolean;
  /** The Supabase auth session, if authorized. */
  session?: Session;
  /** The initialized Supabase client, if authorized. */
  supabase?: SupabaseClient;
  /** A Next.js response object containing the error, if unauthorized. */
  errorResponse?: NextResponse;
}

/**
 * Verifies if the current user has admin privileges.
 *
 * It checks if the user is logged in and if their profile has the 'admin' role.
 *
 * @returns {Promise<AdminAuthResult>} A promise that resolves to an AdminAuthResult object.
 *                                     If authorized, it contains the session and supabase client.
 *                                     If unauthorized, it contains an error response.
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
    .single<{ role: 'admin' | 'moderator' | 'user' | null }>();

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
 * Verifies if the current user has moderator or admin privileges.
 *
 * It checks if the user is logged in and if their profile has either 'admin' or 'moderator' role.
 *
 * @returns {Promise<AdminAuthResult>} A promise that resolves to an AdminAuthResult object.
 *                                     If authorized, it contains the session and supabase client.
 *                                     If unauthorized, it contains an error response.
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
    .single<{ role: 'admin' | 'moderator' | 'user' | null }>();

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
