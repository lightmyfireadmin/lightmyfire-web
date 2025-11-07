# LightMyFire Email Templates Specification

**Version:** 1.0.0
**Date:** 2025-11-07
**Purpose:** Comprehensive email communication strategy and template definitions

---

## Table of Contents

1. [Email Categories](#email-categories)
2. [Transactional Emails](#transactional-emails)
3. [Marketing Emails](#marketing-emails)
4. [Administrative Emails](#administrative-emails)
5. [Technical Specifications](#technical-specifications)
6. [Template Variables](#template-variables)
7. [Implementation Plan](#implementation-plan)

---

## Email Categories

### 1. Authentication & Account Management
- Account Created (Welcome)
- Email Verification
- Password Reset Request
- Password Changed Confirmation
- Account Deleted Confirmation
- Login Alert (suspicious activity)

### 2. Order & Commerce
- Order Confirmation
- Order Processing
- Order Shipped (with tracking)
- Delivery Confirmation
- Refund Processed
- Payment Failed
- Abandoned Cart Reminder

### 3. Content Moderation
- Post Flagged for Review
- Post Approved
- Post Rejected
- Account Warning
- Multiple Violations Notice

### 4. Community & Engagement
- First Post Celebration
- Trophy Earned
- Lighter Found (someone added to your lighter)
- Weekly Activity Summary
- Monthly Stats Report
- Invitation to be Moderator
- Moderator Accepted

### 5. Marketing & Retention
- Welcome Series (Day 1, 3, 7)
- Thank You Message (after first order)
- Loyalty Milestones
- Re-engagement Campaign
- Feature Announcements
- Product Updates
- Seasonal Campaigns

### 6. Administrative
- Support Ticket Received
- Support Ticket Resolved
- Survey Request
- Feedback Request

---

## TRANSACTIONAL EMAILS

### 1. Account Created (Welcome Email)

**Trigger:** User completes signup
**Send Timing:** Immediately
**Priority:** High

**Subject:** Welcome to LightMyFire! 🔥

**Content:**
```
Hi [USERNAME],

Welcome to the LightMyFire community! We're thrilled to have you join our mission to give lighters a second life.

What's Next?
→ Create your first lighter (it's free!)
→ Order custom stickers to start spreading the movement
→ Explore stories from LightSavers around the world

[CTA Button: Create My First Lighter]

Quick Tips:
• Every lighter gets a unique PIN and QR code
• Anyone who finds it can add their story
• You can track its journey forever

Need help? Reply to this email or visit our FAQ.

Welcome aboard!
The LightMyFire Team

P.S. Did you know? Every year, billions of lighters end up in landfills. Together, we're changing that.
```

**Template Variables:**
- `{{username}}` - User's display name
- `{{profileUrl}}` - Link to user profile
- `{{createLighterUrl}}` - Direct link to create lighter
- `{{faqUrl}}` - FAQ page link

---

### 2. Email Verification

**Trigger:** User signs up or changes email
**Send Timing:** Immediately
**Priority:** Critical

**Subject:** Verify your email for LightMyFire

**Content:**
```
Hi [USERNAME],

Click the button below to verify your email address and activate your LightMyFire account.

[CTA Button: Verify Email]

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

The LightMyFire Team
```

**Template Variables:**
- `{{username}}`
- `{{verificationLink}}` - Magic link with token
- `{{expirationTime}}` - Token expiration (24h)

---

### 3. Password Reset Request

**Trigger:** User clicks "Forgot Password"
**Send Timing:** Immediately
**Priority:** Critical

**Subject:** Reset your LightMyFire password

**Content:**
```
Hi [USERNAME],

We received a request to reset your password.

[CTA Button: Reset Password]

This link expires in 1 hour.

If you didn't request this, please ignore this email. Your password will remain unchanged.

The LightMyFire Team
```

**Template Variables:**
- `{{username}}`
- `{{resetLink}}` - Password reset link with token
- `{{expirationTime}}` - Token expiration (1h)
- `{{ipAddress}}` - Request IP for security
- `{{requestTime}}` - When request was made

---

### 4. Password Changed Confirmation

**Trigger:** User successfully changes password
**Send Timing:** Immediately
**Priority:** High (security)

**Subject:** Your LightMyFire password was changed

**Content:**
```
Hi [USERNAME],

Your password was successfully changed on [DATE] at [TIME].

If you made this change, you're all set! No further action needed.

If you DIDN'T make this change, your account may be compromised.
→ Reset your password immediately: [RESET_LINK]
→ Contact support: support@lightmyfire.app

For your security:
• Device: [DEVICE]
• Location: [LOCATION]
• IP: [IP_ADDRESS]

The LightMyFire Team
```

---

### 5. Account Deleted Confirmation

**Trigger:** User deletes their account
**Send Timing:** Immediately
**Priority:** Medium

**Subject:** Your LightMyFire account has been deleted

**Content:**
```
Hi [USERNAME],

Your LightMyFire account has been permanently deleted.

What happens next:
• Your profile is no longer accessible
• Your posts remain as "Anonymous" contributions
• Your lighters stay active for others to find
• Your order history is archived for legal compliance (30 days)

Miss us already? You can create a new account anytime at lightmyfire.app

We're sorry to see you go. If you have feedback, we'd love to hear it: feedback@lightmyfire.app

The LightMyFire Team
```

---

## ORDER EMAILS

### 6. Order Confirmation

**Trigger:** Payment successful
**Send Timing:** Immediately
**Priority:** Critical

**Subject:** Order Confirmed - [QUANTITY] LightMyFire Stickers (#[ORDER_ID])

**Content:**
```
Hi [NAME],

Thank you for your order! 🎉

Order #[ORDER_ID]
Placed: [DATE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[PACK_SIZE] Custom Stickers        €[SUBTOTAL]
Shipping ([SHIPPING_METHOD])       €[SHIPPING_COST]
                                   ─────────
Total                              €[TOTAL]

Payment Method: •••• [LAST_4_DIGITS]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHIPPING ADDRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[SHIPPING_NAME]
[SHIPPING_ADDRESS_LINE_1]
[SHIPPING_ADDRESS_LINE_2]
[SHIPPING_CITY], [SHIPPING_POSTAL]
[SHIPPING_COUNTRY]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR LIGHTERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your [QUANTITY] custom lighters are already active! Each has a unique PIN:

1. [LIGHTER_NAME_1] - PIN: [PIN_1]
2. [LIGHTER_NAME_2] - PIN: [PIN_2]
...

[View All Lighters in Profile]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT'S NEXT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ⏳ We're preparing your stickers (1-2 business days)
2. 📦 Your order will ship within 5-7 business days
3. 📧 You'll receive tracking info via email
4. 🔥 Your lighters are live at lightmyfire.app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Reply to this email or visit our FAQ.

Thank you for being a LightSaver!
The LightMyFire Team

P.S. While you wait, share your lighters' PINs with friends to start collecting stories!
```

**Template Variables:**
- `{{orderId}}`
- `{{orderDate}}`
- `{{customerName}}`
- `{{packSize}}`
- `{{subtotal}}`
- `{{shippingMethod}}`
- `{{shippingCost}}`
- `{{total}}`
- `{{cardLast4}}`
- `{{shippingAddress}}` - Full formatted address
- `{{lightersList}}` - Array of {name, pin, color}
- `{{trackLightersUrl}}`

---

### 7. Order Shipped

**Trigger:** Fulfillment team marks order as shipped
**Send Timing:** Immediately
**Priority:** High

**Subject:** Your LightMyFire stickers are on the way! 📦

**Content:**
```
Hi [NAME],

Great news! Your order #[ORDER_ID] has shipped.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRACKING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Carrier: [CARRIER_NAME]
Tracking #: [TRACKING_NUMBER]

[CTA Button: Track Your Package]

Estimated Delivery: [DELIVERY_ESTIMATE]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT'S IN YOUR PACKAGE?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• [QUANTITY] custom stickers ([SHEETS] sheets)
• Each sticker has a unique QR code and PIN
• Application instructions included

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW TO USE YOUR STICKERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Peel and stick on a lighter
2. Give it away or "lose" it intentionally
3. Watch stories appear at lightmyfire.app
4. Share the PIN with friends to kickstart the journey

[Watch Tutorial Video]

Questions? We're here to help: support@lightmyfire.app

Happy LightSaving!
The LightMyFire Team
```

---

### 8. Refund Processed

**Trigger:** Admin processes refund
**Send Timing:** Immediately
**Priority:** High

**Subject:** Refund Processed for Order #[ORDER_ID]

**Content:**
```
Hi [NAME],

Your refund for order #[ORDER_ID] has been processed.

Refund Amount: €[REFUND_AMOUNT]
Refund Method: [PAYMENT_METHOD] ending in [LAST_4]
Processing Date: [REFUND_DATE]

You should see the refund in your account within 5-10 business days, depending on your bank.

Order Details:
• Original Order: [ORDER_DATE]
• Items: [PACK_SIZE] stickers
• Reason: [REFUND_REASON]

If you have any questions, please reply to this email.

The LightMyFire Team
```

---

## MODERATION EMAILS

### 9. Post Flagged for Review

**Trigger:** Post receives 3+ flags OR AI flags content
**Send Timing:** Within 1 hour (batched)
**Priority:** Medium

**Subject:** Your post is under review

**Content:**
```
Hi [USERNAME],

Your recent post on lighter "[LIGHTER_NAME]" has been flagged for review by our moderation team.

Post Type: [POST_TYPE]
Posted: [POST_DATE]
Reason: [FLAG_REASON]

What happens next:
• Our team will review your post within 24 hours
• If approved, it will be visible again
• If rejected, we'll explain why

Our community guidelines are at: [GUIDELINES_URL]

If you believe this is a mistake, reply to this email.

The LightMyFire Team
```

---

### 10. Post Approved

**Trigger:** Moderator approves flagged post
**Send Timing:** Immediately
**Priority:** Low

**Subject:** Your post has been approved ✓

**Content:**
```
Hi [USERNAME],

Good news! Your post on lighter "[LIGHTER_NAME]" has been reviewed and approved.

It's now visible to the community again.

Thank you for being part of LightMyFire!
The Team
```

---

### 11. Post Rejected

**Trigger:** Moderator rejects post
**Send Timing:** Immediately
**Priority:** Medium

**Subject:** Update on your flagged post

**Content:**
```
Hi [USERNAME],

After review, we've removed your post from lighter "[LIGHTER_NAME]" as it violates our community guidelines.

Reason: [REJECTION_REASON]

Specifically:
[DETAILED_EXPLANATION]

What you can do:
• Review our guidelines: [GUIDELINES_URL]
• Appeal this decision: [APPEAL_URL]
• Learn more about our moderation: [FAQ_URL]

We appreciate your understanding as we work to keep LightMyFire safe and welcoming for everyone.

The LightMyFire Team
```

---

### 12. Invitation to be Moderator

**Trigger:** Admin invites user to moderator role
**Send Timing:** Immediately
**Priority:** High

**Subject:** You're invited to become a LightMyFire Moderator! 🎖️

**Content:**
```
Hi [USERNAME],

We've been impressed by your contributions to the LightMyFire community, and we'd like to invite you to become a moderator!

As a moderator, you'll:
• Help review flagged content
• Ensure our community stays safe and welcoming
• Get early access to new features
• Join our moderator Discord channel

This is a volunteer role, but we deeply appreciate the time and effort our moderators contribute.

Interested? Accept your invitation:
[CTA Button: Accept Invitation]

Not interested? That's totally fine - just ignore this email.

Questions? Read our Moderator FAQ: [MOD_FAQ_URL]

Thank you for being an awesome LightSaver!
The LightMyFire Team
```

---

## ENGAGEMENT EMAILS

### 13. First Post Celebration

**Trigger:** User creates their first post
**Send Timing:** 1 hour after post creation
**Priority:** Low

**Subject:** You just added your first story! 🎉

**Content:**
```
Hi [USERNAME],

Congratulations! You've just contributed to lighter "[LIGHTER_NAME]"'s story.

Your post is now part of a journey that could travel the world. Every time someone finds this lighter and adds to its story, you'll see it grow.

What's next?
→ Share the PIN ([PIN_CODE]) with friends
→ Check back to see new stories
→ Create more lighters and spread the movement

[View Your Post]

Welcome to the LightSaver community!
The Team
```

---

### 14. Trophy Earned

**Trigger:** User earns a trophy
**Send Timing:** Immediately
**Priority:** Low

**Subject:** You earned a trophy! [TROPHY_NAME] 🏆

**Content:**
```
Hi [USERNAME],

Awesome! You just unlocked: [TROPHY_NAME]

[TROPHY_ICON_IMAGE]

[TROPHY_DESCRIPTION]

Your Stats:
• Lighters Created: [LIGHTER_COUNT]
• Stories Told: [POST_COUNT]
• Trophies Earned: [TROPHY_COUNT]/10

[View All Trophies]

Keep going, LightSaver!
The Team
```

---

### 15. Lighter Found (Activity Notification)

**Trigger:** Someone adds a post to user's lighter
**Send Timing:** Daily digest (batched)
**Priority:** Low

**Subject:** Someone added to your lighter's story! 🔥

**Content:**
```
Hi [USERNAME],

Your lighter "[LIGHTER_NAME]" has new activity!

[CONTRIBUTOR_USERNAME] just added:
📝 [POST_TYPE] • [TIME_AGO]

"[POST_PREVIEW]"

[CTA Button: Read the Full Story]

Your lighter has now traveled to [POST_COUNT] stories across [CONTRIBUTOR_COUNT] people!

Turn off these notifications: [PREFERENCES_URL]

Happy LightSaving!
The Team
```

---

### 16. Weekly Activity Summary

**Trigger:** Every Monday at 9 AM user's timezone
**Send Timing:** Scheduled
**Priority:** Low
**Opt-out:** Yes

**Subject:** Your LightMyFire Week in Review

**Content:**
```
Hi [USERNAME],

Here's what happened with your lighters this week:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 YOUR STATS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[NEW_POSTS_COUNT] new stories added
[NEW_CONTRIBUTORS_COUNT] new contributors
[TOTAL_VIEWS] lighter views
[TOTAL_LIKES] likes received

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 MOST ACTIVE LIGHTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[LIGHTER_NAME] (PIN: [PIN])
• [POST_COUNT] stories
• Last activity: [LAST_ACTIVITY]

[View Lighter]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 COMMUNITY HIGHLIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This week, LightSavers:
• Created [GLOBAL_LIGHTERS] new lighters
• Shared [GLOBAL_POSTS] stories
• Saved [PLASTIC_SAVED]g of plastic from landfills

Keep spreading the fire!
The LightMyFire Team

[Unsubscribe from weekly summaries]
```

---

## MARKETING EMAILS

### 17. Welcome Series - Day 1

**Trigger:** 24 hours after account creation (if no lighter created)
**Priority:** Medium

**Subject:** Ready to create your first lighter?

**Content:**
```
Hi [USERNAME],

We noticed you haven't created your first lighter yet. No worries - we're here to help!

Creating a lighter is:
✓ 100% FREE
✓ Takes less than 2 minutes
✓ Gives lighters a second life

[CTA Button: Create My First Lighter]

Not sure where to start? Here's inspiration:
• "My Lucky Lighter" - for that one that never leaves your pocket
• "World Traveler" - one you plan to give away
• "Grandpa's Zippo" - honoring a special lighter

Need physical stickers? You can order those too, starting at just €7.20 for 10.

Questions? Just reply to this email.

Let's light the fire!
The Team
```

---

### 18. Welcome Series - Day 3

**Trigger:** 3 days after creation (if lighter created but no posts)
**Priority:** Low

**Subject:** Your lighter is waiting for its first story

**Content:**
```
Hi [USERNAME],

Your lighter "[LIGHTER_NAME]" is ready for its first story!

Ideas for your first post:
📝 Where did you get this lighter?
📍 Where are you right now?
🎵 What song are you listening to?
📷 Take a photo of the lighter

[Add First Story]

Remember: You can make posts public (for the homepage mosaic) or keep them private (just for this lighter's page).

Happy storytelling!
The Team
```

---

### 19. Thank You After First Order

**Trigger:** 3 days after order shipped
**Priority:** Medium

**Subject:** Thank you for supporting LightMyFire 💚

**Content:**
```
Hi [NAME],

Your stickers should have arrived by now! We wanted to say a huge THANK YOU for supporting our mission.

Every sticker you ordered helps:
🌍 Reduce plastic waste
💡 Spread creative storytelling
🤝 Build a global community

We'd love to see your lighters in action!
→ Share photos on Instagram: @lightmyfire.official
→ Tag us with #LightMyFire

[SPECIAL OFFER]
As a thank you, enjoy 15% off your next order with code: THANKYOU15
[Valid for 30 days]

Keep spreading the fire!
The LightMyFire Team

P.S. Questions or feedback? We're always listening: hello@lightmyfire.app
```

---

### 20. Feature Announcement

**Trigger:** Manual send by admin
**Priority:** Medium

**Subject:** [NEW_FEATURE_NAME] is here! 🎉

**Content:**
```
Hi [USERNAME],

Exciting news! We just launched [NEW_FEATURE_NAME].

[FEATURE_HERO_IMAGE]

What's new:
→ [FEATURE_BENEFIT_1]
→ [FEATURE_BENEFIT_2]
→ [FEATURE_BENEFIT_3]

[CTA Button: Try It Now]

We'd love to hear what you think! Reply with your feedback.

Happy LightSaving!
The Team

[See Full Release Notes]
```

---

## ADMINISTRATIVE EMAILS

### 21. Support Ticket Received

**Trigger:** User submits contact form
**Send Timing:** Immediately
**Priority:** Medium

**Subject:** We received your message (Ticket #[TICKET_ID])

**Content:**
```
Hi [NAME],

Thank you for contacting LightMyFire support. We've received your message and will respond within 24 hours.

Ticket #[TICKET_ID]
Subject: [SUBJECT]
Received: [DATE]

Your message:
"[MESSAGE_PREVIEW]"

In the meantime:
• Check our FAQ: [FAQ_URL]
• Join our community Discord: [DISCORD_URL]

We'll be in touch soon!
The LightMyFire Team
```

---

## TECHNICAL SPECIFICATIONS

### Email Infrastructure

**Email Service Provider:** Resend
**Domain:** lightmyfire.app
**Sending Address:** hello@lightmyfire.app
**Reply-To:** hello@lightmyfire.app
**Support:** support@lightmyfire.app

### Authentication
- SPF: Configured
- DKIM: Configured
- DMARC: Policy set to quarantine

### Rate Limits
- Transactional: 100/second
- Marketing: Respects user preferences
- Bulk: Batched with delays

### Unsubscribe Management
- One-click unsubscribe header
- Preference center for granular control
- Marketing vs Transactional separation

---

## TEMPLATE VARIABLES

### Global Variables (Available in all emails)
```javascript
{
  username: string,
  email: string,
  profileUrl: string,
  preferencesUrl: string,
  unsubscribeUrl: string,
  supportUrl: string,
  faqUrl: string,
  currentYear: number,
  brandColor: string, // #FF6B6B
  logoUrl: string
}
```

### User-Specific
```javascript
{
  userId: string,
  joinDate: string,
  lighterCount: number,
  postCount: number,
  trophyCount: number
}
```

### Order-Specific
```javascript
{
  orderId: string,
  orderDate: string,
  packSize: number,
  subtotal: number,
  shippingCost: number,
  total: number,
  shippingAddress: {
    name: string,
    line1: string,
    line2?: string,
    city: string,
    postal: string,
    country: string
  },
  lighters: Array<{
    name: string,
    pinCode: string,
    backgroundColor: string
  }>,
  trackingNumber?: string,
  carrier?: string
}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Critical Transactional (Week 1)
- [ ] Email Verification
- [ ] Password Reset
- [ ] Order Confirmation
- [ ] Order Shipped

### Phase 2: Essential (Week 2)
- [ ] Welcome Email
- [ ] Account Deleted
- [ ] Password Changed
- [ ] Refund Processed
- [ ] Post Moderation (flagged/approved/rejected)

### Phase 3: Engagement (Week 3)
- [ ] First Post Celebration
- [ ] Trophy Earned
- [ ] Lighter Activity
- [ ] Welcome Series (Day 1, 3)

### Phase 4: Marketing (Week 4)
- [ ] Weekly Summary
- [ ] Thank You After Order
- [ ] Feature Announcements
- [ ] Re-engagement Campaign

### Phase 5: Advanced (Month 2)
- [ ] Moderator Invitation
- [ ] Support Tickets
- [ ] Loyalty Programs
- [ ] Seasonal Campaigns

---

## EMAIL DESIGN SYSTEM

### Typography
- Headings: Poppins Bold, 24-32px
- Body: Poppins Regular, 16px
- Links: Poppins Medium, underlined
- CTAs: Poppins Bold, 16px

### Colors
- Primary: #FF6B6B (brand coral)
- Secondary: #4ECDC4 (teal)
- Success: #22c55e (green)
- Warning: #eab308 (yellow)
- Error: #ef4444 (red)
- Text: #1f2937 (dark gray)
- Background: #ffffff (white)

### Spacing
- Section padding: 40px
- Paragraph spacing: 16px
- Button padding: 12px 24px

### Mobile-First
- Single column layout
- Minimum touch target: 44x44px
- Responsive images
- Dark mode compatible

---

## LOCALIZATION

All emails should support 27 languages:
- English (default)
- French, Spanish, German, Italian, Portuguese
- Dutch, Russian, Polish, Japanese, Korean
- Chinese (Simplified), Thai, Vietnamese, Hindi
- Arabic, Persian, Urdu, Marathi, Telugu
- Indonesian, Ukrainian, Turkish

Subject lines and main content translated.
Footer and legal text in user's language.

---

## COMPLIANCE

### GDPR
- Explicit consent for marketing emails
- Easy unsubscribe (one-click)
- Data deletion on request
- Privacy policy linked in footer

### CAN-SPAM
- Physical address in footer
- Clear "From" identification
- Accurate subject lines
- Honor opt-out within 10 days

### Accessibility
- Plain text alternative
- Alt text for images
- Semantic HTML
- High contrast ratios

---

## SUCCESS METRICS

### Open Rates (Targets)
- Transactional: >40%
- Engagement: >25%
- Marketing: >20%

### Click Rates (Targets)
- Transactional: >15%
- Engagement: >10%
- Marketing: >5%

### Unsubscribe Rates (Limits)
- Marketing: <0.5%
- Engagement: <0.2%

---

**Next Steps:**
1. Create email templates in Resend
2. Implement email service wrapper in codebase
3. Add email triggers to relevant API endpoints
4. Set up analytics and tracking
5. A/B test subject lines and content
6. Monitor deliverability and engagement

---

**End of Email Templates Specification**
