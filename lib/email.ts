/**
 * LightMyFire Email Service
 * Centralized email templates and sending logic using Resend
 *
 * All email templates support multi-language content and follow brand guidelines
 */

import { Resend } from 'resend';

// Initialize Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

// Email configuration
const EMAIL_CONFIG = {
  from: {
    default: 'LightMyFire <noreply@lightmyfire.app>',
    orders: 'LightMyFire Orders <orders@lightmyfire.app>',
    notifications: 'LightMyFire <notifications@lightmyfire.app>',
    moderation: 'LightMyFire Moderation <moderation@lightmyfire.app>',
    support: 'LightMyFire Support <support@lightmyfire.app>',
  },
  brandColors: {
    primary: '#FF6B6B',
    secondary: '#FF8E53',
    success: '#4CAF50',
    warning: '#FFC107',
    danger: '#F44336',
    text: '#333333',
    textLight: '#666666',
    background: '#f9f9f9',
  },
};

// Common email styles
const EMAIL_STYLES = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: ${EMAIL_CONFIG.brandColors.text};
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .header {
    background: linear-gradient(135deg, ${EMAIL_CONFIG.brandColors.primary} 0%, ${EMAIL_CONFIG.brandColors.secondary} 100%);
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
    background: ${EMAIL_CONFIG.brandColors.background};
    border-radius: 8px;
  }
  .section h3 {
    margin-top: 0;
    color: ${EMAIL_CONFIG.brandColors.primary};
    font-size: 18px;
  }
  .button {
    display: inline-block;
    background: ${EMAIL_CONFIG.brandColors.primary};
    color: white !important;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 6px;
    margin: 20px 0;
    font-weight: 600;
    text-align: center;
  }
  .button:hover {
    background: ${EMAIL_CONFIG.brandColors.secondary};
  }
  .footer {
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid #eeeeee;
    color: ${EMAIL_CONFIG.brandColors.textLight};
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
    border-left: 4px solid ${EMAIL_CONFIG.brandColors.primary};
    border-radius: 4px;
  }
`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

/**
 * Send email using Resend
 */
async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: options.from || EMAIL_CONFIG.from.default,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
      attachments: options.attachments,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Wrap content in standard email template
 */
function wrapEmailTemplate(content: string, title: string, subtitle?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
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
              <p><strong>LightMyFire</strong> – Give Your Lighter a Second Life</p>
              <p style="font-size: 12px; color: #999999;">
                Questions? Email us at <a href="mailto:support@lightmyfire.app" style="color: ${EMAIL_CONFIG.brandColors.primary};">support@lightmyfire.app</a>
              </p>
              <p style="font-size: 11px; color: #AAAAAA; margin-top: 15px;">
                © ${new Date().getFullYear()} LightMyFire. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ============================================================================
// ORDER EMAILS
// ============================================================================

interface OrderShippedData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  quantity: number;
  lighterNames: string[];
  estimatedDelivery?: string;
}

/**
 * Send order shipped notification with tracking information
 */
export async function sendOrderShippedEmail(data: OrderShippedData) {
  const content = `
    <p>Great news, <strong>${data.customerName}</strong>! 📦</p>
    <p>Your custom LightMyFire stickers have been shipped and are on their way to you.</p>

    <div class="section">
      <h3>📋 Shipping Details</h3>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Carrier:</strong> ${data.carrier}</p>
      <p><strong>Tracking Number:</strong> <span class="pin-code">${data.trackingNumber}</span></p>
      ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.trackingUrl}" class="button">Track Your Package</a>
    </div>

    <div class="section">
      <h3>🔥 Your Lighters</h3>
      <p>You ordered ${data.quantity} custom stickers for:</p>
      <ul>
        ${data.lighterNames.map(name => `<li><strong>${name}</strong></li>`).join('')}
      </ul>
    </div>

    <div class="highlight-box">
      <p><strong>💡 Pro Tip:</strong> Your lighters are already active! Start adding posts now while you wait for your stickers to arrive.</p>
      <p style="margin-bottom: 0;"><a href="https://lightmyfire.app/en/my-profile" style="color: ${EMAIL_CONFIG.brandColors.primary};">View My Lighters →</a></p>
    </div>
  `;

  return sendEmail({
    to: data.customerEmail,
    subject: `Your LightMyFire Stickers Have Shipped! 📦`,
    html: wrapEmailTemplate(content, 'Package Shipped', 'Your stickers are on the way'),
    from: EMAIL_CONFIG.from.orders,
  });
}

// ============================================================================
// MODERATION EMAILS
// ============================================================================

interface PostFlaggedData {
  userEmail: string;
  userName?: string;
  postType: string;
  postContent: string;
  lighterName: string;
  lighterPin: string;
  flagReason?: string;
  postId: string;
}

/**
 * Notify user their post has been flagged and is under review
 */
export async function sendPostFlaggedEmail(data: PostFlaggedData) {
  const content = `
    <p>Hi ${data.userName || 'there'},</p>
    <p>Your recent post on lighter "<strong>${data.lighterName}</strong>" has been flagged for review by our community moderation team.</p>

    <div class="section">
      <h3>📋 Post Details</h3>
      <p><strong>Lighter:</strong> ${data.lighterName} (PIN: <span class="pin-code">${data.lighterPin}</span>)</p>
      <p><strong>Post Type:</strong> <span class="badge badge-info">${data.postType}</span></p>
      <p><strong>Content:</strong></p>
      <div class="highlight-box">
        ${data.postContent}
      </div>
      ${data.flagReason ? `<p><strong>Flag Reason:</strong> ${data.flagReason}</p>` : ''}
    </div>

    <div class="section">
      <h3>⏱️ What Happens Next?</h3>
      <p>Our moderation team will review this post within 24 hours. Your post is temporarily hidden until the review is complete.</p>
      <p>If approved, your post will be made visible again. If rejected, you'll receive an explanation.</p>
    </div>

    <p>We strive to keep LightMyFire a positive, respectful space for everyone. Thank you for your understanding.</p>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `Your Post is Under Review`,
    html: wrapEmailTemplate(content, 'Post Flagged', 'Your content is being reviewed'),
    from: EMAIL_CONFIG.from.moderation,
  });
}

