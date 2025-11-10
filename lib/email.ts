import { Resend } from 'resend';
import { t, SupportedEmailLanguage } from './email-i18n';

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

/**
 * Retry configuration for email sending
 */
const EMAIL_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determines if an email error is retryable
 * Retryable: network issues, rate limits, temporary server errors
 * Not retryable: invalid email, auth failures, validation errors
 */
function isEmailErrorRetryable(error: any): boolean {
  // Network/timeout errors are retryable
  if (!error.message) return true;

  const message = error.message.toLowerCase();

  // Permanent errors - don't retry
  if (
    message.includes('invalid email') ||
    message.includes('invalid recipient') ||
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('invalid api key') ||
    message.includes('not found') ||
    message.includes('validation error')
  ) {
    return false;
  }

  // Transient errors - retry
  if (
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('timeout') ||
    message.includes('server error') ||
    message.includes('service unavailable') ||
    message.includes('network') ||
    message.includes('connection')
  ) {
    return true;
  }

  // Default to retryable for unknown errors
  return true;
}

/**
 * Retry email sending with exponential backoff
 */
async function retryEmailSend<T>(
  fn: () => Promise<T>,
  context: string,
  maxRetries: number = EMAIL_RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const isRetryable = isEmailErrorRetryable(error);

      // If not retryable or last attempt, throw immediately
      if (!isRetryable || attempt === maxRetries) {
        console.error(`${context} failed after ${attempt + 1} attempts (not retryable or max retries reached)`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          attempt: attempt + 1,
          maxRetries: maxRetries + 1,
          isRetryable,
        });
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        EMAIL_RETRY_CONFIG.initialDelay * Math.pow(EMAIL_RETRY_CONFIG.backoffMultiplier, attempt),
        EMAIL_RETRY_CONFIG.maxDelay
      );

      console.warn(`${context} attempt ${attempt + 1} failed, retrying in ${delay}ms...`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        attemptsRemaining: maxRetries - attempt,
      });

      await sleep(delay);
    }
  }

  // Should never reach here due to throw in loop, but TypeScript needs this
  throw lastError || new Error(`${context} failed after retries`);
}

