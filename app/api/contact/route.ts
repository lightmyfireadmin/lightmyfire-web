import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rateLimit';

/**
 * Handles POST requests for the contact form.
 *
 * This route sends an email to the support team using the Resend API.
 * It includes rate limiting to prevent abuse and basic input validation.
 *
 * @param {NextRequest} request - The incoming request object containing the form data.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function POST(request: NextRequest) {
    const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return NextResponse.json(
      { error: 'Email service is not configured' },
      { status: 500 }
    );
  }

      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown';

  const rateLimitResult = rateLimit(request, 'contact', ip);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many contact attempts. Please try again later.',
        resetTime: rateLimitResult.resetTime
      },
      { status: 429 }
    );
  }

  const resend = new Resend(apiKey);
  try {
    const { name, email, phone, message, subject } = await request.json();

        if (!name || typeof name !== 'string' || name.length < 2) {
      return NextResponse.json(
        { error: 'Valid name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

        const sanitizedName = name.trim().substring(0, 100);
    const sanitizedEmail = email.trim().substring(0, 100);
    const sanitizedPhone = phone ? phone.trim().substring(0, 20) : 'Not provided';
    const sanitizedMessage = message.trim().substring(0, 5000);
    const sanitizedSubject = subject || 'LightMyFire Contact Form';

        const { data, error } = await resend.emails.send({
      from: 'LightMyFire <support@lightmyfire.app>',
      to: ['support@lightmyfire.app'],
      replyTo: sanitizedEmail,
      subject: `${sanitizedSubject} - From ${sanitizedName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #FF6B6B; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #FF6B6B; }
              .message-box { background: white; padding: 15px; border-left: 4px solid #FF6B6B; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>🔥 New Contact Form Submission</h2>
              </div>
              <div class="content">
                <div class="field">
                  <span class="label">From:</span> ${sanitizedName}
                </div>
                <div class="field">
                  <span class="label">Email:</span> <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a>
                </div>
                <div class="field">
                  <span class="label">Phone:</span> ${sanitizedPhone}
                </div>
                <div class="field">
                  <span class="label">Subject:</span> ${sanitizedSubject}
                </div>
                <div class="field">
                  <span class="label">Message:</span>
                  <div class="message-box">
                    ${sanitizedMessage.replace(/\n/g, '<br>')}
                  </div>
                </div>
                <hr>
                <p style="color: #666; font-size: 12px;">
                  Sent from LightMyFire Contact Form<br>
                  Time: ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      id: data?.id
    });

  } catch (error) {
    console.error('Contact Form Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