interface PostApprovedData {
  userEmail: string;
  userName?: string;
  postType: string;
  lighterName: string;
  lighterPin: string;
  postUrl: string;
}

/**
 * Notify user their flagged post has been approved
 */
export async function sendPostApprovedEmail(data: PostApprovedData) {
  const content = `
    <p>Good news, ${data.userName || 'there'}! ✅</p>
    <p>Your post on lighter "<strong>${data.lighterName}</strong>" has been reviewed and <strong>approved</strong> by our moderation team.</p>

    <div class="section">
      <h3>✅ Post Approved</h3>
      <p><strong>Lighter:</strong> ${data.lighterName} (PIN: <span class="pin-code">${data.lighterPin}</span>)</p>
      <p><strong>Post Type:</strong> <span class="badge badge-success">${data.postType}</span></p>
      <p><strong>Status:</strong> <span class="badge badge-success">Live & Visible</span></p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.postUrl}" class="button">View Your Post</a>
    </div>

    <p>Your post is now visible to everyone. Thank you for contributing positively to the LightMyFire community! 🔥</p>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `✅ Your Post Has Been Approved`,
    html: wrapEmailTemplate(content, 'Post Approved', 'Your content is now live'),
    from: EMAIL_CONFIG.from.moderation,
  });
}

interface PostRejectedData {
  userEmail: string;
  userName?: string;
  postType: string;
  postContent: string;
  lighterName: string;
  lighterPin: string;
  rejectionReason: string;
  violationDetails?: string;
  appealUrl?: string;
}

/**
 * Notify user their post has been rejected
 */
export async function sendPostRejectedEmail(data: PostRejectedData) {
  const content = `
    <p>Hi ${data.userName || 'there'},</p>
    <p>After reviewing your post on lighter "<strong>${data.lighterName}</strong>", our moderation team has determined it violates our community guidelines.</p>

    <div class="section">
      <h3>❌ Post Rejected</h3>
      <p><strong>Lighter:</strong> ${data.lighterName} (PIN: <span class="pin-code">${data.lighterPin}</span>)</p>
      <p><strong>Post Type:</strong> <span class="badge badge-danger">${data.postType}</span></p>
      <p><strong>Status:</strong> <span class="badge badge-danger">Removed</span></p>
    </div>

    <div class="highlight-box">
      <p><strong>Reason for Rejection:</strong></p>
      <p>${data.rejectionReason}</p>
      ${data.violationDetails ? `<p style="margin-top: 10px;"><strong>Details:</strong> ${data.violationDetails}</p>` : ''}
    </div>

    <div class="section">
      <h3>📖 Community Guidelines</h3>
      <p>Please review our community guidelines to understand what content is acceptable on LightMyFire:</p>
      <ul>
        <li>Be respectful and kind</li>
        <li>No hate speech, harassment, or bullying</li>
        <li>No explicit or inappropriate content</li>
        <li>No spam or misleading information</li>
        <li>No illegal content or activities</li>
      </ul>
    </div>

    ${data.appealUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <p>Think this was a mistake?</p>
        <a href="${data.appealUrl}" class="button">Appeal This Decision</a>
      </div>
    ` : ''}

    <p>We appreciate your understanding as we work to maintain a positive community for all LightSavers.</p>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `Your Post Could Not Be Approved`,
    html: wrapEmailTemplate(content, 'Post Rejected', 'Review required'),
    from: EMAIL_CONFIG.from.moderation,
  });
}

// ============================================================================
// ENGAGEMENT EMAILS
// ============================================================================

interface FirstPostData {
  userEmail: string;
  userName?: string;
  lighterName: string;
  lighterPin: string;
  postType: string;
  lighterUrl: string;
}

/**
 * Celebrate user's first post
 */
export async function sendFirstPostCelebrationEmail(data: FirstPostData) {
  const content = `
    <p>Congratulations, ${data.userName || 'LightSaver'}! 🎉</p>
    <p>You just added your very first post to your LightMyFire lighter "<strong>${data.lighterName}</strong>"!</p>

    <div style="text-align: center; margin: 30px 0;">
      <div style="font-size: 64px;">🔥</div>
      <h2 style="color: ${EMAIL_CONFIG.brandColors.primary}; margin: 10px 0;">Welcome to the Movement!</h2>
    </div>

    <div class="section">
      <h3>🎯 What You've Started</h3>
      <p>Your lighter is now part of something special. Every time someone finds it and adds their story, you'll be able to see where it's been and the connections it's made.</p>
      <p><strong>Lighter:</strong> ${data.lighterName}</p>
      <p><strong>PIN:</strong> <span class="pin-code">${data.lighterPin}</span></p>
      <p><strong>First Post Type:</strong> <span class="badge badge-success">${data.postType}</span></p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.lighterUrl}" class="button">View Your Lighter</a>
    </div>

    <div class="section">
      <h3>💡 Next Steps</h3>
      <ul>
        <li><strong>Share it:</strong> Pass your lighter to a friend or leave it somewhere interesting</li>
        <li><strong>Get stickers:</strong> Order custom stickers to help others find your lighter's story</li>
        <li><strong>Watch it grow:</strong> Check back to see new posts as your lighter travels</li>
      </ul>
    </div>

    <div class="highlight-box">
      <p><strong>🏆 Achievement Unlocked:</strong> First Spark</p>
      <p style="margin-bottom: 0;">You've lit your first flame in the LightMyFire community!</p>
    </div>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `🎉 You Posted Your First Story!`,
    html: wrapEmailTemplate(content, 'First Post!', 'Your LightMyFire journey begins'),
    from: EMAIL_CONFIG.from.notifications,
  });
}

