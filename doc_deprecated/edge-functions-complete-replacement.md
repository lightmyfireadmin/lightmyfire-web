# Complete Edge Functions Replacement for LightMyFire

**Location**: Replace the entire edge functions code in `lib/edge-functions.md`

```javascript
// process-email-queue function
https://xdkugrvcehfedkcsylaw.supabase.co/functions/v1/process-email-queue

# Documentation: Vercel Edge Functions Implementation (Not Deno)

This file documents how to implement email processing using Next.js API routes
instead of Deno-based Supabase Edge Functions for Vercel compatibility.

## Key Changes for Vercel Compatibility:
- Use Next.js API routes instead of Deno edge functions
- Use `createServerSupabaseClient` for Supabase integration
- Remove all Deno-specific imports and syntax
- Ensure compatibility with Vercel's Node.js runtime

## Implementation Examples:

## Email Queue Processing Implementation

This section shows how to properly implement email queue processing using Next.js API routes instead of Deno edge functions:

```javascript
// Example Next.js API route for processing email queue
// pages/api/process-email-queue.ts or app/api/process-email-queue/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  
  try {
    // Fetch pending emails (max 10 per batch)
    const { data: emails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', 3)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;

    if (!emails || Array.isArray(emails) && emails.length === 0) {
      return NextResponse.json({ processed: 0 });
    }

    let successCount = 0;
    let failCount = 0;

    for (const email of emails) {
      // Attempt to mark as processing only if still pending (avoid race condition)
      const { count } = await supabase
        .from('email_queue')
        .update({ status: 'processing' })
        .eq('id', email.id)
        .eq('status', 'pending');

      // If update didn't affect a row, skip (someone else processing)
      const { data: refreshed } = await supabase
        .from('email_queue')
        .select('status, retry_count')
        .eq('id', email.id)
        .single();

      if (!refreshed || refreshed.status !== 'processing') {
        continue;
      }

      try {
        // Process email sending logic here
        const emailTemplate = getEmailTemplate(email.email_type, email.email_data);
        
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailTemplate)
        });

        if (response.ok) {
          await supabase
            .from('email_queue')
            .update({
              status: 'sent',
              processed_at: new Date().toISOString()
            })
            .eq('id', email.id);
          successCount++;
        } else {
          const text = await response.text();
          throw new Error(`Resend API error: ${response.status} ${response.statusText} ${text}`);
        }
      } catch (error) {
        console.error('Error sending email', {
          id: email.id,
          error
        });
        // Increment retry_count and set back to pending for retry
        await supabase
          .from('email_queue')
          .update({
            status: 'pending',
            retry_count: email.retry_count + 1,
            error_message: String(error)
          })
          .eq('id', email.id);
        failCount++;
      }
    }

    return NextResponse.json({
      processed: successCount + failCount,
      success: successCount,
      failed: failCount
    });
  } catch (error) {
    console.error('process-email-queue failure', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
    if (fetchError) throw fetchError;
    if (!emails || Array.isArray(emails) && emails.length === 0) {
      return new Response(JSON.stringify({
        processed: 0
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    let successCount = 0;
    let failCount = 0;
    for (const email of emails){
      // Attempt to mark as processing only if still pending (avoid race)
      const { count } = await supabase.from('email_queue').update({
        status: 'processing'
      }, {
        returning: 'minimal'
      }).eq('id', email.id).eq('status', 'pending');
      // If update didn't affect a row, skip (someone else processing)
      // Supabase JS may not return count; instead fetch the row to confirm status
      const { data: refreshed } = await supabase.from('email_queue').select('status, retry_count').eq('id', email.id).single();
      if (!refreshed || refreshed.status !== 'processing') {
        continue;
      }
      try {
        const emailTemplate = getEmailTemplate(email.email_type, email.email_data);
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailTemplate)
        });
        if (response.ok) {
          await supabase.from('email_queue').update({
            status: 'sent',
            processed_at: new Date().toISOString()
          }).eq('id', email.id);
          successCount++;
        } else {
          const text = await response.text();
          throw new Error(`Resend API error: ${response.status} ${response.statusText} ${text}`);
        }
      } catch (error) {
        console.error('Error sending email', {
          id: email.id,
          error
        });
        // Increment retry_count and set back to pending for retry
        await supabase.from('email_queue').update({
          status: 'pending',
          retry_count: email.retry_count + 1,
          error_message: String(error)
        }).eq('id', email.id);
        failCount++;
      }
    }
    return new Response(JSON.stringify({
      processed: successCount + failCount,
      success: successCount,
      failed: failCount
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('process-email-queue failure', error);
    return new Response(JSON.stringify({
      error: String(error)
    }), {
      status: 500
    });
  }
});

## Beautiful Branded Email Templates

This section shows how to implement beautiful branded email templates using Next.js compatible code instead of Deno-specific code:

```javascript
// Email template functions for Next.js API routes
// These functions create HTML email templates compatible with Resend

function getEmailTemplate(type, data) {
  const EMAIL_STYLES = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.95;
      font-size: 16px;
    }
    .content {
      background: #ffffff;
      padding: 30px 20px;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .section {
      margin: 25px 0;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    .section h3 {
      margin-top: 0;
      color: #FF6B6B;
      font-size: 18px;
    }
    .button {
      display: inline-block;
      background: #FF6B6B;
      color: white !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
      text-align: center;
    }
    .button:hover {
      background: #FF8E53;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #eeeeee;
      color: #666666;
      font-size: 14px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-success { background: #E8F5E9; color: #2E7D32; }
    .badge-warning { background: #FFF3E0; color: #E65100; }
    .badge-danger { background: #FFEBEE; color: #C62828; }
    .badge-info { background: #E3F2FD; color: #1565C0; }
    .pin-code {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      background: #FFE66D;
      padding: 4px 10px;
      border-radius: 4px;
      letter-spacing: 1px;
    }
    .highlight-box {
      background: white;
      padding: 15px;
      margin: 15px 0;
      border-left: 4px solid #FF6B6B;
      border-radius: 4px;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin: 8px 0;
    }
  `;

  function wrapEmailTemplate(content, title, subtitle) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${EMAIL_STYLES}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔥 ${title}</h1>
              ${subtitle ? `<p>${subtitle}</p>` : ''}
            </div>
            <div class="content">
              ${content}
              <div class="footer">
                <p><strong>Keep the flame alive! 🔥</strong></p>
                <p style="font-size: 12px; color: #999999;">
                  Questions? Contact us at <a href="mailto:support@lightmyfire.app" style="color: #FF6B6B;">support@lightmyfire.app</a>
                </p>
                <p style="font-size: 11px; color: #AAAAAA; margin-top: 15px;">
                  LightMyFire - Connecting people through shared stories<br>
                  Visit us at <a href="https://lightmyfire.app" style="color: #FF6B6B;">lightmyfire.app</a><br>
                  © ${new Date().getFullYear()} LightMyFire
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  const baseEmail = {
    from: 'LightMyFire Orders <orders@lightmyfire.app>',
    to: data.to
  };

  switch(type){
    case 'order_confirmation':
      const orderContent = `
        <p>Great news, ${escapeHtml(data.userName)}! 🎉</p>
        <p>Your LightMyFire sticker pack order has been confirmed and is now being processed.</p>

        <div class="section">
          <h3>📦 Order Details</h3>
          <p><strong>Order ID:</strong> ${escapeHtml(data.orderId)}</p>
          <p><strong>Quantity:</strong> ${data.quantity} sticker pack${data.quantity > 1 ? 's' : ''}</p>
          <p><strong>Stickers for:</strong> ${data.lighterNames && data.lighterNames.length > 0 ? data.lighterNames.map((name)=>escapeHtml(name)).join(', ') : 'Your selected lighters'}</p>
          
          <div style="margin: 15px 0; padding: 10px; background: #f0f0f0; border-radius: 6px;">
            <p style="margin: 5px 0;"><strong>Product Price:</strong> €${data.amountPaid}</p>
            <p style="margin: 5px 0;"><strong>Shipping:</strong> €${data.shippingCost}</p>
            <p style="margin: 5px 0; font-size: 18px;"><strong>Total Paid:</strong> €${data.totalAmount}</p>
          </div>
        </div>

        <div class="section">
          <h3>🚀 What's Next?</h3>
          <ol>
            <li><strong>Sticker Generation:</strong> We're creating your custom sticker sheets with your lighter designs</li>
            <li><strong>Quality Check:</strong> Each sheet will be reviewed to ensure perfect quality</li>
            <li><strong>Shipping:</strong> Your stickers will be carefully packaged and shipped</li>
            <li><strong>Delivery:</strong> You'll receive tracking information once shipped</li>
          </ol>
        </div>

        ${data.trackingNumber ? `
          <div class="highlight-box">
            <p style="margin: 0;"><strong>📍 Tracking Number:</strong> <span class="pin-code">${escapeHtml(data.trackingNumber)}</span></p>
          </div>
        ` : ''}

        <div class="highlight-box">
          <p style="margin: 0;">Thank you for being part of the LightMyFire community! Your stickers will help spread the word about our lighter-sharing adventure. 🔥</p>
        </div>
      `;

      return {
        ...baseEmail,
        subject: '🎉 Your LightMyFire stickers are being prepared!',
        html: wrapEmailTemplate(orderContent, 'Order Confirmed!', 'Your stickers are on their way')
      };

    case 'first_post_celebration':
      const firstPostContent = `
        <p>Congratulations, ${escapeHtml(data.userName || 'LightSaver')}! 🌟</p>
        <p>You just added your first contribution to <strong>${escapeHtml(data.lighterName || '')}</strong>!</p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 64px;">🔥</div>
          <h2 style="color: #FF6B6B; margin: 10px 0;">Welcome to LightMyFire!</h2>
        </div>

        <div class="section">
          <h3>🌟 What Just Happened</h3>
          <p>This is the start of your journey as a LightSaver. Every post you create adds another piece to our global human mosaic.</p>
        </div>

        <div class="section">
          <h3>🚀 What's Next?</h3>
          <ul>
            <li><strong>Find more lighters</strong> and share your creativity</li>
            <li><strong>Order your own LightMyFire stickers</strong></li>
            <li><strong>Earn trophies</strong> by staying active</li>
          </ul>
        </div>

        <div class="highlight-box">
          <p style="margin: 0;">Keep the flame alive! 🔥</p>
        </div>
      `;

      return {
        ...baseEmail,
        subject: '🎉 You lit your first spark!',
        html: wrapEmailTemplate(firstPostContent, 'Welcome to LightMyFire!', 'Your first post has been published')
      };

    case 'trophy_earned':
      const trophyContent = `
        <p>Achievement Unlocked, ${escapeHtml(data.userName || 'LightSaver')}! 🏆</p>
        <p>You just earned a new trophy for your awesome contribution!</p>

        <div style="text-align: center; margin: 40px 0;">
          <div style="font-size: 96px; margin-bottom: 20px;">🏆</div>
          <h2 style="color: #FF6B6B; margin: 0 0 10px 0; font-size: 28px;">${escapeHtml(data.trophy?.trophyName || 'Trophy')}</h2>
          <p style="font-size: 18px; color: #666666; margin: 0;">${escapeHtml(data.trophy?.trophyDescription || '')}</p>
        </div>

        <div class="section">
          <h3>🌟 What You Accomplished</h3>
          <p>You're making a real difference in the LightMyFire community. Keep up the great work!</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://lightmyfire.app/en/my-profile" class="button">View All Trophies</a>
        </div>

        <div class="highlight-box">
          <p style="margin: 0;">Keep going! You're building an amazing legacy in our community. 🔥</p>
        </div>
      `;

      return {
        ...baseEmail,
        subject: `🏆 You earned a trophy: ${escapeHtml(data.trophy?.trophyName || 'Trophy')}!`,
        html: wrapEmailTemplate(trophyContent, 'Trophy Earned!', 'Achievement Unlocked')
      };

    case 'lighter_activity':
      const activityContent = `
        <p>Hey ${escapeHtml(data.ownerName || 'LightSaver')}! 👋</p>
        <p><strong>${escapeHtml(data.posterName || 'A LightSaver')}</strong> just added a <span class="badge badge-info">${escapeHtml(data.postType || '')}</span> to your lighter <strong>"${escapeHtml(data.lighterName || '')}"</strong>!</p>

        <div class="section">
          <h3>🔥 New Activity Alert</h3>
          <p>Your lighter is traveling and collecting stories. Check out what's new!</p>
          <p><strong>Lighter:</strong> ${escapeHtml(data.lighterName || '')} (PIN: <span class="pin-code">${escapeHtml(data.lighterPin || '')}</span>)</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://lightmyfire.app/lighter/${encodeURIComponent(data.lighterPin || '')}" class="button">View Your Lighter</a>
        </div>

        <p style="text-align: center;">Your lighter is creating connections across the world! 🌍</p>
      `;

      return {
        ...baseEmail,
        subject: `🔥 New activity on "${escapeHtml(data.lighterName || '')}"`,
        html: wrapEmailTemplate(activityContent, 'New Activity!', 'Someone interacted with your lighter')
      };

    case 'moderation_decision':
      if (data.decision === 'approved') {
        const approvalContent = `
          <p>Good news, ${escapeHtml(data.userName || 'LightSaver')}! ✅</p>
          <p>Your post <strong>"${escapeHtml(data.postTitle || '')}"</strong> has been approved and is now visible to the community.</p>

          <div class="section">
            <h3>🎨 What Happens Next?</h3>
            <p>Thank you for contributing to our mosaic! Your content is now live and can inspire other LightSavers around the world.</p>
          </div>

          <div class="highlight-box">
            <p style="margin: 0;">Your creativity helps build our global community of shared stories! 🌟</p>
          </div>
        `;

        return {
          ...baseEmail,
          subject: '✅ Your post was approved',
          html: wrapEmailTemplate(approvalContent, 'Post Approved!', 'Your content is now live')
        };
      } else {
        const revisionContent = `
          <p>Hi ${escapeHtml(data.userName || 'LightSaver')},</p>
          <p>Unfortunately, your post <strong>"${escapeHtml(data.postTitle || '')}"</strong> couldn't be approved at this time.</p>

          <div class="section">
            <h3>📝 What You Can Do</h3>
            ${data.reason ? `<p><strong>Reason:</strong> ${escapeHtml(data.reason)}</p>` : ''}
            <p>We want to keep LightMyFire safe and welcoming for everyone. Feel free to create a new post that follows our community guidelines.</p>
          </div>

          <div class="section">
            <h3>📖 Community Guidelines</h3>
            <ul>
              <li>Be respectful and kind to all members</li>
              <li>Share authentic stories and experiences</li>
              <li>No spam or inappropriate content</li>
              <li>Help build a positive community</li>
            </ul>
          </div>

          <div class="highlight-box">
            <p style="margin: 0;">Questions? Contact us anytime - we're here to help! 💬</p>
          </div>
        `;

        return {
          ...baseEmail,
          subject: '⚠️ Your post needs revision',
          html: wrapEmailTemplate(revisionContent, 'Post Under Review', 'Some changes are needed')
        };
      }

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

function escapeHtml(input) {
  if (!input) return '';
  return String(input).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, ''');
}
```

## **Key Changes Made**

### ✅ **Complete Email Template Overhaul**
- **Replaced entire `getEmailTemplate()` function** with beautiful branded design
- **Added comprehensive CSS styling** matching your main email service
- **Implemented `wrapEmailTemplate()` function** for consistent layout
- **Enhanced all email types** with professional formatting

### ✅ **Professional Design Elements**
- **Gradient headers** matching your brand colors (#FF6B6B → #FF8E53)
- **Consistent branding** with your LightMyFire theme
- **Professional sections** with proper spacing and typography
- **Branded footer** with company information and links

### ✅ **Email Addresses Updated**
- **Orders**: `LightMyFire Orders <orders@lightmyfire.app>`
- **Notifications**: Use the same professional layout

This complete replacement will make your trophy and order confirmation emails look exactly like your welcome emails! 🔥