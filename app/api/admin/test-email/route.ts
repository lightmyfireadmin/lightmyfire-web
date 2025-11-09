import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

        const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

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

        const body = await request.json();
    const { emailType, recipientEmail, language = 'en' } = body;

    if (!emailType || !recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: emailType and recipientEmail' },
        { status: 400 }
      );
    }

    const supportedLanguages = ['en', 'es', 'fr', 'de'];
    const emailLanguage = supportedLanguages.includes(language) ? language : 'en';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lightmyfire.app';

        let result;

    switch (emailType) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail({
          userEmail: recipientEmail,
          userName: 'Test User',
          profileUrl: `${baseUrl}/${emailLanguage}/my-profile`,
          saveLighterUrl: `${baseUrl}/${emailLanguage}/save-lighter`,
          language: emailLanguage as any,
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
          orderDetailsUrl: `${baseUrl}/${emailLanguage}/my-orders`,
          language: emailLanguage as any,
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
          language: emailLanguage as any,
        });
        break;

      case 'first_post':
        result = await emailService.sendFirstPostCelebrationEmail({
          userEmail: recipientEmail,
          userName: 'Test User',
          lighterName: 'The Wanderer',
          lighterPin: 'ABCD1234',
          postType: 'text',
          lighterUrl: `${baseUrl}/${emailLanguage}/lighter/test-lighter-id`,
          language: emailLanguage as any,
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
          profileUrl: `${baseUrl}/${emailLanguage}/my-profile`,
          language: emailLanguage as any,
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
          lighterUrl: `${baseUrl}/${emailLanguage}/lighter/test-lighter-id`,
          language: emailLanguage as any,
        });
        break;

      case 'moderator_invite':
        result = await emailService.sendModeratorInviteEmail({
          userEmail: recipientEmail,
          userName: 'Test User',
          inviterName: 'Admin Team',
          acceptUrl: `${baseUrl}/${emailLanguage}/become-moderator`,
          moderatorResponsibilities: [
            'Review flagged content within 24 hours',
            'Enforce community guidelines fairly',
            'Respond to user appeals professionally',
            'Report serious violations to admins',
          ],
          language: emailLanguage as any,
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