const EMAIL_CONFIG = {
  from: {
    default: 'LightMyFire <support@lightmyfire.app>',
    orders: 'LightMyFire Orders <orders@lightmyfire.app>',
    notifications: 'LightMyFire <mitch@lightmyfire.app>',
    moderation: 'LightMyFire <mitch@lightmyfire.app>',
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
  ul {
    padding-left: 20px;
  }
  li {
    margin: 8px 0;
  }
`;

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

async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string; id?: string }> {
  const emailContext = `Email to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`;

  try {
    // Retry email sending with exponential backoff
    const result = await retryEmailSend(async () => {
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
        console.error('Resend API error:', {
          error: error.message || error,
          recipient: options.to,
          subject: options.subject,
        });
        throw new Error(error.message || 'Failed to send email');
      }

      if (!data?.id) {
        throw new Error('Email sent but no ID returned');
      }

      console.log('Email sent successfully:', {
        id: data.id,
        recipient: options.to,
        subject: options.subject,
      });

      return data;
    }, emailContext);

    return { success: true, id: result.id };
  } catch (error) {
    // Log final failure after all retries exhausted
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('Email sending failed after retries:', {
      error: errorMessage,
      recipient: options.to,
      subject: options.subject,
      isRetryable: isEmailErrorRetryable(error),
    });

    // Provide user-friendly error messages
    let userFriendlyMessage = errorMessage;

    if (errorMessage.toLowerCase().includes('invalid email') || errorMessage.toLowerCase().includes('invalid recipient')) {
      userFriendlyMessage = 'Invalid email address. Please check the recipient email.';
    } else if (errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('too many requests')) {
      userFriendlyMessage = 'Email service rate limit reached. Please try again later.';
    } else if (errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('invalid api key')) {
      userFriendlyMessage = 'Email service authentication failed. Please contact support.';
    } else if (errorMessage.toLowerCase().includes('timeout') || errorMessage.toLowerCase().includes('network')) {
      userFriendlyMessage = 'Network error while sending email. The email system will retry automatically.';
    } else if (!errorMessage) {
      userFriendlyMessage = 'Failed to send email. Please try again or contact support.';
    }

    return {
      success: false,
      error: userFriendlyMessage,
    };
  }
}

function wrapEmailTemplate(content: string, title: string, subtitle: string | undefined, lang: SupportedEmailLanguage = 'en'): string {
  const translate = t(lang);
  const supportEmail = 'support@lightmyfire.app';

  return `
    <!DOCTYPE html>
    <html lang="${lang}">
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
              <p><strong>${translate('email.common.footer_tagline')}</strong></p>
              <p style="font-size: 12px; color: #999999;">
                ${translate('email.common.footer_questions')} <a href="mailto:${supportEmail}" style="color: ${EMAIL_CONFIG.brandColors.primary};">${supportEmail}</a>
              </p>
              <p style="font-size: 11px; color: #AAAAAA; margin-top: 15px;">
                ${translate('email.common.footer_copyright', { year: new Date().getFullYear() })}
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

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
  language?: SupportedEmailLanguage;
}

export async function sendOrderShippedEmail(data: OrderShippedData) {
  const lang = data.language || 'en';
  const translate = t(lang);

  const content = `
    <p>${translate('email.order_shipped.greeting', { name: data.customerName })}</p>
    <p>${translate('email.order_shipped.intro')}</p>

    <div class="section">
      <h3>${translate('email.order_shipped.details_title')}</h3>
      <p><strong>${translate('email.order_shipped.order_id')}</strong> ${data.orderId}</p>
      <p><strong>${translate('email.order_shipped.carrier')}</strong> ${data.carrier}</p>
      <p><strong>${translate('email.order_shipped.tracking')}</strong> <span class="pin-code">${data.trackingNumber}</span></p>
      ${data.estimatedDelivery ? `<p><strong>${translate('email.order_shipped.estimated_delivery')}</strong> ${data.estimatedDelivery}</p>` : ''}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.trackingUrl}" class="button">${translate('email.common.button.track_package')}</a>
    </div>

    <div class="section">
      <h3>${translate('email.order_shipped.lighters_title')}</h3>
      <p>${translate('email.order_shipped.lighters_intro', { quantity: data.quantity })}</p>
      <ul>
        ${data.lighterNames.map(name => `<li><strong>${name}</strong></li>`).join('')}
      </ul>
    </div>

    <div class="highlight-box">
      <p><strong>${translate('email.order_shipped.pro_tip')}</strong> ${translate('email.order_shipped.pro_tip_content')}</p>
      <p style="margin-bottom: 0;"><a href="https://lightmyfire.app/${lang}/my-profile" style="color: ${EMAIL_CONFIG.brandColors.primary};">${translate('email.order_shipped.pro_tip_link')}</a></p>
    </div>
  `;

  return sendEmail({
    to: data.customerEmail,
    subject: translate('email.order_shipped_subject'),
    html: wrapEmailTemplate(content, translate('email.order_shipped_subject'), undefined, lang),
    from: EMAIL_CONFIG.from.orders,
  });
}

interface FirstPostData {
  userEmail: string;
  userName?: string;
  lighterName: string;
  lighterPin: string;
  postType: string;
  lighterUrl: string;
  language?: SupportedEmailLanguage;
}

export async function sendFirstPostCelebrationEmail(data: FirstPostData) {
  const lang = data.language || 'en';
  const translate = t(lang);

  const content = `
    <p>${translate('email.first_post.greeting', { name: data.userName || 'LightSaver' })}</p>
    <p>${translate('email.first_post.intro', { lighter: data.lighterName })}</p>

    <div style="text-align: center; margin: 30px 0;">
      <div style="font-size: 64px;">🔥</div>
      <h2 style="color: ${EMAIL_CONFIG.brandColors.primary}; margin: 10px 0;">${translate('email.first_post.welcome_title')}</h2>
    </div>

    <div class="section">
      <h3>${translate('email.first_post.what_started_title')}</h3>
      <p>${translate('email.first_post.what_started_content')}</p>
      <p><strong>${translate('email.first_post.lighter')}</strong> ${data.lighterName}</p>
      <p><strong>${translate('email.first_post.pin')}</strong> <span class="pin-code">${data.lighterPin}</span></p>
      <p><strong>${translate('email.first_post.type')}</strong> <span class="badge badge-success">${data.postType}</span></p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.lighterUrl}" class="button">${translate('email.common.button.view_lighter')}</a>
    </div>

    <div class="section">
      <h3>${translate('email.first_post.next_steps_title')}</h3>
      <ul>
        <li><strong>${translate('email.first_post.next_step1')}</strong></li>
        <li><strong>${translate('email.first_post.next_step2')}</strong></li>
        <li><strong>${translate('email.first_post.next_step3')}</strong></li>
      </ul>
    </div>

    <div class="highlight-box">
      <p><strong>${translate('email.first_post.achievement')}</strong></p>
      <p style="margin-bottom: 0;">${translate('email.first_post.achievement_content')}</p>
    </div>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: translate('email.first_post_subject'),
    html: wrapEmailTemplate(content, translate('email.first_post_subject'), undefined, lang),
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
  language?: SupportedEmailLanguage;
}

export async function sendTrophyEarnedEmail(data: TrophyEarnedData) {
  const lang = data.language || 'en';
  const translate = t(lang);

  const content = `
    <p>${translate('email.trophy.greeting', { name: data.userName || 'LightSaver' })}</p>
    <p>${translate('email.trophy.intro')}</p>

    <div style="text-align: center; margin: 40px 0;">
      <div style="font-size: 96px; margin-bottom: 20px;">${data.trophyIcon}</div>
      <h2 style="color: ${EMAIL_CONFIG.brandColors.primary}; margin: 0 0 10px 0; font-size: 28px;">${data.trophyName}</h2>
      <p style="font-size: 18px; color: ${EMAIL_CONFIG.brandColors.textLight}; margin: 0;">${data.trophyDescription}</p>
    </div>

    <div class="section">
      <h3>${translate('email.trophy.what_you_did')}</h3>
      <p>${data.achievementDetails}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.profileUrl}" class="button">${translate('email.common.button.view_trophies')}</a>
    </div>

    <div class="highlight-box">
      <p style="margin: 0;"><strong>${translate('email.trophy.keep_going')}</strong> ${translate('email.trophy.keep_going_content')}</p>
    </div>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: translate('email.trophy_earned_subject', { trophy_name: data.trophyName }),
    html: wrapEmailTemplate(content, data.trophyName, translate('email.trophy.intro'), lang),
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
  language?: SupportedEmailLanguage;
}

