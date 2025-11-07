# Email Service Usage Guide

## Overview

The centralized email service (`lib/email.ts`) provides a clean API for sending all transactional and engagement emails using Resend.

## Setup

1. Add your Resend API key to `.env.local`:
```bash
RESEND_API_KEY=re_your_actual_key_here
```

2. Verify your sending domain in Resend dashboard for production use.

## Available Email Functions

### Order Emails

#### Send Order Shipped Notification
```typescript
import { emailService } from '@/lib/email';

await emailService.sendOrderShippedEmail({
  orderId: 'pi_abc123',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  trackingNumber: '1Z999AA10123456784',
  trackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
  carrier: 'UPS',
  quantity: 20,
  lighterNames: ['My First Lighter', 'Travel Buddy'],
  estimatedDelivery: 'November 15, 2025'
});
```

### Moderation Emails

#### Notify User Their Post Was Flagged
```typescript
await emailService.sendPostFlaggedEmail({
  userEmail: 'user@example.com',
  userName: 'John',
  postType: 'Text Post',
  postContent: 'This was my post content...',
  lighterName: 'My Lighter',
  lighterPin: '123-456',
  flagReason: 'Reported as inappropriate',
  postId: 'post_123'
});
```

#### Notify User Their Post Was Approved
```typescript
await emailService.sendPostApprovedEmail({
  userEmail: 'user@example.com',
  userName: 'John',
  postType: 'Text Post',
  lighterName: 'My Lighter',
  lighterPin: '123-456',
  postUrl: 'https://lightmyfire.app/en/lighter/abc123'
});
```

#### Notify User Their Post Was Rejected
```typescript
await emailService.sendPostRejectedEmail({
  userEmail: 'user@example.com',
  userName: 'John',
  postType: 'Text Post',
  postContent: 'This was my post content...',
  lighterName: 'My Lighter',
  lighterPin: '123-456',
  rejectionReason: 'Violates community guidelines',
  violationDetails: 'Content contains hate speech',
  appealUrl: 'https://lightmyfire.app/en/appeal?post=123'
});
```

### Engagement Emails

#### Celebrate First Post
```typescript
await emailService.sendFirstPostCelebrationEmail({
  userEmail: 'user@example.com',
  userName: 'John',
  lighterName: 'My First Lighter',
  lighterPin: '123-456',
  postType: 'Text Post',
  lighterUrl: 'https://lightmyfire.app/en/lighter/abc123'
});
```

#### Notify Trophy Earned
```typescript
await emailService.sendTrophyEarnedEmail({
  userEmail: 'user@example.com',
  userName: 'John',
  trophyName: 'First Spark',
  trophyIcon: '🔥',
  trophyDescription: 'Created your first lighter',
  achievementDetails: 'You created your first lighter and started your LightMyFire journey!',
  profileUrl: 'https://lightmyfire.app/en/my-profile'
});
```

#### Notify Lighter Activity
```typescript
await emailService.sendLighterActivityEmail({
  userEmail: 'user@example.com',
  userName: 'John',
  lighterName: 'Travel Buddy',
  lighterPin: '123-456',
  activityType: 'new_post',
  activityDetails: 'Someone just added a new story to your lighter from Paris, France!',
  contributorName: 'Marie',
  lighterUrl: 'https://lightmyfire.app/en/lighter/abc123'
});
```

Activity types: `'new_post' | 'new_like' | 'refuel' | 'milestone'`

### Admin Emails

#### Invite Moderator
```typescript
await emailService.sendModeratorInviteEmail({
  userEmail: 'user@example.com',
  userName: 'John Doe',
  inviterName: 'Admin Team',
  acceptUrl: 'https://lightmyfire.app/en/moderator/invite/abc123',
  moderatorResponsibilities: [
    'Review flagged posts within 24 hours',
    'Approve or reject content based on guidelines',
    'Respond to user appeals professionally',
    'Report patterns of abuse to admin team'
  ]
});
```

## Custom Emails

For one-off or custom emails, use the low-level functions:

```typescript
// Send custom HTML email
const result = await emailService.sendCustomEmail({
  to: 'user@example.com',
  subject: 'Custom Email Subject',
  html: '<html><body>Your custom HTML here</body></html>',
  from: emailService.config.from.notifications,
  replyTo: 'support@lightmyfire.app'
});

if (result.success) {
  console.log('Email sent:', result.id);
} else {
  console.error('Email failed:', result.error);
}
```

