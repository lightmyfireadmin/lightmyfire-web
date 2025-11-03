# Payment Flow Refactor - Implementation Plan

## Current Situation
- User customizes stickers → Downloads PNG → Pays separately
- No database records created
- No real PIN codes
- Manual fulfillment process unclear

## New Flow (Payment-First Approach)

### Step-by-Step User Journey:

1. **Pack Selection** ✅ (Already exists)
   - Starting LightSaver: 10 stickers (1 sheet)
   - Committed LightSaver: 20 stickers (2 sheets)
   - Community LightSaver: 50 stickers (5 sheets)

2. **Lighter Customization** ✅ (Already exists, needs validation fix)
   - Name each lighter
   - Choose background color
   - Select second language
   - **NEW:** "Apply to all" checkbox validation

3. **Shipping Information** 🔨 (Needs to be added)
   - Full name
   - Email
   - Street address
   - City
   - Postal code
   - Country dropdown

4. **Preview Stickers** ✅ (Already exists)
   - Show preview with chosen customizations
   - **REMOVE**: Download button

5. **Payment** 🔨 (Needs update)
   - **NEW Stripe Account**: pk_live_51QgeN5FayiEdCFiWPCs2ouVw6Vg816zUBGZdHINK1nJfHUitNuX6eIThcV7WukfeWStvkOmQCRQ2u9EVsPLJk0sV00p2Z8Ebq4
   - Process payment with Stripe
   - **CRITICAL**: Only proceed if payment succeeds

6. **Post-Payment Processing** 🔨 (New API endpoint)
   - Create lighters in database with auto-generated PINs
   - Generate sticker PNG with real PIN codes
   - Email PNG + order details to editionsrevel@gmail.com
   - Check for trophy unlocks
   - Show success page

---

## Technical Implementation

### Database Changes

#### New Function: `create_bulk_lighters`
```sql
-- Created in: CREATE_BULK_LIGHTERS_FUNCTION.sql
-- Purpose: Create multiple lighters and return with PINs
-- Returns: lighter_id, lighter_name, pin_code, background_color
```

### API Routes

#### New: `/api/process-sticker-order`
**Purpose**: Handle complete post-payment workflow
**Input**:
```typescript
{
  paymentIntentId: string;
  lighterData: Array<{name, backgroundColor, language}>;
  shippingAddress: {name, email, address, city, postalCode, country};
}
```
**Process**:
1. Verify payment with Stripe
2. Call `create_bulk_lighters` DB function
3. Generate PNG with real PINs using `/api/generate-printful-stickers`
4. Email to editionsrevel@gmail.com with order details
5. Return success + lighter IDs

#### Update: `/api/create-payment-intent`
**Needs**: Update Stripe secret key to new account

### Frontend Changes

#### Update: `SaveLighterFlow.tsx`
**Changes needed**:
- Update pack options (5→10, 10→20, 50→50)
- Update pack descriptions
- Add shipping address form
- Remove supplier selection
- Disable payment until shipping complete

#### Update: `StripePaymentForm.tsx`
**Changes needed**:
- Update publishable key to new account
- Add shipping address props
- Call `/api/process-sticker-order` on success
- Redirect to success page with lighter IDs

#### Update: `StickerPreview.tsx`
**Changes needed**:
- **REMOVE**: PNG download buttons
- Keep preview only
- Add note: "Stickers will be generated after payment"

#### Update: `LighterPersonalizationCards.tsx`
**Changes needed**:
- Form validation: disable save if any name empty (unless "apply to all" checked)
- Show error messages for empty fields

### Environment Variables Needed

```env
# Stripe (new account)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51QgeN5FayiEdCFiWPCs2ouVw6Vg816zUBGZdHINK1nJfHUitNuX6eIThcV7WukfeWStvkOmQCRQ2u9EVsPLJk0sV00p2Z8Ebq4
STRIPE_SECRET_KEY=sk_live_... (get from Stripe dashboard)

# Email for order fulfillment
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Email Template

**To**: editionsrevel@gmail.com
**Subject**: New Sticker Order - {quantity} stickers - {paymentId}
**Body**:
```
New Sticker Order - {paymentId}

Customer Information:
- Name: {name}
- Email: {email}
- Address: {full address}

Order Details:
- Quantity: {count} stickers
- Payment ID: {paymentId}
- User ID: {userId}

Lighter Details:
1. {name} (PIN: ABC-123) - Color: #FF6B6B
2. {name} (PIN: DEF-456) - Color: #4CAF50
...

[Attached: stickers-{paymentId}.png]
```

---

## Implementation Order

### Phase 1: Database ✅
- [x] Create `CREATE_BULK_LIGHTERS_FUNCTION.sql`
- [ ] Run SQL in Supabase dashboard

### Phase 2: Backend API ✅
- [x] Create `/api/process-sticker-order/route.ts`
- [ ] Update Stripe keys
- [ ] Add nodemailer dependency
- [ ] Configure email credentials

### Phase 3: Frontend Forms 🔄
- [ ] Add shipping address fields
- [ ] Update pack sizes/descriptions
- [ ] Add form validation
- [ ] Remove download buttons

### Phase 4: Payment Integration 🔄
- [ ] Update Stripe publishable key
- [ ] Wire up new API endpoint
- [ ] Handle success/error states
- [ ] Create order success page

### Phase 5: Testing 🔄
- [ ] Test end-to-end flow in development
- [ ] Verify email delivery
- [ ] Verify lighter creation
- [ ] Verify trophy unlocks
- [ ] Test with real Stripe test cards

---

## Dependencies to Install

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

---

## Security Considerations

1. **Payment Verification**: Always verify payment status with Stripe before creating lighters
2. **User Authentication**: Verify session.user.id matches p_user_id
3. **Email Security**: Use app passwords, not actual Gmail password
4. **SQL Injection**: Using parameterized queries via Supabase RPC
5. **Rate Limiting**: Consider adding rate limits to prevent abuse

---

## Future Enhancements (Post-MVP)

- Direct Printful API integration (instead of manual email)
- Automatic price calculation based on Printful API + shipping country
- Order tracking for customers
- Admin dashboard for order management
- Webhook for Stripe payment confirmation
- Customer email confirmation
- Support for custom branding orders

---

## Questions to Resolve

1. What should happen if lighter creation succeeds but email fails?
2. Should we store order records in a separate `orders` table?
3. What happens if user refreshes during payment?
4. Do we need email confirmation to customer or just to fulfillment email?
5. Should we add a "custom branding" contact form now or later?