export async function sendLighterActivityEmail(data: LighterActivityData) {
  const lang = data.language || 'en';
  const translate = t(lang);

  const activityEmojis = {
    new_post: '📖',
    new_like: '❤️',
    refuel: '🔥',
    milestone: '🎯',
  };

  const activityTitle = translate(`email.activity.type.${data.activityType}` as any);

  const content = `
    <p>${translate('email.activity.greeting', { name: data.userName || '' })}</p>
    <p>${translate('email.activity.intro', { lighter: data.lighterName })}</p>

    <div class="section">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 48px;">${activityEmojis[data.activityType]}</div>
      </div>
      <h3>${activityTitle}</h3>
      <p>${data.activityDetails}</p>
      ${data.contributorName ? `<p><strong>${translate('email.activity.by')}</strong> ${data.contributorName}</p>` : ''}
      <p><strong>${translate('email.activity.lighter')}</strong> ${data.lighterName} (${translate('email.activity.pin')} <span class="pin-code">${data.lighterPin}</span>)</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.lighterUrl}" class="button">${translate('email.common.button.view_lighter')}</a>
    </div>

    <p>${translate('email.activity.outro')}</p>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: `${activityEmojis[data.activityType]} ${activityTitle}: ${data.lighterName}`,
    html: wrapEmailTemplate(content, activityTitle, `${data.lighterName}`, lang),
    from: EMAIL_CONFIG.from.notifications,
  });
}

interface WelcomeEmailData {
  userEmail: string;
  userName: string;
  profileUrl: string;
  saveLighterUrl: string;
  language?: SupportedEmailLanguage;
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const lang = data.language || 'en';
  const translate = t(lang);

  const content = `
    <p>${translate('email.welcome.greeting', { name: data.userName })}</p>
    <p>${translate('email.welcome.intro')}</p>

    <div class="section">
      <h3>${translate('email.welcome.what_is_title')}</h3>
      <p>${translate('email.welcome.what_is_content')}</p>
    </div>

    <div class="section">
      <h3>${translate('email.welcome.get_started_title')}</h3>
      <p><strong>${translate('email.welcome.get_started_intro')}</strong></p>
      <ul>
        <li><strong>${translate('email.welcome.step1')}</strong></li>
        <li><strong>${translate('email.welcome.step2')}</strong></li>
        <li><strong>${translate('email.welcome.step3')}</strong></li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.saveLighterUrl}" class="button">${translate('email.common.button.save_lighter')}</a>
    </div>

    <div style="text-align: center; margin: 20px 0; color: ${EMAIL_CONFIG.brandColors.textLight};">
      <p>${translate('email.welcome.questions')}</p>
    </div>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: translate('email.welcome_subject'),
    html: wrapEmailTemplate(content, translate('email.welcome_subject'), undefined, lang),
    from: EMAIL_CONFIG.from.default,
  });
}

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
  language?: SupportedEmailLanguage;
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
  const lang = data.language || 'en';
  const translate = t(lang);

  const content = `
    <p>${translate('email.order_confirmation.greeting', { name: data.userName })}</p>
    <p>${translate('email.order_confirmation.intro')}</p>

    <div class="section">
      <h3>${translate('email.order_confirmation.summary_title')}</h3>
      <p><strong>${translate('email.order_confirmation.order_id')}</strong> ${data.orderId}</p>
      <p><strong>${translate('email.order_confirmation.stickers')}</strong> ${translate('email.order_confirmation.stickers_packs', { quantity: data.quantity, plural: data.quantity > 1 ? 's' : '' })}</p>
      <p><strong>${translate('email.order_confirmation.total_paid')}</strong> ${data.totalAmount} ${data.currency.toUpperCase()}</p>
    </div>

    <div class="section">
      <h3>${translate('email.order_confirmation.lighters_title')}</h3>
      <ul>
        ${data.lighterNames.map((name, i) => `<li><strong>${name}</strong></li>`).join('')}
      </ul>
      <p style="color: ${EMAIL_CONFIG.brandColors.textLight}; font-size: 14px;">
        ${translate('email.order_confirmation.lighters_ready')}
      </p>
    </div>

    <div class="section">
      <h3>${translate('email.order_confirmation.shipping_title')}</h3>
      <p><strong>${data.shippingAddress.name}</strong></p>
      <p>${data.shippingAddress.address}<br>
      ${data.shippingAddress.city}, ${data.shippingAddress.postalCode}<br>
      ${data.shippingAddress.country}</p>
    </div>

    <div class="section">
      <h3>${translate('email.order_confirmation.whats_next_title')}</h3>
      <p>${translate('email.order_confirmation.whats_next_content')}</p>
      <p><strong>${translate('email.order_confirmation.estimated_delivery')}</strong></p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.orderDetailsUrl}" class="button">${translate('email.common.button.view_order')}</a>
    </div>

    <p style="text-align: center; color: ${EMAIL_CONFIG.brandColors.textLight}; font-size: 14px;">
      ${translate('email.order_confirmation.questions')}
    </p>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: translate('email.order_confirmation_subject'),
    html: wrapEmailTemplate(content, translate('email.order_confirmation_subject'), undefined, lang),
    from: EMAIL_CONFIG.from.orders,
  });
}

interface ModeratorInviteData {
  userEmail: string;
  userName: string;
  inviterName: string;
  acceptUrl: string;
  moderatorResponsibilities: string[];
  language?: SupportedEmailLanguage;
}

export async function sendModeratorInviteEmail(data: ModeratorInviteData) {
  const lang = data.language || 'en';
  const translate = t(lang);

  const content = `
    <p>${translate('email.moderator.greeting', { name: data.userName })}</p>
    <p>${translate('email.moderator.intro', { inviter: data.inviterName })}</p>

    <div class="section">
      <h3>${translate('email.moderator.what_is_title')}</h3>
      <p>${translate('email.moderator.what_is_content')}</p>
    </div>

    <div class="section">
      <h3>${translate('email.moderator.responsibilities_title')}</h3>
      <ul>
        ${data.moderatorResponsibilities.map(resp => `<li>${resp}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h3>${translate('email.moderator.benefits_title')}</h3>
      <ul>
        <li>${translate('email.moderator.benefit1')}</li>
        <li>${translate('email.moderator.benefit2')}</li>
        <li>${translate('email.moderator.benefit3')}</li>
        <li>${translate('email.moderator.benefit4')}</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.acceptUrl}" class="button">${translate('email.common.button.accept_invite')}</a>
    </div>

    <p style="text-align: center; color: ${EMAIL_CONFIG.brandColors.textLight};">
      ${translate('email.moderator.not_interested')}
    </p>
  `;

  return sendEmail({
    to: data.userEmail,
    subject: translate('email.moderator_invite_subject'),
    html: wrapEmailTemplate(content, translate('email.moderator_invite_subject'), undefined, lang),
    from: EMAIL_CONFIG.from.moderation,
  });
}

// Export sendEmail as sendCustomEmail for use in webhooks and admin notifications
export { sendEmail as sendCustomEmail };

/**
 * Send fulfillment email to admin with order details and sticker files
 */
interface FulfillmentEmailData {
  orderId: string;
  paymentIntentId: string;
  quantity: number;
  userId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  lighters: Array<{
    lighter_name: string;
    pin_code: string;
    background_color: string;
  }>;
  stickerFiles: Array<{
    filename: string;
    buffer: Buffer;
  }>;
  downloadUrls?: string[];
}

export async function sendFulfillmentEmail(data: FulfillmentEmailData) {
  const fulfillmentEmail = process.env.FULFILLMENT_EMAIL || 'mitch@lightmyfire.app';

  const lighterList = data.lighters
    .map((l, i) => `<p><strong>${i + 1}.</strong> ${l.lighter_name} (PIN: <code>${l.pin_code}</code>) - ${l.background_color}</p>`)
    .join('');

  const fileList = data.stickerFiles
    .map((file, i) => `<li><code>${file.filename}</code> - ${(file.buffer.length / 1024).toFixed(2)} KB</li>`)
    .join('');

  const downloadLinks = data.downloadUrls && data.downloadUrls.length > 0
    ? `
      <h3>🔗 Download Links (Backup)</h3>
      <div style="background: #f0f0f0; padding: 15px; margin: 15px 0; border-radius: 8px;">
        ${data.downloadUrls.map((url, i) =>
          `<a href="${url}" style="display: inline-block; background: #FF6B6B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 5px;">Download Sheet ${i + 1}</a><br/>`
        ).join('')}
        <p style="font-size: 12px; color: #666; margin-top: 10px;">Links valid for 7 days</p>
      </div>
    `
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF6B6B; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .lighter-list { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF6B6B; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔥 New Sticker Order</h2>
          </div>
          <div class="content">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${data.paymentIntentId}</p>
            <p><strong>Quantity:</strong> ${data.quantity} stickers across <strong>${data.stickerFiles.length} sheet(s)</strong></p>
            <p><strong>User ID:</strong> ${data.userId}</p>
            <p><strong>Sheets to Print:</strong> ${data.stickerFiles.length} PNG file(s) attached (each contains up to 10 stickers)</p>

            <h3>Shipping Information</h3>
            <p><strong>Name:</strong> ${data.shippingAddress.name}</p>
            <p><strong>Email:</strong> ${data.shippingAddress.email}</p>
            <p><strong>Address:</strong> ${data.shippingAddress.address}, ${data.shippingAddress.city}, ${data.shippingAddress.postalCode}, ${data.shippingAddress.country}</p>

            <h3>Lighter Details</h3>
            <div class="lighter-list">
              ${lighterList}
            </div>

            <h3>📎 Attached Files</h3>
            <div style="background: #fff; padding: 15px; margin: 15px 0; border: 2px solid #4CAF50; border-radius: 8px;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #4CAF50;">
                ✅ ${data.stickerFiles.length} PNG file(s) attached to this email:
              </p>
              <ul style="margin: 0; padding-left: 20px;">
                ${fileList}
              </ul>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
                Each sheet is print-ready at 600 DPI for Printful.
              </p>
            </div>

            ${downloadLinks}

            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              Sent from LightMyFire Order System<br>
              ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: fulfillmentEmail,
    from: EMAIL_CONFIG.from.orders,
    subject: `New Sticker Order - ${data.quantity} stickers - ${data.paymentIntentId}`,
    html,
    attachments: data.stickerFiles.map((file) => ({
      filename: file.filename,
      content: file.buffer,
    })),
  });
}

export const emailService = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendFirstPostCelebrationEmail,
  sendTrophyEarnedEmail,
  sendLighterActivityEmail,
  sendModeratorInviteEmail,
  sendFulfillmentEmail,
  sendCustomEmail: sendEmail,
  wrapTemplate: wrapEmailTemplate,
  config: EMAIL_CONFIG,
};

export default emailService;