```typescript
// Use branded template wrapper
const customContent = `
  <p>Your custom content here...</p>
  <a href="#" class="button">Call to Action</a>
`;

const html = emailService.wrapTemplate(
  customContent,
  'Email Title',
  'Optional subtitle'
);

await emailService.sendCustomEmail({
  to: 'user@example.com',
  subject: 'Custom Email',
  html
});
```

## Email Configuration

Access email configuration:

```typescript
import { emailService } from '@/lib/email';

// Brand colors
const colors = emailService.config.brandColors;
console.log(colors.primary); // '#FF6B6B'

// From addresses
const from = emailService.config.from;
console.log(from.orders); // 'LightMyFire Orders <orders@lightmyfire.app>'
```

## Error Handling

All email functions return a promise that resolves to:

```typescript
{
  success: boolean;
  error?: string;
  id?: string; // Resend email ID if successful
}
```

Example with error handling:

```typescript
const result = await emailService.sendOrderShippedEmail(data);

if (!result.success) {
  console.error('Failed to send email:', result.error);
  // Handle error: retry, log to monitoring, notify admin, etc.
} else {
  console.log('Email sent successfully:', result.id);
  // Update database: email_sent = true
}
```

## Integration Points

### When to send emails:

1. **Order Shipped** - When Printful/fulfillment updates order status
2. **Post Flagged** - Immediately when post receives flag
3. **Post Approved/Rejected** - When moderator takes action
4. **First Post** - Right after post is created (check if first)
5. **Trophy Earned** - When achievement is unlocked
6. **Lighter Activity** - Configurable (immediate, daily digest, weekly)
7. **Moderator Invite** - When admin promotes user

### Example API route integration:

```typescript
// app/api/moderate-post/route.ts
import { emailService } from '@/lib/email';

export async function POST(request: Request) {
  // ... moderation logic ...

  if (action === 'approve') {
    await emailService.sendPostApprovedEmail({
      userEmail: post.author_email,
      userName: post.author_name,
      postType: post.type,
      lighterName: lighter.name,
      lighterPin: lighter.pin_code,
      postUrl: `${baseUrl}/${locale}/lighter/${post.lighter_id}`
    });
  } else if (action === 'reject') {
    await emailService.sendPostRejectedEmail({
      userEmail: post.author_email,
      userName: post.author_name,
      postType: post.type,
      postContent: post.content,
      lighterName: lighter.name,
      lighterPin: lighter.pin_code,
      rejectionReason: moderationReason,
      violationDetails: moderationDetails
    });
  }

  // ... rest of logic ...
}
```

## Localization (Future Enhancement)

Currently, all emails are sent in English. To add multi-language support:

1. Create translation files: `lib/email/locales/{locale}.json`
2. Add locale parameter to email functions
3. Load translations based on user's preferred language
4. Use translation keys instead of hardcoded strings

Example structure:
```json
{
  "orderShipped": {
    "subject": "Your LightMyFire Stickers Have Shipped! 📦",
    "greeting": "Great news, {{name}}!",
    "body": "Your custom LightMyFire stickers have been shipped..."
  }
}
```

## Testing

Test emails in development using Resend test mode:

1. Use test API key (starts with `re_test_`)
2. Emails won't actually send but will appear in Resend dashboard
3. Verify HTML rendering, links, and content

## Production Checklist

Before going live:

- [ ] Add production RESEND_API_KEY to environment variables
- [ ] Verify sending domain in Resend (lightmyfire.app)
- [ ] Set up SPF, DKIM, DMARC records
- [ ] Test all email templates with real data
- [ ] Configure email rate limits if needed
- [ ] Set up email delivery monitoring
- [ ] Add unsubscribe links to marketing emails (not transactional)

## Support

For issues with the email service:
- Check Resend dashboard for delivery logs
- Verify environment variables are set correctly
- Ensure email addresses are valid
- Check spam folders if emails aren't received
- Review Resend API status page for outages

---

**Note:** This service replaces the old inline email templates. Future refactoring should migrate remaining inline emails (order confirmation, contact form) to use this centralized service.