interface TrophyEarnedData {
  userEmail: string;
  userName?: string;
  trophyName: string;
  trophyIcon: string;
  trophyDescription: string;
  achievementDetails: string;
  profileUrl: string;
}

/**
 * Notify user they earned a trophy
 */
export async function sendTrophyEarnedEmail(data: TrophyEarnedData) {
  const content = `
    <p>Awesome work, ${data.userName || 'LightSaver'}! 🏆</p>
    <p>You've earned a new trophy on LightMyFire!</p>

    <div style="text-align: center; margin: 40px 0;">
      <div style="font-size: 96px; margin-bottom: 20px;">${data.trophyIcon}</div>
      <h2 style="color: ${EMAIL_CONFIG.brandColors.primary}; margin: 0 0 10px 0; font-size: 28px;">${data.trophyName}</h2>
      <p style="font-size: 18px; color: ${EMAIL_CONFIG.brandColors.textLight}; margin: 0;">${data.trophyDescription}</p>
    </div>

    <div class="section">
      <h3>🎯 What You Did</h3>
      <p>${data.achievementDetails}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.profileUrl}" class="button">View My Trophies</a>
    </div>

    <div class="highlight-box">
      <p style="margin: 0;"><strong>💡 Keep Going!</strong> There are more trophies waiting to be unlocked. Can you collect them all?</p>
    </div>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `🏆 New Trophy Earned: ${data.trophyName}!`,
    html: wrapEmailTemplate(content, 'Trophy Unlocked!', `You earned: ${data.trophyName}`),
    from: EMAIL_CONFIG.from.notifications,
  });
}

interface LighterActivityData {
  userEmail: string;
  userName?: string;
  lighterName: string;
  lighterPin: string;
  activityType: 'new_post' | 'new_like' | 'refuel' | 'milestone';
  activityDetails: string;
  contributorName?: string;
  lighterUrl: string;
}

/**
 * Notify user of activity on their lighter
 */
export async function sendLighterActivityEmail(data: LighterActivityData) {
  const activityTitles = {
    new_post: 'New Story Added',
    new_like: 'Someone Liked Your Post',
    refuel: 'Lighter Refueled',
    milestone: 'Milestone Reached',
  };

  const activityEmojis = {
    new_post: '📖',
    new_like: '❤️',
    refuel: '🔥',
    milestone: '🎯',
  };

  const content = `
    <p>Hi ${data.userName || 'there'},</p>
    <p>There's new activity on your lighter "<strong>${data.lighterName}</strong>"!</p>

    <div class="section">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 48px;">${activityEmojis[data.activityType]}</div>
      </div>
      <h3>${activityTitles[data.activityType]}</h3>
      <p>${data.activityDetails}</p>
      ${data.contributorName ? `<p><strong>By:</strong> ${data.contributorName}</p>` : ''}
      <p><strong>Lighter:</strong> ${data.lighterName} (PIN: <span class="pin-code">${data.lighterPin}</span>)</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.lighterUrl}" class="button">View Lighter</a>
    </div>

    <p>Your lighter's journey continues! See where it's been and who's found it.</p>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `${activityEmojis[data.activityType]} ${activityTitles[data.activityType]}: ${data.lighterName}`,
    html: wrapEmailTemplate(content, activityTitles[data.activityType], `Activity on ${data.lighterName}`),
    from: EMAIL_CONFIG.from.notifications,
  });
}

