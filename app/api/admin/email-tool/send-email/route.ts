import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { sendCustomEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { from, to, subject, html } = body;

    // Validate required fields
    if (!from || !to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: from, to, subject, html' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid recipient email format' },
        { status: 400 }
      );
    }

    // Validate from address (must be one of the allowed addresses)
    const allowedFromAddresses = [
      'orders@lightmyfire.app',
      'support@lightmyfire.app',
      'mitch@lightmyfire.app',
    ];

    const fromEmail = from.includes('<') ? from.match(/<(.+)>/)?.[1] : from;
    if (!fromEmail || !allowedFromAddresses.includes(fromEmail)) {
      return NextResponse.json(
        { error: 'Invalid from address. Must be one of: ' + allowedFromAddresses.join(', ') },
        { status: 400 }
      );
    }

    // Send the email
    const result = await sendCustomEmail({
      from,
      to,
      subject,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    // Log the sent email for audit trail
    logger.event('admin_custom_email_sent', {
      adminId: session.user.id,
      adminEmail: session.user.email,
      from,
      to,
      subject,
      emailId: result.id,
    });

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${to}`,
      emailId: result.id,
    });
  } catch (error: any) {
    console.error('Error sending custom email:', error);

    if (error.message?.includes('RESEND_API_KEY')) {
      return NextResponse.json(
        { error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
