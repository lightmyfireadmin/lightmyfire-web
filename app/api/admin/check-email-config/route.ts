import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = {
    resendApiKey: {
      configured: !!process.env.RESEND_API_KEY,
      value: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : 'NOT SET',
    },
    fulfillmentEmail: {
      configured: !!process.env.FULFILLMENT_EMAIL,
      value: process.env.FULFILLMENT_EMAIL || 'mitch@lightmyfire.app (default)',
    },
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json({
    status: config.resendApiKey.configured ? 'OK' : 'ERROR',
    message: config.resendApiKey.configured
      ? 'Email service is properly configured'
      : '❌ RESEND_API_KEY is NOT configured - emails will NOT be sent!',
    config,
    instructions: !config.resendApiKey.configured ? [
      '1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
      '2. Add RESEND_API_KEY with your Resend API key from https://resend.com/api-keys',
      '3. Add FULFILLMENT_EMAIL (optional) with your admin email address',
      '4. Redeploy your application for changes to take effect',
    ] : null,
  });
}