// ============================================================================
// ACCOUNT & ONBOARDING EMAILS
// ============================================================================

interface WelcomeEmailData {
  userEmail: string;
  userName: string;
  profileUrl: string;
  saveLighterUrl: string;
}

/**
 * Welcome email for new signups
 */
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const content = `
    <p>Hi <strong>${data.userName}</strong>! 👋</p>
    <p>Welcome to the LightSavers' community! We're thrilled to have you here.</p>

    <div class="section">
      <h3>🔥 What is LightMyFire?</h3>
      <p>LightMyFire is a global movement giving lighters a second life through storytelling. Every lighter gets a digital identity, a unique sticker, and travels the world collecting stories from everyone who finds it.</p>
    </div>

    <div class="section">
      <h3>🚀 Get Started</h3>
      <p><strong>Here's what you can do now:</strong></p>
      <ul>
        <li><strong>Save your first lighter</strong> - Give it a name and get custom stickers delivered to your home</li>
        <li><strong>Find a lighter</strong> - Enter a PIN from a sticker you found to see its journey</li>
        <li><strong>Join the mosaic</strong> - Share posts, thoughts, songs, and locations</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.saveLighterUrl}" class="button">Save Your First Lighter</a>
    </div>

    <div style="text-align: center; margin: 20px 0; color: ${EMAIL_CONFIG.brandColors.textLight};">
      <p>Questions? Just reply to this email—we're here to help!</p>
    </div>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `Welcome to LightMyFire! 🔥`,
    html: wrapEmailTemplate(content, `Welcome, ${data.userName}!`, 'Your journey starts here'),
    from: EMAIL_CONFIG.from.default,
  });
}

// ============================================================================
// ORDER CONFIRMATION & SHIPPING EMAILS
// ============================================================================

interface OrderConfirmationEmailData {
  userEmail: string;
  userName: string;
  orderId: string;
  quantity: number;
  lighterNames: string[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  totalAmount: string;
  currency: string;
  orderDetailsUrl: string;
}

/**
 * Order confirmation email sent immediately after payment
 */
export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
  const content = `
    <p>Hi <strong>${data.userName}</strong>,</p>
    <p>Thank you for your order! Your payment has been processed successfully. 🎉</p>

    <div class="section">
      <h3>📦 Order Summary</h3>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Stickers:</strong> ${data.quantity} pack${data.quantity > 1 ? 's' : ''}</p>
      <p><strong>Total Paid:</strong> ${data.totalAmount} ${data.currency.toUpperCase()}</p>
    </div>

    <div class="section">
      <h3>🔥 Your Lighters</h3>
      <ul>
        ${data.lighterNames.map((name, i) => `<li><strong>${name}</strong></li>`).join('')}
      </ul>
      <p style="color: ${EMAIL_CONFIG.brandColors.textLight}; font-size: 14px;">
        Each lighter now has a unique PIN and is ready to start its journey!
      </p>
    </div>

    <div class="section">
      <h3>📮 Shipping To</h3>
      <p><strong>${data.shippingAddress.name}</strong></p>
      <p>${data.shippingAddress.address}<br>
      ${data.shippingAddress.city}, ${data.shippingAddress.postalCode}<br>
      ${data.shippingAddress.country}</p>
    </div>

    <div class="section">
      <h3>⏰ What's Next?</h3>
      <p>Your stickers are being prepared for shipment. You'll receive another email with tracking information once they're on their way!</p>
      <p><strong>Estimated delivery:</strong> 5-10 business days</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.orderDetailsUrl}" class="button">View Order Details</a>
    </div>

    <p style="text-align: center; color: ${EMAIL_CONFIG.brandColors.textLight}; font-size: 14px;">
      Questions about your order? Reply to this email anytime.
    </p>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `Order Confirmed! Your LightMyFire stickers are on the way 📦`,
    html: wrapEmailTemplate(content, 'Order Confirmed', `Thank you for your order!`),
    from: EMAIL_CONFIG.from.orders,
  });
}

