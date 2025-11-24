import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Forces the route to be dynamic to ensure it can access cookies and not be cached.
 */
export const dynamic = 'force-dynamic';

/**
 * API endpoint for logging client-side errors.
 *
 * This endpoint is typically called by React Error Boundaries (like `app/error.tsx` or `app/global-error.tsx`)
 * to capture and report errors that occur in the client's browser. It logs the error details
 * to the server console (which integrates with Vercel logs) and optionally persists them to a database.
 *
 * @param {NextRequest} request - The incoming request containing error details in the body.
 * @returns {Promise<NextResponse>} A JSON response indicating whether logging was successful.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Get user session if available (errors can happen before login)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const body = await request.json();
    const { message, digest, stack, timestamp, source } = body;

    // Log to console (will appear in Vercel logs)
    console.error('[Client Error]', {
      message,
      digest,
      source: source || 'error-boundary',
      userId: session?.user?.id || 'anonymous',
      timestamp,
      userAgent: request.headers.get('user-agent'),
      url: request.headers.get('referer'),
    });

    // Optionally store in database for error tracking
    // Uncomment if you create an error_logs table
    /*
    await supabase.from('error_logs').insert({
      user_id: session?.user?.id || null,
      error_message: message,
      error_digest: digest,
      error_stack: stack,
      source: source || 'error-boundary',
      user_agent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      timestamp: timestamp || new Date().toISOString(),
    });
    */

    // Return success but don't expose internal details
    return NextResponse.json({ logged: true }, { status: 200 });
  } catch (error) {
    // Log the error but don't fail - we don't want error logging to break the app
    console.error('Failed to log client error:', error);
    return NextResponse.json({ logged: false }, { status: 500 });
  }
}
