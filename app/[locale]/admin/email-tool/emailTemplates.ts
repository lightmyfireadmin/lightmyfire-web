// Email template helpers

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

export function wrapEmailTemplate(content: string, title: string, lang = 'en'): string {
  const supportEmail = 'support@lightmyfire.app';
  const year = new Date().getFullYear();

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
          </div>
          <div class="content">
            ${content}
            <div class="footer">
              <p><strong>Keep the flame alive!</strong></p>
              <p style="font-size: 12px; color: #999999;">
                Questions? Contact us at <a href="mailto:${supportEmail}" style="color: #FF6B6B;">${supportEmail}</a>
              </p>
              <p style="font-size: 11px; color: #AAAAAA; margin-top: 15px;">
                © ${year} LightMyFire. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getTemplateContent(templateType: string, lang = 'en'): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lightmyfire.app';

  switch (templateType) {
    case 'welcome':
      return `
<p>Welcome to LightMyFire! 🎉</p>
<p>We're thrilled to have you join our community of LightSavers who are giving lighters a second life.</p>

<div class="section">
  <h3>What is LightMyFire?</h3>
  <p>LightMyFire is a creative platform where discarded lighters get a second chance. By sticking custom QR code stickers on lighters and passing them along, you create a global journey of stories and connections.</p>
</div>

<div class="section">
  <h3>Get Started</h3>
  <p><strong>Here's how to begin your LightSaving journey:</strong></p>
  <ul>
    <li><strong>Save a Lighter:</strong> Create your first lighter and order custom stickers</li>
    <li><strong>Add Stories:</strong> Scan the QR code and share your thoughts</li>
    <li><strong>Track Journeys:</strong> Watch as your lighter travels the world</li>
  </ul>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="${baseUrl}/${lang}/save-lighter" class="button">Save Your First Lighter</a>
</div>`;

    case 'order_confirmation':
      return `
<p>Thank you for your order! 🎉</p>
<p>We've received your sticker order and it will be processed shortly.</p>

<div class="section">
  <h3>Order Summary</h3>
  <p><strong>Order ID:</strong> [Order Number]</p>
  <p><strong>Quantity:</strong> [X] sticker packs</p>
  <p><strong>Total Paid:</strong> €[XX.XX]</p>
</div>

<div class="section">
  <h3>Your Lighters</h3>
  <p>Your custom stickers are being prepared for these lighters:</p>
  <ul>
    <li><strong>[Lighter Name 1]</strong></li>
    <li><strong>[Lighter Name 2]</strong></li>
  </ul>
</div>

<div class="section">
  <h3>What's Next?</h3>
  <p>We'll send you a shipping confirmation email with tracking information once your order ships. Estimated delivery is 5-7 business days.</p>
</div>`;

    case 'order_shipped':
      return `
<p>Great news! Your LightMyFire stickers are on their way! 📦</p>

<div class="section">
  <h3>Shipping Details</h3>
  <p><strong>Order ID:</strong> [Order Number]</p>
  <p><strong>Carrier:</strong> [Carrier Name]</p>
  <p><strong>Tracking Number:</strong> <span class="pin-code">[TRACKING123]</span></p>
  <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="[tracking-url]" class="button">Track Your Package</a>
</div>

<div class="highlight-box">
  <p><strong>Pro Tip:</strong> Once you receive your stickers, stick them on your lighters and start their journey by adding your first post!</p>
</div>`;

    case 'first_post':
      return `
<p>Congratulations! You just lit your first spark! 🌟</p>
<p>You've added the first post to your lighter and started its journey.</p>

<div style="text-align: center; margin: 30px 0;">
  <div style="font-size: 64px;">🔥</div>
  <h2 style="color: #FF6B6B; margin: 10px 0;">Welcome to the Journey!</h2>
</div>

<div class="section">
  <h3>What You Started</h3>
  <p>By adding your first post, you've begun a story that could travel the world. Anyone who finds this lighter can add their own chapter to its journey.</p>
  <p><strong>Lighter:</strong> [Lighter Name]</p>
  <p><strong>PIN:</strong> <span class="pin-code">[PIN123]</span></p>
</div>

<div class="section">
  <h3>Next Steps</h3>
  <ul>
    <li><strong>Share it:</strong> Pass the lighter to a friend or leave it somewhere interesting</li>
    <li><strong>Watch it grow:</strong> Check back to see new posts as it travels</li>
    <li><strong>Keep going:</strong> Save more lighters and create more journeys!</li>
  </ul>
</div>`;

    case 'lighter_activity':
      return `
<p>Someone just interacted with your lighter! 🔔</p>

<div class="section">
  <div style="text-align: center; margin-bottom: 20px;">
    <div style="font-size: 48px;">🔥</div>
  </div>
  <h3>New Activity</h3>
  <p>[Activity description - e.g., "Someone added a new post to your lighter from Paris, France!"]</p>
  <p><strong>Lighter:</strong> [Lighter Name] (<span class="pin-code">[PIN]</span>)</p>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="${baseUrl}/${lang}/lighter/[lighter-id]" class="button">View Lighter Journey</a>
</div>

<p>Keep the flame alive and see where your lighter travels next!</p>`;

    default:
      return `<p>Start composing your custom email here...</p>

<div class="section">
  <h3>Section Title</h3>
  <p>Add your content here. You can use HTML for formatting.</p>
  <ul>
    <li>Bullet point 1</li>
    <li>Bullet point 2</li>
  </ul>
</div>

<div style="text-align: center; margin: 30px 0;">
  <a href="${baseUrl}" class="button">Button Text</a>
</div>`;
  }
}