// ============================================================================
// ADMIN & MODERATION TEAM EMAILS
// ============================================================================

interface ModeratorInviteData {
  userEmail: string;
  userName: string;
  inviterName: string;
  acceptUrl: string;
  moderatorResponsibilities: string[];
}

/**
 * Invite user to become a moderator
 */
export async function sendModeratorInviteEmail(data: ModeratorInviteData) {
  const content = `
    <p>Hi <strong>${data.userName}</strong>,</p>
    <p><strong>${data.inviterName}</strong> has invited you to join the LightMyFire moderation team!</p>

    <div class="section">
      <h3>👮 What is a Moderator?</h3>
      <p>Moderators help keep the LightMyFire community safe, positive, and welcoming by reviewing flagged content and ensuring our community guidelines are upheld.</p>
    </div>

    <div class="section">
      <h3>📋 Your Responsibilities</h3>
      <ul>
        ${data.moderatorResponsibilities.map(resp => `<li>${resp}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h3>🎁 Moderator Benefits</h3>
      <ul>
        <li>Early access to new features</li>
        <li>Special moderator badge on your profile</li>
        <li>Direct communication with the LightMyFire team</li>
        <li>Help shape the future of the community</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.acceptUrl}" class="button">Accept Invitation</a>
    </div>

    <p style="text-align: center; color: ${EMAIL_CONFIG.brandColors.textLight};">
      Not interested? You can ignore this email.
    </p>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `You've Been Invited to Join the Moderation Team`,
    html: wrapEmailTemplate(content, 'Moderator Invitation', 'Help us build a better community'),
    from: EMAIL_CONFIG.from.moderation,
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export const emailService = {
  // Account & Onboarding
  sendWelcomeEmail,

  // Order emails
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,

  // Moderation emails
  sendPostFlaggedEmail,
  sendPostApprovedEmail,
  sendPostRejectedEmail,

  // Engagement emails
  sendFirstPostCelebrationEmail,
  sendTrophyEarnedEmail,
  sendLighterActivityEmail,

  // Admin emails
  sendModeratorInviteEmail,

  // Low-level send function (for custom emails)
  sendCustomEmail: sendEmail,

  // Template wrapper (for custom templates)
  wrapTemplate: wrapEmailTemplate,

  // Configuration
  config: EMAIL_CONFIG,
};

export default emailService;
