import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimit(request, 'contact');
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many password reset requests. Please try again later.',
        resetTime: rateLimitResult.resetTime
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '3',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        }
      }
    );
  }

  try {
    const { email, redirectTo } = await request.json();

    // Validate email format
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email address required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Valid email address required' },
        { status: 400 }
      );
    }

    // Normalize email (trim, lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email length
    if (normalizedEmail.length > 255) {
      return NextResponse.json(
        { error: 'Email address too long' },
        { status: 400 }
      );
    }

    // Validate redirect URL
    if (!redirectTo || typeof redirectTo !== 'string') {
      return NextResponse.json(
        { error: 'Redirect URL required' },
        { status: 400 }
      );
    }

    // Ensure redirectTo is from the same origin (prevent open redirect)
    try {
      const redirectUrl = new URL(redirectTo);
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_SITE_URL || 'https://lightmyfire.app',
        'http://localhost:3000', // Allow localhost for development
      ];

      const isAllowedOrigin = allowedOrigins.some(origin => {
        const allowedUrl = new URL(origin);
        return redirectUrl.origin === allowedUrl.origin;
      });

      if (!isAllowedOrigin) {
        console.error('Invalid redirect URL origin:', redirectUrl.origin);
        return NextResponse.json(
          { error: 'Invalid redirect URL' },
          { status: 400 }
        );
      }
    } catch (urlError) {
      console.error('Invalid redirect URL format:', urlError);
      return NextResponse.json(
        { error: 'Invalid redirect URL format' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Use normalized email for consistency
    // Note: Supabase returns success even if the email doesn't exist (prevents email enumeration)
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    if (error) {
      console.error('Password reset error:', error);
      // Return generic success message to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
