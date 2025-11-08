import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { emailService } from '@/lib/email';

/**
 * Admin endpoint to test email sending with sample data
 * POST /api/admin/test-email
 */
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

    // Check if user is admin
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
    const { emailType, recipientEmail } = body;

    if (!emailType || !recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: emailType and recipientEmail' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Base URL for links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lightmyfire.app';

    // Send email based on type with example data
    let result;

    switch (emailType) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail({
          userEmail: recipientEmail,
          userName: 'Test User',
          profileUrl: `${baseUrl}/en/my-profile`,
          saveLighterUrl: `${baseUrl}/en/save-lighter`,
        });
        break;

      case 'order_confirmation':
        result = await emailService.sendOrderConfirmationEmail({
          userEmail: recipientEmail,
          userName: 'Test User',
          orderId: `ORD-${Date.now()}`,
          quantity: 10,
          lighterNames: ['The Wanderer', 'Spark of Joy', 'Phoenix Rising'],
          shippingAddress: {
            name: 'Test User',
            address: '123 Test Street',
            city: 'Paris',
            postalCode: '75001',
            country: 'France',
          },
          totalAmount: '8.99',
          currency: 'EUR',
          orderDetailsUrl: `${baseUrl}/en/my-orders`,
        });
        break;

      case 'order_shipped':
        result = await emailService.sendOrderShippedEmail({
          orderId: `ORD-${Date.now()}`,
          customerName: 'Test User',
          customerEmail: recipientEmail,
          trackingNumber: 'TEST123456789',
          trackingUrl: 'https://example.com/tracking/TEST123456789',
          carrier: 'Test Shipping Co.',
          quantity: 10,
          lighterNames: ['The Wanderer', 'Spark of Joy'],
          estimatedDelivery: '3-5 business days',
        });
        break;

      case 'first_post':
        result = await emailService.sendFirstPostCelebrationEmail({
          userEmail: recipientEmail,
          userName: 'Test User',
          lighterName: 'The Wanderer',
          lighterPin: 'ABCD1234',
          postType: 'text',
          lighterUrl: `${baseUrl}/en/lighter/test-lighter-id`,
        });
        break;

      case 'trophy_earned':
        result = await emailService.sendTrophyEarnedEmail({
          userEmail: recipientEmail,
          userName: 'Test User',
          trophyName: 'First Spark',
          trophyIcon: '🏆',
          trophyDescription: 'You created your first lighter and started its journey!',
          achievementDetails: 'You saved your first lighter and gave it a name. It\'s now ready to travel the world and collect stories!',
          profileUrl: `${baseUrl}/en/my-profile`,
        });
        break;

      case 'lighter_activity':
        result = await emailService.sendLighterActivityEmail({
          userEmail: recipientEmail,
          userName: 'Test User',
          lighterName: 'The Wanderer',
          lighterPin: 'ABCD1234',
          activityType: 'new_post',
          activityDetails: 'Someone added a new story to your lighter from Paris, France!',
          contributorName: 'Adventure Seeker',
          lighterUrl: `${baseUrl}/en/lighter/test-lighter-id`,
        });
        break;

      case 'post_flagged':
        result = await emailService.sendPostFlaggedEmail({
          userEmail: recipientEmail,
          userName: 'Test User',
          lighterName: 'The Wanderer',
          lighterPin: 'ABCD1234',
          postType: 'text',
          postContent: 'This is a test post that has been flagged for review.',
          postId: 'test-post-id',
          flagReason: 'Potentially inappropriate content',
        });
        break;

      case 'post_approved':
        result = await emailService.sendPostApprovedEmail({
          userEmail: recipientEmail,
          userName: 'Test User',
          lighterName: 'The Wanderer',
          lighterPin: 'ABCD1234',
          postType: 'text',
          postUrl: `${baseUrl}/en/lighter/test-lighter-id`,
        });
        break;

      case 'post_rejected':
        result = await emailService.sendPostRejectedEmail({
          userEmail: recipientEmail,
          userName: 'Test User',
          lighterName: 'The Wanderer',
          lighterPin: 'ABCD1234',
          postType: 'text',
          postContent: 'This is the content that was rejected.',
          rejectionReason: 'Content violates community guidelines',
          violationDetails: 'The post contained language that doesn\'t align with our community standards.',
          appealUrl: `${baseUrl}/en/support`,
        });
        break;

      case 'moderator_invite':
        result = await emailService.sendModeratorInviteEmail({
          userEmail: recipientEmail,
          userName: 'Test User',
          inviterName: 'Admin Team',
          acceptUrl: `${baseUrl}/en/become-moderator`,
          moderatorResponsibilities: [
            'Review flagged content within 24 hours',
            'Enforce community guidelines fairly',
            'Respond to user appeals professionally',
            'Report serious violations to admins',
          ],
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${emailType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Test email "${emailType}" sent successfully to ${recipientEmail}`,
      emailId: result.id,
    });

  } catch (error: any) {
    console.error('Error sending test email:', error);

    // Check if it's a Resend API error
    if (error.message?.includes('RESEND_API_KEY')) {
      return NextResponse.json(
        { error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    );
  }
}
