# LightMyFire - Complete Product Specification & Testing Guide

**Version:** 0.8.0
**Last Updated:** 2025-11-06
**Purpose:** Complete specification of all features, pages, flows, and functionality for comprehensive testing

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Pages & Routes](#2-pages--routes)
3. [User Flows](#3-user-flows)
4. [Features Deep Dive](#4-features-deep-dive)
5. [Forms & Validations](#5-forms--validations)
6. [API Endpoints](#6-api-endpoints)
7. [Database Operations](#7-database-operations)
8. [Integrations](#8-integrations)
9. [Internationalization](#9-internationalization)
10. [Admin Features](#10-admin-features)
11. [Edge Cases & Error Handling](#11-edge-cases--error-handling)
12. [Testing Paths](#12-testing-paths)

---

## 1. Application Overview

### 1.1 What is LightMyFire?

LightMyFire is a web application that transforms disposable lighters into collaborative storytelling objects. Users purchase custom stickers with QR codes and PINs, affix them to lighters, and anyone who finds the lighter can scan the code to add stories, photos, songs, or locations to its digital logbook.

### 1.2 Core Value Proposition

- **Reduce Waste:** Give lighters a second life instead of throwing them away
- **Global Mosaic:** Create a collaborative art project connecting people worldwide
- **Storytelling:** Each lighter becomes a unique narrative told by multiple people
- **Community:** Build connections through shared objects and stories

### 1.3 User Roles

**Anonymous Users:**
- Can view homepage and public pages
- Cannot add posts or save lighters
- Redirected to login when attempting protected actions

**Authenticated Users:**
- Can create lighters (digitally for free)
- Can add posts to lighters (with 24-hour cooldown per lighter)
- Can order physical stickers
- Can view their profile and lighters
- Can like and flag posts

**Moderators:**
- All authenticated user permissions
- Access to moderation dashboard
- Can review flagged posts
- Can approve/reject posts

**Admin:**
- All moderator permissions
- Access to admin dashboard
- Can refund orders
- Can view all system data

---

## 2. Pages & Routes

### 2.1 Public Pages (No Authentication Required)

#### 2.1.1 Home Page
- **Route:** `/{locale}` or `/`
- **File:** `app/[locale]/page.tsx`
- **Purpose:** Main landing page introducing the concept

**Elements:**
- Hero section with title "I'm Too Young To Die" and lighter illustration
- PIN entry form to find lighters
  - Input field with format XXX-XXX
  - Auto-formatting (adds hyphen after 3 characters)
  - "Find Lighter" button with search icon
  - InfoPopup explaining what PIN is
  - Supports pre-filled PIN from QR code scan (`?pin=XXX-XXX`)
- "Become a LightSaver" CTA section
  - Description of the project
  - Button linking to `/save-lighter`
  - Rainbow arrow illustration
- "How It Works" section (3 steps)
  - Step 1: Save - Create digital logbook and download sticker
  - Step 2: Share - Pass lighter around for others to find
  - Step 3: Discover - Follow stories as they accumulate
- Random Post Feed (mosaic)
  - Shows 4 random public posts
  - "See More Stories" refresh button (rotates posts)
  - "Load More" button (loads additional posts)
  - MosaicSkeleton loading state
  - Each post card shows: username, time, content, likes
- Navigation header with language selector
- Footer with social links, legal pages

**States:**
- Initial load: Shows skeleton for random posts
- Posts loaded: Displays post cards
- Refreshing: Shows spinning icon on refresh button
- Loading more: Shows skeleton below existing posts
- No posts: Shows "No public stories yet"

**Interactions:**
- Enter PIN → Navigate to `/lighter/{id}`
- Click "Become a LightSaver" → Navigate to `/save-lighter`
- Click "See More Stories" → Refresh random posts with fade animation
- Click "Load More" → Fetch and append more posts
- Invalid PIN → Show error message

---

#### 2.1.2 Find Page
- **Route:** `/{locale}/find`
- **File:** `app/[locale]/find/page.tsx`
- **Purpose:** Dedicated page for finding lighters by PIN

**Elements:**
- Centered PinEntryForm (same as homepage)
- Supports URL parameter `?pin=XXX-XXX` to pre-fill PIN
- Full-screen layout

**Use Cases:**
- Direct navigation to find page
- QR code scan landing page (with pre-filled PIN)
- Bookmark/share the find functionality

---

#### 2.1.3 About Page
- **Route:** `/{locale}/about`
- **File:** `app/[locale]/about/page.tsx`
- **Purpose:** Detailed explanation of the LightMyFire philosophy

**Content:**
- Project origin story
- Environmental impact statistics
- Community goals and vision
- How the project works in detail
- Call to action to participate

---

#### 2.1.4 "Don't Throw Me Away" Page
- **Route:** `/{locale}/dont-throw-me-away`
- **File:** `app/[locale]/dont-throw-me-away/page.tsx`
- **Purpose:** Educational page about lighter waste and refilling

**Content:**
- Statistics on lighter waste
- Environmental impact
- How to refill lighters (guide with illustrations)
- Tips for extending lighter life
- Links to refill supplies

---

#### 2.1.5 FAQ Page
- **Route:** `/{locale}/legal/faq`
- **File:** `app/[locale]/legal/faq/page.tsx`
- **Purpose:** Frequently asked questions

**Questions Covered:**
- What is LightMyFire?
- How do stickers work?
- Can I post twice on the same lighter?
- What is the 24-hour cooldown?
- Public vs private posts
- How to order stickers
- Pricing information
- Shipping details
- Safety and moderation

---

#### 2.1.6 Privacy Policy
- **Route:** `/{locale}/legal/privacy`
- **File:** `app/[locale]/legal/privacy/page.tsx`
- **Purpose:** Legal privacy policy

**Content:**
- Data collection practices
- How user data is used
- Third-party services (Stripe, Supabase, OpenAI)
- User rights (GDPR compliance)
- Cookie policy
- Contact information for privacy concerns

---

#### 2.1.7 Terms of Use
- **Route:** `/{locale}/legal/terms`
- **File:** `app/[locale]/legal/terms/page.tsx`
- **Purpose:** Legal terms and conditions

**Content:**
- User responsibilities
- Prohibited content
- Intellectual property rights
- Limitation of liability
- Dispute resolution
- Content moderation policies
- Refund policy

---

### 2.2 Authentication Pages

#### 2.2.1 Login/Signup Page
- **Route:** `/{locale}/login`
- **File:** `app/[locale]/login/page.tsx`
- **Purpose:** User authentication via Supabase Auth

**Elements:**
- Supabase Auth UI component
- Email/password login
- Magic link login (passwordless)
- Social authentication (if configured)
- Sign up form
- Password reset option

**Post-Login Behavior:**
- Redirects to homepage
- Shows SignupWelcomeModal for new users (only once)
- Session persisted in cookies

**Validation:**
- Email format validation
- Password requirements (min 6 characters)
- Error messages for invalid credentials

---

#### 2.2.2 Auth Callback
- **Route:** `/{locale}/auth/callback`
- **File:** `app/[locale]/auth/callback/page.tsx`
- **Purpose:** Handle OAuth and magic link callbacks

**Behavior:**
- Processes authentication tokens
- Redirects to intended destination or homepage
- Handles errors silently

---

### 2.3 Protected Pages (Authentication Required)

#### 2.3.1 My Profile
- **Route:** `/{locale}/my-profile`
- **File:** `app/[locale]/my-profile/page.tsx`
- **Authentication:** Required
- **Purpose:** User dashboard showing their lighters and stats

**Elements:**
- User information display
- List of user's lighters with cards showing:
  - Lighter name
  - PIN code
  - Background color indicator
  - Post count
  - Created date
  - View/Download sticker buttons
- Stats section:
  - Total lighters created
  - Total posts made
  - Lighters saved (if orders exist)

**Actions:**
- Click lighter → Navigate to `/lighter/{id}`
- Download sticker → Opens sticker PDF
- Create new lighter → Navigate to `/save-lighter`

**States:**
- Loading: Shows LighterCardSkeleton
- No lighters: Shows empty state with CTA to create one
- Has lighters: Displays grid of lighter cards

---

#### 2.3.2 Save Lighter Page
- **Route:** `/{locale}/save-lighter`
- **File:** `app/[locale]/save-lighter/page.tsx`
- **Authentication:** Required
- **Purpose:** Create digital lighter or order physical stickers

**Flow Stages:**

**Stage 1: Pack Selection**
- Three pack options displayed:
  - **Starting LightSaver:** 10 stickers (1 sheet) - €7.20
  - **Committed LightSaver:** 20 stickers (2 sheets) - €14.40
  - **Community LightSaver:** 50 stickers (5 sheets) - €36.00
- Each card shows:
  - Title
  - Sticker count
  - Sheet count
  - Description
  - "Price at checkout" note
  - "Select" button
- Custom branding CTA (email contact form)

**Stage 2: Lighter Personalization**
- LighterPersonalizationCards component
- Number of cards = selected pack size
- For each lighter:
  - Name input (required, max 20 characters)
  - Background color picker (6 preset colors)
  - Language selector (all 27 supported languages)
- Options:
  - "Apply same design to all" checkbox
  - When checked: first card's values auto-fill all others
  - PIN codes remain unique
- "Save Customizations" button

**Stage 3: Order Summary**
- Displays before shipping address
- Shows:
  - Pack size (X stickers)
  - Language selected
  - "✓ Customized" status
  - Subtotal (pack price)
- "Change Pack" button to go back

**Stage 4: Shipping Address Form**
- Fields:
  - Name (required)
  - Email (required, validation)
  - Address line 1 (required)
  - Address line 2 (optional)
  - City (required)
  - Postal/ZIP code (required)
  - Country (required, dropdown with all countries)
- Validates all required fields
- On save → Calculates shipping rates via `/api/calculate-shipping`

**Stage 5: Shipping Method Selection**
- Appears after address saved
- Two options:
  - **Standard Shipping:** 7-14 business days, lower cost
  - **Express Shipping:** 3-5 business days, higher cost
- Radio button selection
- Prices displayed with locale-aware formatting
- Updates total dynamically

**Stage 6: Sticker Preview**
- Grid display of up to 5 sticker designs
- Shows full sticker layout:
  - Lighter name
  - Generated PIN code
  - Background color
  - QR code
  - All text elements
- "+X more" indicator if > 5 stickers
- Note: Actual files generated after payment

**Stage 7: Payment**
- Stripe payment form (StripePaymentForm component)
- Elements:
  - Card number input
  - Expiry date
  - CVC
  - Postal code
- Payment amount: Pack price + shipping
- "Pay Now" button
- Shows order ID
- Processing states with spinner

**Post-Payment:**
- Processes order via `/api/process-sticker-order`
- Creates lighters in database with unique PINs
- Generates sticker PNG files
- Sends confirmation email to customer
- Sends order email to fulfillment address
- Redirects to `/save-lighter/order-success?email={email}&count={count}`

**Validations:**
- Must select pack before personalization
- Must personalize all lighters before shipping
- Must provide valid shipping address
- Must select shipping method
- Must have valid payment method
- Stripe validates card details

---

#### 2.3.3 Order Success Page
- **Route:** `/{locale}/save-lighter/order-success`
- **File:** `app/[locale]/save-lighter/order-success/page.tsx`
- **Query Params:** `?email={email}&count={count}`
- **Purpose:** Confirmation after successful sticker order

**Content:**
- Success message with checkmark
- Order details:
  - Number of stickers ordered
  - Email address for confirmation
- Next steps:
  - Lighters are active in account
  - Stickers being prepared
  - Shipping timeline (5-7 business days)
  - Tracking number coming via email
- CTA buttons:
  - "View My Lighters" → `/my-profile`
  - "Return Home" → `/`

---

#### 2.3.4 Lighter Success Page
- **Route:** `/{locale}/save-lighter/success/[id]`
- **File:** `app/[locale]/save-lighter/success/[id]/page.tsx`
- **Purpose:** Confirmation after creating digital lighter (free)

**Content:**
- Celebration animation/confetti
- Lighter details:
  - Name
  - PIN code (prominently displayed)
  - QR code
  - Background color
- Download sticker button (generates PDF)
- Instructions:
  - Print sticker
  - Affix to lighter
  - Pass it on for others to find
- "Create Another Lighter" button
- "View Lighter Page" button → `/lighter/{id}`

---

#### 2.3.5 Lighter Detail Page
- **Route:** `/{locale}/lighter/[id]`
- **File:** `app/[locale]/lighter/[id]/page.tsx`
- **Authentication:** PIN code required (can be entered by anyone)
- **Purpose:** View lighter's full story and posts

**Access Control:**
- If user doesn't know PIN:
  - Shows PIN entry modal
  - Must enter correct PIN to view
  - PIN stored in session for this lighter
- If user knows PIN (from QR, session, or is owner):
  - Full access to lighter page

**Header Section:**
- Lighter name (large, prominent)
- PIN code displayed
- Background color indicator
- Owner information (if public)
- Post count
- Created date

**Post Timeline:**
- Reverse chronological list of all posts
- Each post shows:
  - Post type icon (text, song, image, location, refuel)
  - Author username (or "Anonymous" if deleted account)
  - Timestamp (relative time, e.g., "2 hours ago")
  - Content based on type:
    - **Text:** Message content
    - **Song:** YouTube embed player
    - **Image:** Uploaded image (lightbox on click)
    - **Location:** Map with pinpoint
    - **Refuel:** Refuel message with emoji
  - Like button with count
  - Flag button (report inappropriate content)
  - Public/Private indicator
- Infinite scroll or pagination

**Add Post Section:**
- "Add Your Story" button (fixed or at top)
- Checks 24-hour cooldown per lighter
- If cooldown active:
  - Shows countdown timer
  - Explains why cooldown exists
  - Suggests passing lighter to someone else
- If can post → Navigate to `/lighter/{id}/add`

**Moderation:**
- Flagged posts show "Under Review" badge
- Approved posts show normally
- Rejected posts hidden from view

**Empty States:**
- No posts yet: "Be the first to add a story!"
- CTA to add post

---

#### 2.3.6 Add Post Page
- **Route:** `/{locale}/lighter/[id]/add`
- **File:** `app/[locale]/lighter/[id]/add/page.tsx`
- **Authentication:** Required + PIN knowledge + No cooldown
- **Purpose:** Add a new post to a lighter

**Post Type Selection:**
- 5 cards for each post type:
  1. **Text Post** (blue)
  2. **Song Post** (red - YouTube)
  3. **Image Post** (green)
  4. **Location Post** (yellow)
  5. **Refuel Post** (orange)
- Clicking card opens corresponding form

**Text Post Form:**
- Text area (required)
- Max 500 characters
- Character counter
- Public post checkbox (default: off)
- "Post" button
- Moderation note

**Song Post Form:**
- YouTube URL input (required)
- Format: youtube.com/watch?v=... or youtu.be/...
- Validates URL format
- Shows video preview after valid URL
- Public post checkbox
- "Post" button

**Image Post Form:**
- File upload (drag & drop or click)
- Accepted formats: PNG, JPG, JPEG, GIF
- Max size: 2 MB
- Image preview after upload
- Optional caption (max 200 characters)
- Public post checkbox
- "Post" button
- Image moderation via OpenAI

**Location Post Form:**
- Interactive map (LocationPicker component)
- Click to set location pin
- Or search for location (geocoding)
- Optional location name/description
- Shows coordinates
- Public post checkbox
- "Post" button

**Refuel Post:**
- Simple confirmation
- Pre-written message: "I refueled this lighter!"
- Emoji: 🔥
- Public post checkbox
- "Post" button
- No additional input needed

**Validation Rules:**
- Text post: 1-500 characters
- Song post: Valid YouTube URL
- Image post: File < 2MB, accepted format
- Location post: Valid coordinates
- All: Passes content moderation

**Post-Submission:**
- Content moderation check (OpenAI)
- If flagged → Manual review queue
- If approved → Immediately visible
- Starts 24-hour cooldown for this lighter
- Redirects to `/lighter/{id}`
- Success notification

**Error Handling:**
- Cooldown active → Redirect with message
- Moderation failure → Show error, allow retry
- Upload failure → Show error, allow retry
- Invalid input → Inline validation errors

---

### 2.4 Moderation & Admin Pages

#### 2.4.1 Moderation Dashboard
- **Route:** `/{locale}/moderation`
- **File:** `app/[locale]/moderation/page.tsx`
- **Authentication:** Required (moderator or admin role)
- **Purpose:** Review flagged and auto-flagged posts

**Layout:**
- Tabs or sections:
  - Pending Review
  - Flagged by Users
  - Auto-Flagged (OpenAI)
  - Recently Approved
  - Recently Rejected

**Post Review Card:**
- Post content (full display)
- Post type indicator
- Author information
- Lighter information
- Flag reason (if user-flagged)
- Moderation score (if auto-flagged)
- Timestamp
- Actions:
  - Approve button
  - Reject button
  - View context (see other posts by user)
  - View lighter page

**Filtering & Sorting:**
- Filter by post type
- Filter by flag reason
- Sort by date
- Sort by severity

**Bulk Actions:**
- Select multiple posts
- Approve all selected
- Reject all selected

**Stats:**
- Total pending reviews
- Today's review count
- Approval rate
- Average review time

---

#### 2.4.2 Admin Dashboard
- **Route:** `/{locale}/admin`
- **File:** `app/[locale]/admin/page.tsx`
- **Authentication:** Required (admin role only)
- **Purpose:** Administrative functions and system overview

**Sections:**

**1. Order Management:**
- Recent orders list
- Order details:
  - Order ID (Stripe payment intent)
  - Customer name & email
  - Pack size
  - Shipping address
  - Order date
  - Status (pending, shipped, delivered)
- Actions:
  - View order details
  - Refund order (calls `/api/admin/refund-order`)
  - Mark as shipped
  - Download sticker files

**2. System Stats:**
- Total users
- Total lighters created
- Total posts
- Total orders
- Revenue (current month, all time)
- Active lighters (with posts)
- Public posts percentage

**3. User Management:**
- Search users
- View user profiles
- See user's lighters
- See user's posts
- Promote to moderator
- Ban user (future feature)

**4. Content Overview:**
- Recent posts (all)
- Most active lighters
- Trending lighters
- Flagged content count

**5. System Health:**
- Database status
- API health checks
- Storage usage
- Error logs (if integrated)

---

## 3. User Flows

### 3.1 New User Journey

**Flow: Sign Up → Create First Lighter → Add First Post**

1. User visits homepage
2. Clicks "Become a LightSaver"
3. Redirected to `/login`
4. Signs up with email/password or magic link
5. Email verification (if required)
6. Login successful → SignupWelcomeModal appears
7. Modal explains project and shows "Create Your First Lighter"
8. User creates free digital lighter:
   - Enters name
   - Picks color
   - Clicks "Create Lighter"
9. Redirected to `/save-lighter/success/[id]`
10. Sees lighter details and download sticker option
11. Clicks "View Lighter Page" → `/lighter/{id}`
12. Clicks "Add Your Story"
13. Selects post type (e.g., Text)
14. Writes message
15. Checks "Make Public" if desired
16. Posts
17. Content moderated
18. Post appears on lighter page
19. 24-hour cooldown starts

**Alternate Path: Order Stickers First**

1-6. Same as above
7. Modal has "Order Stickers" option
8. Navigate to `/save-lighter`
9. Select pack size (10, 20, or 50)
10. Personalize each lighter
11. Enter shipping address
12. Calculate shipping → Select shipping method
13. Preview stickers
14. Enter payment details
15. Complete payment
16. Order processed:
    - Lighters created in database
    - Sticker files generated
    - Emails sent
17. Redirect to `/save-lighter/order-success`
18. Stickers ship within 5-7 days

---

### 3.2 Finding a Lighter Journey

**Flow: QR Code Scan → View Posts → Add Own Post**

1. User finds physical lighter with sticker
2. Scans QR code with phone camera
3. Opens `lightmyfire.app/find?pin=ABC-123`
4. Sees homepage with PIN pre-filled
5. Clicks "Find Lighter" (or auto-submits)
6. System looks up PIN in database
7. If PIN valid → Navigate to `/lighter/{id}`
8. If not logged in → Can view posts but not add
9. User reads existing stories on lighter
10. Decides to add their own story
11. Clicks "Add Your Story"
12. Prompted to login/signup
13. After auth, returns to lighter page
14. Clicks "Add Your Story" again
15. Checks for 24-hour cooldown
16. If OK, navigate to `/lighter/{id}/add`
17. Selects post type and creates post
18. Post submitted and moderated
19. Post appears on lighter page

**Alternate: Manual PIN Entry**

1. User goes to `lightmyfire.app`
2. Sees PIN entry form
3. Types PIN manually (e.g., ABC-123)
4. Clicks "Find Lighter"
5. Rest same as above from step 6

**Alternate: Invalid PIN**

1-4. Same as above
5. PIN not found in database
6. Error message: "Invalid PIN. Please try again."
7. User can retry

---

### 3.3 Content Moderation Flow

**Flow: User Flags Post → Moderator Reviews → Decision**

1. User sees inappropriate post on lighter page
2. Clicks flag icon on post
3. Confirms flag action
4. Post status updated to "flagged"
5. Post appears in moderation dashboard
6. Moderator logs in
7. Navigate to `/moderation`
8. Sees flagged post in queue
9. Reviews post content
10. Views context (other posts by user, lighter history)
11. Makes decision:
    - **Approve:** Post becomes visible again, flag removed
    - **Reject:** Post hidden from public view
12. Decision recorded in database
13. User notified (if notification system exists)

**Auto-Moderation Flow:**

1. User submits post
2. Content sent to OpenAI moderation API
3. If flagged:
   - Post marked for review
   - Added to moderation queue
   - User sees "Under review" message
4. Moderator reviews same as above
5. If approved → Visible
6. If rejected → Hidden

---

### 3.4 Refund Order Flow

**Flow: Admin Refunds Customer Order**

1. Customer emails support requesting refund
2. Admin logs into admin dashboard
3. Searches for order by email or order ID
4. Finds order in list
5. Clicks "Refund" button
6. Confirmation modal appears with order details
7. Admin confirms refund
8. System calls `/api/admin/refund-order`
9. Stripe API processes refund
10. Database updated (order status → refunded)
11. Customer receives refund (3-10 business days)
12. Confirmation email sent to customer
13. Admin sees success message

---

## 4. Features Deep Dive

### 4.1 Lighter Creation System

**Purpose:** Create digital or physical lighters with unique identities

**Components:**
- Database: `lighters` table
- RPC: `create_new_lighter`, `create_bulk_lighters`
- Frontend: SaveLighterFlow, LighterPersonalizationCards

**Data Model:**
```
lighter {
  id: UUID (primary key)
  user_id: UUID (foreign key to profiles)
  name: string (max 100 chars)
  pin_code: string (6 chars, format XXX-XXX, unique)
  background_color: string (hex color)
  created_at: timestamp
  language: string (ISO 639-1 code)
}
```

**PIN Generation:**
- Format: XXX-XXX (3 letters/numbers, hyphen, 3 letters/numbers)
- Characters: A-Z, 0-9 (uppercase)
- Uniqueness: Database enforced via unique constraint
- Collision handling: Retry with new PIN if collision

**Lighter Name Rules:**
- Min length: 1 character
- Max length: 100 characters
- Allowed characters: Any UTF-8 (supports international names)
- Examples: "My Lucky Lighter", "火" (Japanese), "Зажигалка" (Russian)

**Background Colors:**
- Preset palette:
  - Blue: #3b82f6
  - Green: #22c55e
  - Yellow: #eab308
  - Red: #ef4444
  - Purple: #a855f7
  - Pink: #ec4899
- Future: Custom color picker

**Language Selection:**
- Available for stickers (27 languages)
- Determines sticker text translations
- Does not affect web interface language

---

### 4.2 Post Creation System

**Purpose:** Add content to lighters' digital logbooks

**Post Types:**

**1. Text Post:**
- Icon: 💬
- Color: Blue (#3b82f6)
- Max length: 500 characters
- Supports: UTF-8, emojis, line breaks
- Moderation: OpenAI text moderation

**2. Song Post:**
- Icon: 🎵
- Color: Red (#ef4444)
- Accepts: YouTube URLs only
- Formats supported:
  - https://www.youtube.com/watch?v=VIDEO_ID
  - https://youtu.be/VIDEO_ID
  - https://m.youtube.com/watch?v=VIDEO_ID
- Validates: Video ID extraction
- Displays: Embedded YouTube player
- Moderation: URL validation (no content moderation)

**3. Image Post:**
- Icon: 🖼️
- Color: Green (#22c55e)
- File types: PNG, JPG, JPEG, GIF
- Max size: 2 MB
- Storage: Supabase Storage (`post-images` bucket)
- Optional caption: Max 200 characters
- Moderation: OpenAI image moderation
- Display: Clickable thumbnail → Lightbox

**4. Location Post:**
- Icon: 📍
- Color: Yellow (#eab308)
- Input: Interactive map (LocationPicker)
- Data stored: Latitude, longitude
- Optional: Location name/description
- Display: Embedded map with marker
- Privacy: Exact coordinates shown

**5. Refuel Post:**
- Icon: 🔥
- Color: Orange (#f97316)
- Message: "I refueled this lighter!"
- Purpose: Track lighter being kept alive
- No additional input needed
- Display: Simple message card

**Common Features:**
- Public/Private toggle:
  - Public: Appears on homepage mosaic
  - Private: Only on lighter's own page
  - Default: Private
- Timestamps: Stored as UTC, displayed in user's timezone
- Likes: Users can like any post
- Flagging: Users can report inappropriate content

**Cooldown System:**
- Duration: 24 hours per lighter
- Starts: After post creation
- Scope: Per user, per lighter
- Bypass: None (enforced by database)
- Purpose: Encourage passing lighter to others
- Check: Before showing "Add Post" option
- Display: Countdown timer if active

---

### 4.3 Sticker Generation System

**Purpose:** Create printable stickers with QR codes and PINs

**Sticker Specifications:**
- Size: 5cm (height) × 2cm (width)
- Format: PNG (high resolution, 300 DPI)
- Layout: Portrait orientation
- Sheet: Multiple stickers per sheet (Stickiply format)

**Sticker Content (from top to bottom):**

1. **Name Card (white background):**
   - "You found me" (bold, centered)
   - "I'm [LIGHTER_NAME]" (bold, centered)

2. **Invitation Text (on colored background):**
   - "Read my story and expand it" (English, bold, white)
   - Translation in selected language (white)

3. **QR Code:**
   - URL: `https://lightmyfire.app/find?pin=XXX-XXX`
   - Size: Optimized for scanning
   - Color: Black on white
   - **Unique per lighter** (contains specific PIN)

4. **Alternative Instructions (white background):**
   - "or go to"
   - "lightmyfire.app" (bold)

5. **Manual Entry Instructions (on colored background):**
   - "and type my code" (English, bold, white)
   - Translation in selected language (white)

6. **PIN Code (white background):**
   - Format: XXX-XXX (bold, centered, large font)
   - Example: ABC-123

7. **Logo Section (white background):**
   - LightMyFire logo (LOGOLONG.png)
   - Extends to bottom edge

**Background Color:**
- User-selected from preset palette
- Applied to sections 2, 5 (text areas)

**Translations Supported (sample):**
- French (fr): "Lis mon histoire et enrichis-la"
- Spanish (es): "Lee mi historia y ampliala"
- German (de): "Lesen Sie meine Geschichte"
- Italian (it): "Leggi la mia storia e ampliala"
- Portuguese (pt): "Leia minha história e expanda"
- (All 27 languages supported)

**Generation Endpoints:**

**1. `/api/generate-sticker-pdf`:**
- Purpose: Generate single lighter sticker (free users)
- Input: Single lighter data (name, PIN, color, language)
- Output: PNG file
- Use case: Download from success page

**2. `/api/generate-printful-stickers`:**
- Purpose: Generate multi-sticker sheets for orders
- Input: Array of lighter data (10, 20, or 50 stickers)
- Output: PNG sheet (7.5" × 5" at 300 DPI)
- Layout: Grid with proper spacing (Stickiply specs)
- Use case: Order fulfillment

**Sheet Layout (Stickiply Format):**
- Dimensions: 7.5" × 5" (1890px × 1500px at 300 DPI)
- Sticker size: ~236px × 591px (2cm × 5cm at 300 DPI)
- Gap: ~118px (1cm at 300 DPI)
- Margins: 1cm on all sides
- Capacity: 10 stickers per sheet
- Multiple sheets for larger orders

**QR Code Details:**
- Library: qrcode (npm)
- Error correction: Medium
- Margin: 0 (tight fit)
- Color: Black (#000000)
- Background: White (#FFFFFF)
- Each QR contains unique URL with PIN

---

### 4.4 Payment & Order System

**Purpose:** Process sticker orders with Stripe payment

**Pack Options:**
- **10 stickers (1 sheet):** €7.20 base price
- **20 stickers (2 sheets):** €14.40 base price
- **50 stickers (5 sheets):** €36.00 base price

**Pricing:**
- Currency: EUR (euros)
- Stored as: Cents (e.g., 720 = €7.20)
- Display: Locale-aware formatting
  - en-US: "$7.20"
  - fr-FR: "7,20 €"
  - de-DE: "7,20 €"

**Shipping Calculation:**
- Endpoint: `/api/calculate-shipping`
- Input: Country code, pack size
- Integration: Printful Shipping API
- Returns: Standard & Express rates
- Standard: 7-14 business days
- Express: 3-5 business days
- Rates vary by country

**Order Flow:**

1. **Pack Selection:** User chooses 10, 20, or 50 stickers
2. **Personalization:** Customize each lighter (name, color, language)
3. **Shipping Address:** Enter delivery address
4. **Shipping Calculation:** Fetch rates from Printful
5. **Shipping Method:** Choose Standard or Express
6. **Payment Intent:** Create via `/api/create-payment-intent`
7. **Payment Form:** Stripe Elements (card details)
8. **Payment Processing:** Stripe API handles transaction
9. **Order Processing:** `/api/process-sticker-order`
10. **Lighter Creation:** Batch create in database with PINs
11. **Sticker Generation:** Generate PNG sheets with real PINs
12. **Email Notifications:**
    - Customer: Order confirmation with details
    - Fulfillment: Order details + sticker files attached
13. **Database Update:** Order recorded with payment intent ID
14. **Redirect:** Success page with confirmation

**Order Data Model:**
```
Order (via Stripe metadata):
- payment_intent_id: string (Stripe ID)
- customer_email: string
- pack_size: number (10, 20, or 50)
- shipping_address: object
- lighter_ids: array (created lighter UUIDs)
- order_date: timestamp
```

**Payment Validation:**
- Pack size must be 10, 20, or 50
- Amount must be >= base pack price
- Amount must be <= 10x base price (fraud prevention)
- Payment intent status must be "succeeded"
- Verified via Stripe API before processing

**Email Templates:**

**Customer Email:**
```
Subject: Order Confirmed - {count} LightMyFire Stickers

Hi {name},

Thank you for your order!

Order Details:
- Order ID: {payment_intent_id}
- Quantity: {count} custom stickers
- Shipping to: {address}

Your Lighters:
1. {lighter_name} (PIN: XXX-XXX)
2. ...

What's Next?
1. Stickers being prepared with your unique PINs
2. Order processed and prepared for shipping
3. Shipped within 5-7 business days
4. Tracking number sent via email

Your lighters are already active!
Visit: https://lightmyfire.app

Questions? Reply to this email.

The LightMyFire Team
```

**Fulfillment Email:**
```
Subject: New Sticker Order - {count} stickers - {payment_intent_id}

New Sticker Order

Customer:
- Name: {name}
- Email: {email}
- Address: {full_address}

Order Details:
- Quantity: {count} stickers
- Payment ID: {payment_intent_id}
- User ID: {user_id}

Lighter Details:
1. {name} (PIN: XXX-XXX) - Color: {hex}
2. ...

Attachment: stickers-{payment_intent_id}.png

Please fulfill this order.
```

---

### 4.5 Content Moderation System

**Purpose:** Keep platform safe with AI and human moderation

**Two-Tier System:**

**Tier 1: Automated (OpenAI Moderation API)**

Triggered on:
- Text post submission
- Image post upload
- Image uploads in general

Text Moderation:
- Endpoint: `/api/moderate-text`
- API: OpenAI Moderation API
- Input: Text content
- Output: Moderation categories & scores
- Categories checked:
  - Hate speech
  - Harassment
  - Self-harm
  - Sexual content
  - Violence
  - Illegal activities
- Threshold: Flagged if any category > 0.5
- Action: Mark post for review

Image Moderation:
- Endpoint: `/api/moderate-image`
- API: OpenAI Vision API
- Input: Image file (base64)
- Output: Content analysis
- Checks: Similar categories as text
- Action: Mark image for review if flagged

**Tier 2: Human Review (Moderator Dashboard)**

Post States:
- `pending`: Awaiting first review
- `approved`: Passed moderation, visible
- `rejected`: Failed moderation, hidden
- `flagged`: User-reported or auto-flagged

Moderator Capabilities:
- View all flagged/pending posts
- See full post content
- View context (other posts by user)
- View lighter history
- Approve post (make visible)
- Reject post (hide from view)
- Bulk actions

Moderation Queue:
- Sorted by: Timestamp (oldest first)
- Filtered by:
  - Post type
  - Flag reason
  - Severity
- Search by: Author, lighter, content

**User Flagging:**
- Flag button on each post
- Reasons:
  - Inappropriate content
  - Spam
  - Offensive
  - Other
- Effect: Adds to moderation queue
- Immediate: Post remains visible until reviewed

**Moderation Decisions:**
- Approve: Post visible, flag removed, author notified
- Reject: Post hidden, author notified (future), flag resolved

---

### 4.6 Internationalization (i18n) System

**Purpose:** Support global audience with 27 languages

**Supported Languages:**

| Code | Language | Native Name |
|------|----------|-------------|
| en | English | English |
| fr | French | Français |
| es | Spanish | Español |
| de | German | Deutsch |
| it | Italian | Italiano |
| pt | Portuguese | Português |
| nl | Dutch | Nederlands |
| ru | Russian | Русский |
| pl | Polish | Polski |
| ja | Japanese | 日本語 |
| ko | Korean | 한국어 |
| zh-CN | Chinese (Simplified) | 中文 |
| th | Thai | ไทย |
| vi | Vietnamese | Tiếng Việt |
| hi | Hindi | हिन्दी |
| ar | Arabic | العربية |
| fa | Persian/Farsi | فارسی |
| ur | Urdu | اردو |
| mr | Marathi | मराठी |
| te | Telugu | తెలుగు |
| id | Indonesian | Bahasa Indonesia |
| uk | Ukrainian | Українська |
| tr | Turkish | Türkçe |

**Implementation:**

**Structure:**
- Locale files: `/locales/{lang}.ts`
- Format: Key-value pairs
- Example: `'home.hero.title': 'I'm Too Young To Die'`

**Routing:**
- Dynamic route: `/[locale]/{page}`
- Language in URL: `/fr/about`, `/ja/login`
- Middleware: Redirects root to default locale
- Default: English (`en`)

**Language Switching:**
- Dropdown in navigation header
- Shows language name in native script
- Preserves current page path
- Example: `/en/about` → `/fr/about`

**RTL Support:**
- Detected for: Arabic (ar), Farsi (fa), Urdu (ur), Hebrew (he)
- Function: `isRTL(locale)` in utils
- Layout adjustments: Text direction, alignment

**Translation Coverage:**

All UI strings translated:
- Navigation menus
- Page titles and headings
- Form labels and placeholders
- Button text
- Error messages
- Validation messages
- Post types
- Email templates (future)
- Sticker text (partial - invitation phrases)

Not translated:
- User-generated content (posts)
- Lighter names
- Admin interface (English only)

**Client-Side Access:**
```typescript
import { useI18n, useCurrentLocale } from '@/locales/client';

const t = useI18n();
const locale = useCurrentLocale();

<h1>{t('home.hero.title')}</h1>
<p>{formatCurrency(price, 'EUR', locale)}</p>
```

**Server-Side Access:**
```typescript
import { getI18n, getCurrentLocale } from '@/locales/server';

const t = await getI18n();
const locale = await getCurrentLocale();
```

**Locale-Aware Formatting:**
- Currency: `formatCurrency(cents, currency, locale)`
  - Uses `Intl.NumberFormat`
  - Respects locale conventions
  - Examples:
    - en-US: "$7.20"
    - fr-FR: "7,20 €"
    - ja-JP: "¥720"
- Dates: Relative time formatting
- Numbers: Thousands separators

---

## 5. Forms & Validations

### 5.1 PIN Entry Form

**Location:** Homepage, Find page
**Component:** `PinEntryForm.tsx`

**Fields:**
- **PIN Input:**
  - Type: Text
  - Format: XXX-XXX
  - Max length: 7 characters (including hyphen)
  - Auto-formatting: Adds hyphen after 3rd character
  - Allowed characters: A-Z, 0-9 (uppercase)
  - Placeholder: "ABC-123"
  - Required: Yes
  - Auto-fill: Supports `?pin=` query parameter

**Validation:**
- Format check: Must match XXX-XXX pattern
- Character validation: Only alphanumeric
- Length: Exactly 6 characters (excluding hyphen)
- Database lookup: PIN must exist

**Submit Behavior:**
- Calls: `supabase.rpc('get_lighter_id_from_pin')`
- Success: Navigate to `/lighter/{id}`
- Error: "Invalid PIN. Please try again."

**States:**
- Default: Empty input
- Pre-filled: PIN from QR code
- Loading: "Searching..." spinner
- Error: Red error message below input

---

### 5.2 Shipping Address Form

**Location:** Save Lighter flow
**Component:** `ShippingAddressForm.tsx`

**Fields:**

1. **Full Name:**
   - Type: Text
   - Required: Yes
   - Min length: 2 characters
   - Max length: 100 characters
   - Placeholder: "John Doe"

2. **Email:**
   - Type: Email
   - Required: Yes
   - Format: Valid email (RFC 5322)
   - Placeholder: "you@example.com"
   - Used for: Order confirmation

3. **Address Line 1:**
   - Type: Text
   - Required: Yes
   - Max length: 200 characters
   - Placeholder: "123 Main Street"

4. **Address Line 2:**
   - Type: Text
   - Required: No
   - Max length: 200 characters
   - Placeholder: "Apt 4B"

5. **City:**
   - Type: Text
   - Required: Yes
   - Max length: 100 characters
   - Placeholder: "New York"

6. **Postal Code:**
   - Type: Text
   - Required: Yes
   - Format: Varies by country
   - Max length: 20 characters
   - Placeholder: "10001"

7. **Country:**
   - Type: Dropdown select
   - Required: Yes
   - Options: All countries (from Printful API)
   - Default: None (user must select)

**Validation Rules:**
- All required fields must be filled
- Email must be valid format
- No special validation for postal code format (varies globally)
- Country must be selected from dropdown

**Submit Behavior:**
- On save: Calls `/api/calculate-shipping`
- Stores address in state
- Fetches shipping rates
- Displays shipping method selection

**Error Handling:**
- Required field empty: "This field is required"
- Invalid email: "Please enter a valid email"
- Shipping calculation fail: Shows error, allows retry

---

### 5.3 Lighter Personalization Form

**Location:** Save Lighter flow
**Component:** `LighterPersonalizationCards.tsx`

**Fields (per lighter):**

1. **Lighter Name:**
   - Type: Text input
   - Required: Yes
   - Min length: 1 character
   - Max length: 20 characters (for sticker layout)
   - Placeholder: "My Lucky Lighter"
   - Character counter: Shows remaining chars

2. **Background Color:**
   - Type: Color picker (preset colors)
   - Required: Yes
   - Options: 6 preset colors (blue, green, yellow, red, purple, pink)
   - Display: Color swatches
   - Selection: Click to select

3. **Language:**
   - Type: Dropdown select
   - Required: Yes
   - Options: All 27 supported languages
   - Default: User's current locale
   - Display: Native language names

**Global Options:**
- **Apply to All Checkbox:**
  - When checked: First lighter's values copy to all
  - PIN codes remain unique
  - Useful for identical sticker sets

**Validation:**
- All lighters must have name, color, language
- Names within length constraints
- Must personalize all lighters before proceeding

**Submit Behavior:**
- Saves customizations to state
- Advances to shipping address form
- Data used for sticker generation

---

### 5.4 Post Creation Forms

**Location:** Add Post page (`/lighter/[id]/add`)

#### 5.4.1 Text Post Form

**Fields:**
1. **Message:**
   - Type: Textarea
   - Required: Yes
   - Min length: 1 character
   - Max length: 500 characters
   - Placeholder: "Share your story..."
   - Character counter: Live update
   - Line breaks: Allowed

2. **Make Public:**
   - Type: Checkbox
   - Default: Unchecked (private)
   - Label: "Share on homepage mosaic"

**Validation:**
- Message: 1-500 characters
- Content moderation: OpenAI check
- Blocked if: Flagged by AI

**Submit:**
- Endpoint: `create_new_post` RPC
- Moderates: Automatically
- Redirects: To lighter page on success

---

#### 5.4.2 Song Post Form

**Fields:**
1. **YouTube URL:**
   - Type: Text input (URL)
   - Required: Yes
   - Format: YouTube URL patterns
   - Placeholder: "https://www.youtube.com/watch?v=..."
   - Validation: Extracts video ID

2. **Make Public:**
   - Same as text post

**Validation:**
- URL format: Must match YouTube patterns
  - `youtube.com/watch?v=VIDEO_ID`
  - `youtu.be/VIDEO_ID`
  - `m.youtube.com/watch?v=VIDEO_ID`
- Video ID extraction: Must succeed
- No content moderation (URL only)

**Preview:**
- Shows YouTube embed after valid URL
- Allows testing before posting

---

#### 5.4.3 Image Post Form

**Fields:**
1. **Image Upload:**
   - Type: File input (drag & drop)
   - Required: Yes
   - Accepted: PNG, JPG, JPEG, GIF
   - Max size: 2 MB
   - Preview: Shows after upload

2. **Caption (Optional):**
   - Type: Text input
   - Required: No
   - Max length: 200 characters
   - Placeholder: "Describe your image..."

3. **Make Public:**
   - Same as text post

**Validation:**
- File type: Must be in accepted list
- File size: Must be ≤ 2 MB
- Image moderation: OpenAI Vision API
- Blocked if: Flagged by AI

**Upload Process:**
1. User selects file
2. Client validates size/type
3. Preview displayed
4. On submit: Upload to Supabase Storage
5. Moderation check
6. Post created with image URL

---

#### 5.4.4 Location Post Form

**Fields:**
1. **Location Picker:**
   - Type: Interactive map
   - Required: Yes
   - Interface: Click to place pin
   - Alternative: Search for location
   - Data: Latitude, longitude

2. **Location Name (Optional):**
   - Type: Text input
   - Max length: 100 characters
   - Placeholder: "Eiffel Tower"

3. **Make Public:**
   - Same as text post

**Validation:**
- Coordinates: Must be valid lat/lng
- Range: -90 to 90 (lat), -180 to 180 (lng)
- No content moderation

**Display:**
- Embedded map with marker
- Shows exact coordinates
- Privacy note: Location visible to all

---

#### 5.4.5 Refuel Post Form

**Fields:**
- None (pre-defined message)

**Content:**
- Message: "I refueled this lighter!"
- Emoji: 🔥
- Public checkbox only

**Validation:**
- None (message is fixed)
- No moderation needed

**Submit:**
- One-click posting
- Instant confirmation

---

### 5.5 Payment Form

**Location:** Save Lighter flow
**Component:** `StripePaymentForm.tsx`
**Integration:** Stripe Elements

**Fields:**
1. **Card Number:**
   - Type: Stripe Card Number Element
   - Validation: Stripe handles
   - Formatting: Automatic spacing

2. **Expiry Date:**
   - Type: Stripe Expiry Element
   - Format: MM/YY
   - Validation: Must be future date

3. **CVC:**
   - Type: Stripe CVC Element
   - Length: 3-4 digits
   - Hidden input

4. **Postal Code:**
   - Type: Stripe Postal Code Element
   - Validation: Stripe handles
   - Required by some cards

**Validation:**
- All handled by Stripe
- Real-time validation feedback
- Card type detection (Visa, Mastercard, etc.)

**Submit Process:**
1. Create payment intent
2. Confirm payment with card details
3. Stripe processes transaction
4. Webhook confirms payment
5. Order processing begins
6. Redirect to success page

**Error Handling:**
- Insufficient funds: "Payment failed"
- Invalid card: "Card declined"
- Network error: "Please try again"
- All errors from Stripe API

---

## 6. API Endpoints

### 6.1 Authentication Endpoints

**Handled by Supabase Auth:**
- `/auth/v1/signup` - Create account
- `/auth/v1/login` - Login
- `/auth/v1/logout` - Logout
- `/auth/v1/token` - Refresh token
- `/auth/callback` - OAuth callbacks

---

### 6.2 Lighter Management

**6.2.1 Create New Lighter**
- **Method:** RPC function
- **Function:** `create_new_lighter`
- **Auth:** Required
- **Input:**
  ```typescript
  {
    lighter_name: string,
    background_color: string
  }
  ```
- **Process:**
  1. Generate unique PIN
  2. Create lighter in database
  3. Link to user
  4. Return lighter ID and PIN
- **Output:**
  ```typescript
  {
    lighter_id: UUID,
    pin_code: string
  }
  ```

**6.2.2 Bulk Create Lighters**
- **Method:** RPC function
- **Function:** `create_bulk_lighters`
- **Auth:** Required
- **Input:**
  ```typescript
  {
    p_user_id: UUID,
    p_lighter_data: Array<{
      name: string,
      backgroundColor: string,
      language: string
    }>
  }
  ```
- **Process:**
  1. Loop through lighter data
  2. Generate unique PIN for each
  3. Create all in single transaction
  4. Return array of created lighters
- **Output:**
  ```typescript
  [
    {
      lighter_id: UUID,
      lighter_name: string,
      pin_code: string,
      background_color: string
    },
    ...
  ]
  ```

**6.2.3 Get Lighter by PIN**
- **Method:** RPC function
- **Function:** `get_lighter_id_from_pin`
- **Auth:** Not required
- **Input:**
  ```typescript
  {
    pin_to_check: string
  }
  ```
- **Process:**
  1. Lookup PIN in database
  2. Return lighter ID if found
- **Output:**
  ```typescript
  UUID | null
  ```

---

### 6.3 Post Management

**6.3.1 Create New Post**
- **Method:** RPC function
- **Function:** `create_new_post`
- **Auth:** Required
- **Input:**
  ```typescript
  {
    p_lighter_id: UUID,
    p_post_type: 'text' | 'song' | 'image' | 'location' | 'refuel',
    p_content: string | null,
    p_image_url: string | null,
    p_youtube_url: string | null,
    p_location_lat: number | null,
    p_location_lng: number | null,
    p_location_name: string | null,
    p_is_public: boolean
  }
  ```
- **Process:**
  1. Check 24-hour cooldown
  2. Validate post data
  3. Run content moderation
  4. Create post in database
  5. Update lighter post count
- **Output:**
  ```typescript
  {
    post_id: UUID,
    status: 'pending' | 'approved'
  }
  ```
- **Errors:**
  - Cooldown active: "Must wait 24 hours"
  - Invalid data: "Invalid post data"
  - Moderation failed: "Content flagged for review"

**6.3.2 Toggle Like**
- **Method:** RPC function
- **Function:** `toggle_like`
- **Auth:** Required
- **Input:**
  ```typescript
  {
    p_post_id: UUID
  }
  ```
- **Process:**
  1. Check if user already liked
  2. If liked: Remove like
  3. If not: Add like
  4. Update like count
- **Output:**
  ```typescript
  {
    liked: boolean,
    like_count: number
  }
  ```

**6.3.3 Flag Post**
- **Method:** RPC function
- **Function:** `flag_post`
- **Auth:** Required
- **Input:**
  ```typescript
  {
    p_post_id: UUID,
    p_reason: string
  }
  ```
- **Process:**
  1. Create flag record
  2. Update post status to 'flagged'
  3. Notify moderators (future)
- **Output:**
  ```typescript
  { success: boolean }
  ```

---

### 6.4 Payment & Orders

**6.4.1 Create Payment Intent**
- **Endpoint:** `POST /api/create-payment-intent`
- **Auth:** Required
- **Input:**
  ```typescript
  {
    amount: number (cents),
    packSize: 10 | 20 | 50,
    shippingAddress: {
      name: string,
      email: string,
      address: string,
      city: string,
      postalCode: string,
      country: string
    }
  }
  ```
- **Process:**
  1. Validate pack size
  2. Verify amount matches pricing
  3. Create Stripe payment intent
  4. Store metadata
- **Output:**
  ```typescript
  {
    clientSecret: string,
    paymentIntentId: string
  }
  ```
- **Errors:**
  - Invalid pack size: 400
  - Amount mismatch: 400
  - Stripe error: 500

**6.4.2 Calculate Shipping**
- **Endpoint:** `POST /api/calculate-shipping`
- **Auth:** Required
- **Input:**
  ```typescript
  {
    countryCode: string,
    packSize: 10 | 20 | 50
  }
  ```
- **Process:**
  1. Determine number of sheets
  2. Call Printful Shipping API
  3. Get Standard & Express rates
  4. Return both options
- **Output:**
  ```typescript
  {
    rates: {
      standard: {
        rate: number (cents),
        days: string
      },
      express: {
        rate: number (cents),
        days: string
      }
    }
  }
  ```
- **Errors:**
  - Invalid country: 400
  - Printful API error: 500

**6.4.3 Process Sticker Order**
- **Endpoint:** `POST /api/process-sticker-order`
- **Auth:** Required
- **Input:**
  ```typescript
  {
    paymentIntentId: string,
    lighterData: Array<{
      name: string,
      backgroundColor: string,
      language: string
    }>,
    shippingAddress: {
      name: string,
      email: string,
      address: string,
      city: string,
      postalCode: string,
      country: string
    }
  }
  ```
- **Process:**
  1. Verify payment with Stripe
  2. Validate pack size (10, 20, 50)
  3. Verify payment amount >= base price
  4. Create lighters in database (bulk)
  5. Generate sticker PNG files
  6. Send fulfillment email with PNG attachment
  7. Send customer confirmation email
- **Output:**
  ```typescript
  {
    success: true,
    lighterIds: UUID[],
    message: string,
    warnings?: string[]
  }
  ```
- **Errors:**
  - Payment not successful: 400
  - Invalid pack size: 400
  - Amount too low: 400
  - Database error: 500
  - Sticker generation failed: 500

---

### 6.5 Content Moderation

**6.5.1 Moderate Text**
- **Endpoint:** `POST /api/moderate-text`
- **Auth:** Required
- **Input:**
  ```typescript
  {
    text: string
  }
  ```
- **Process:**
  1. Send to OpenAI Moderation API
  2. Analyze categories (hate, violence, etc.)
  3. Return flagged status
- **Output:**
  ```typescript
  {
    flagged: boolean,
    categories: {
      hate: boolean,
      harassment: boolean,
      self_harm: boolean,
      sexual: boolean,
      violence: boolean
    },
    scores: {
      hate: number,
      harassment: number,
      ...
    }
  }
  ```

**6.5.2 Moderate Image**
- **Endpoint:** `POST /api/moderate-image`
- **Auth:** Required
- **Input:**
  ```typescript
  {
    imageUrl: string
  }
  ```
- **Process:**
  1. Fetch image
  2. Convert to base64
  3. Send to OpenAI Vision API
  4. Analyze content
- **Output:**
  ```typescript
  {
    flagged: boolean,
    reason?: string
  }
  ```

---

### 6.6 Sticker Generation

**6.6.1 Generate Sticker PDF**
- **Endpoint:** `POST /api/generate-sticker-pdf`
- **Auth:** Required
- **Input:**
  ```typescript
  {
    stickers: Array<{
      id: string,
      name: string,
      pinCode: string,
      backgroundColor: string,
      language: string
    }>,
    orderId: string
  }
  ```
- **Process:**
  1. Create 7.5" × 5" canvas (300 DPI)
  2. Calculate sticker layout (grid)
  3. For each sticker:
     - Draw background color
     - Add name card
     - Generate unique QR code
     - Add invitation text
     - Add PIN code
     - Add logo
  4. Export as PNG
- **Output:**
  - Content-Type: image/png
  - PNG file (high resolution)
- **Errors:**
  - Invalid sticker data: 400
  - Generation failed: 500

**6.6.2 Generate Printful Stickers**
- **Endpoint:** `POST /api/generate-printful-stickers`
- **Auth:** Required
- **Input:** Same as generate-sticker-pdf
- **Output:** Same as generate-sticker-pdf
- **Difference:** Optimized for Printful printing specs

---

### 6.7 Utility Endpoints

**6.7.1 YouTube Search**
- **Endpoint:** `POST /api/youtube-search`
- **Auth:** Required
- **Input:**
  ```typescript
  {
    query: string
  }
  ```
- **Process:**
  1. Call YouTube Data API
  2. Search for videos
  3. Return top 5 results
- **Output:**
  ```typescript
  {
    results: Array<{
      videoId: string,
      title: string,
      thumbnail: string
    }>
  }
  ```

**6.7.2 Contact Form**
- **Endpoint:** `POST /api/contact`
- **Auth:** Not required
- **Input:**
  ```typescript
  {
    name: string,
    email: string,
    subject: string,
    message: string,
    context?: string
  }
  ```
- **Process:**
  1. Validate email format
  2. Send email via nodemailer
  3. To: editionsrevel@gmail.com
- **Output:**
  ```typescript
  {
    success: boolean,
    message: string
  }
  ```

---

### 6.8 Admin Endpoints

**6.8.1 Refund Order**
- **Endpoint:** `POST /api/admin/refund-order`
- **Auth:** Required (admin only)
- **Input:**
  ```typescript
  {
    paymentIntentId: string,
    reason?: string
  }
  ```
- **Process:**
  1. Verify admin role
  2. Retrieve payment intent from Stripe
  3. Create refund via Stripe API
  4. Update order status in database
  5. Send confirmation email
- **Output:**
  ```typescript
  {
    success: boolean,
    refundId: string,
    amount: number
  }
  ```
- **Errors:**
  - Not admin: 403
  - Payment not found: 404
  - Refund failed: 500

---

### 6.9 Webhooks

**6.9.1 Stripe Webhook**
- **Endpoint:** `POST /api/webhooks/stripe`
- **Auth:** Stripe signature verification
- **Events Handled:**
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
- **Process:**
  1. Verify webhook signature
  2. Parse event data
  3. Handle event:
     - Success: Mark order as paid
     - Failed: Notify customer
     - Refunded: Update order status
- **Output:**
  ```typescript
  { received: true }
  ```

---

## 7. Database Operations

### 7.1 Tables

**7.1.1 profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**7.1.2 lighters**
```sql
CREATE TABLE lighters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  pin_code TEXT UNIQUE NOT NULL,
  background_color TEXT,
  language TEXT DEFAULT 'en',
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lighters_pin ON lighters(pin_code);
CREATE INDEX idx_lighters_user ON lighters(user_id);
```

**7.1.3 posts**
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lighter_id UUID REFERENCES lighters(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  post_type TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  youtube_url TEXT,
  location_lat FLOAT,
  location_lng FLOAT,
  location_name TEXT,
  is_public BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'approved',
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_lighter ON posts(lighter_id);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_public ON posts(is_public) WHERE is_public = true;
CREATE INDEX idx_posts_moderation ON posts(moderation_status);
```

**7.1.4 post_likes**
```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
```

**7.1.5 post_flags**
```sql
CREATE TABLE post_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  flagger_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**7.1.6 post_cooldowns**
```sql
CREATE TABLE post_cooldowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lighter_id UUID REFERENCES lighters(id) ON DELETE CASCADE,
  last_post_at TIMESTAMPTZ NOT NULL,
  can_post_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, lighter_id)
);

CREATE INDEX idx_cooldowns_user_lighter ON post_cooldowns(user_id, lighter_id);
```

---

### 7.2 RPC Functions

**7.2.1 get_lighter_id_from_pin**
```sql
CREATE OR REPLACE FUNCTION get_lighter_id_from_pin(pin_to_check TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id
    FROM lighters
    WHERE pin_code = UPPER(pin_to_check)
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**7.2.2 create_new_lighter**
```sql
CREATE OR REPLACE FUNCTION create_new_lighter(
  lighter_name TEXT,
  background_color TEXT
)
RETURNS TABLE(lighter_id UUID, pin_code TEXT) AS $$
DECLARE
  new_pin TEXT;
  new_id UUID;
BEGIN
  -- Generate unique PIN
  LOOP
    new_pin := generate_pin();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM lighters WHERE pin_code = new_pin);
  END LOOP;

  -- Create lighter
  INSERT INTO lighters (user_id, name, pin_code, background_color)
  VALUES (auth.uid(), lighter_name, new_pin, background_color)
  RETURNING id INTO new_id;

  RETURN QUERY SELECT new_id, new_pin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**7.2.3 create_bulk_lighters**
```sql
CREATE OR REPLACE FUNCTION create_bulk_lighters(
  p_user_id UUID,
  p_lighter_data JSONB
)
RETURNS TABLE(
  lighter_id UUID,
  lighter_name TEXT,
  pin_code TEXT,
  background_color TEXT
) AS $$
DECLARE
  lighter_item JSONB;
  new_pin TEXT;
BEGIN
  FOR lighter_item IN SELECT * FROM jsonb_array_elements(p_lighter_data)
  LOOP
    -- Generate unique PIN
    LOOP
      new_pin := generate_pin();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM lighters WHERE pin_code = new_pin);
    END LOOP;

    -- Insert and return
    RETURN QUERY
    INSERT INTO lighters (user_id, name, pin_code, background_color, language)
    VALUES (
      p_user_id,
      lighter_item->>'name',
      new_pin,
      lighter_item->>'backgroundColor',
      lighter_item->>'language'
    )
    RETURNING id, name, pin_code, background_color;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**7.2.4 create_new_post**
```sql
CREATE OR REPLACE FUNCTION create_new_post(
  p_lighter_id UUID,
  p_post_type TEXT,
  p_content TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_youtube_url TEXT DEFAULT NULL,
  p_location_lat FLOAT DEFAULT NULL,
  p_location_lng FLOAT DEFAULT NULL,
  p_location_name TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  new_post_id UUID;
  can_post_time TIMESTAMPTZ;
BEGIN
  -- Check cooldown
  SELECT can_post_at INTO can_post_time
  FROM post_cooldowns
  WHERE user_id = auth.uid() AND lighter_id = p_lighter_id;

  IF can_post_time IS NOT NULL AND can_post_time > NOW() THEN
    RAISE EXCEPTION 'Must wait 24 hours between posts on this lighter';
  END IF;

  -- Create post
  INSERT INTO posts (
    lighter_id, author_id, post_type,
    content, image_url, youtube_url,
    location_lat, location_lng, location_name,
    is_public, moderation_status
  )
  VALUES (
    p_lighter_id, auth.uid(), p_post_type,
    p_content, p_image_url, p_youtube_url,
    p_location_lat, p_location_lng, p_location_name,
    p_is_public, 'approved'
  )
  RETURNING id INTO new_post_id;

  -- Update cooldown
  INSERT INTO post_cooldowns (user_id, lighter_id, last_post_at, can_post_at)
  VALUES (auth.uid(), p_lighter_id, NOW(), NOW() + INTERVAL '24 hours')
  ON CONFLICT (user_id, lighter_id)
  DO UPDATE SET
    last_post_at = NOW(),
    can_post_at = NOW() + INTERVAL '24 hours';

  -- Increment post count
  UPDATE lighters
  SET post_count = post_count + 1
  WHERE id = p_lighter_id;

  RETURN new_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**7.2.5 toggle_like**
```sql
CREATE OR REPLACE FUNCTION toggle_like(p_post_id UUID)
RETURNS TABLE(liked BOOLEAN, like_count INTEGER) AS $$
DECLARE
  existing_like UUID;
  current_count INTEGER;
BEGIN
  -- Check if already liked
  SELECT id INTO existing_like
  FROM post_likes
  WHERE post_id = p_post_id AND user_id = auth.uid();

  IF existing_like IS NOT NULL THEN
    -- Unlike
    DELETE FROM post_likes WHERE id = existing_like;
    UPDATE posts SET like_count = like_count - 1 WHERE id = p_post_id;
    liked := FALSE;
  ELSE
    -- Like
    INSERT INTO post_likes (post_id, user_id) VALUES (p_post_id, auth.uid());
    UPDATE posts SET like_count = like_count + 1 WHERE id = p_post_id;
    liked := TRUE;
  END IF;

  SELECT posts.like_count INTO current_count FROM posts WHERE id = p_post_id;

  RETURN QUERY SELECT liked, current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**7.2.6 get_random_public_posts**
```sql
CREATE OR REPLACE FUNCTION get_random_public_posts(limit_count INTEGER)
RETURNS TABLE(
  id UUID,
  post_type TEXT,
  content TEXT,
  image_url TEXT,
  youtube_url TEXT,
  location_lat FLOAT,
  location_lng FLOAT,
  location_name TEXT,
  like_count INTEGER,
  created_at TIMESTAMPTZ,
  author_username TEXT,
  lighter_name TEXT,
  lighter_pin TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.post_type,
    p.content,
    p.image_url,
    p.youtube_url,
    p.location_lat,
    p.location_lng,
    p.location_name,
    p.like_count,
    p.created_at,
    COALESCE(pr.username, 'Anonymous') as author_username,
    l.name as lighter_name,
    l.pin_code as lighter_pin
  FROM posts p
  LEFT JOIN profiles pr ON p.author_id = pr.id
  JOIN lighters l ON p.lighter_id = l.id
  WHERE p.is_public = TRUE
    AND p.moderation_status = 'approved'
  ORDER BY RANDOM()
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 7.3 Row Level Security (RLS)

**Enabled on all tables:**

**profiles:**
```sql
-- Users can view all profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

**lighters:**
```sql
-- Anyone can view lighters (if they have PIN)
CREATE POLICY "Lighters are viewable by everyone"
ON lighters FOR SELECT
USING (true);

-- Users can create own lighters
CREATE POLICY "Users can create lighters"
ON lighters FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own lighters
CREATE POLICY "Users can update own lighters"
ON lighters FOR UPDATE
USING (auth.uid() = user_id);
```

**posts:**
```sql
-- Public posts viewable by all
CREATE POLICY "Public posts are viewable by everyone"
ON posts FOR SELECT
USING (is_public = true OR auth.uid() IS NOT NULL);

-- Users can create posts
CREATE POLICY "Authenticated users can create posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Users can update own posts
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = author_id);

-- Moderators can update any post
CREATE POLICY "Moderators can update posts"
ON posts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
);
```

---

## 8. Integrations

### 8.1 Stripe (Payment Processing)

**Purpose:** Handle sticker order payments

**Setup:**
- API Version: 2025-10-29.clover
- Keys:
  - Publishable key (client-side)
  - Secret key (server-side)
- Webhook endpoint: `/api/webhooks/stripe`
- Webhook secret: For signature verification

**Payment Flow:**
1. Client creates payment intent
2. Stripe Elements collects card details
3. Client confirms payment
4. Stripe processes transaction
5. Webhook notifies server on success
6. Order processed

**Features Used:**
- Payment Intents API
- Stripe Elements (UI components)
- Webhooks (event notifications)
- Refunds API (admin function)

**Metadata Stored:**
```javascript
{
  user_id: string,
  pack_size: number,
  customer_email: string,
  lighter_count: number
}
```

---

### 8.2 Supabase (Backend & Database)

**Purpose:** Authentication, database, storage

**Services Used:**

**1. Auth:**
- Email/password authentication
- Magic link (passwordless)
- Session management
- JWT tokens
- Row Level Security

**2. Database (PostgreSQL):**
- Relational data storage
- RPC functions
- Triggers
- RLS policies
- Real-time subscriptions (future)

**3. Storage:**
- Bucket: `post-images`
- Image uploads from posts
- Public access URLs
- File size limits: 2 MB

**Configuration:**
- Project URL: NEXT_PUBLIC_SUPABASE_URL
- Anon key: NEXT_PUBLIC_SUPABASE_ANON_KEY
- Service role key: SUPABASE_SERVICE_ROLE_KEY (server only)

---

### 8.3 OpenAI (Content Moderation)

**Purpose:** Automated content moderation

**APIs Used:**

**1. Moderation API:**
- Endpoint: `https://api.openai.com/v1/moderations`
- Input: Text content
- Output: Category scores
- Use: Text post moderation
- Threshold: Flag if any score > 0.5

**2. Vision API (GPT-4 Vision):**
- Endpoint: Chat completions with image
- Input: Image URL or base64
- Output: Content analysis
- Use: Image post moderation

**Categories Checked:**
- Hate speech
- Harassment
- Self-harm
- Sexual content
- Violence
- Illegal activities

**Configuration:**
- API Key: OPENAI_API_KEY
- Model: gpt-4-vision-preview (images)
- Model: text-moderation-latest (text)

---

### 8.4 Printful (Sticker Fulfillment)

**Purpose:** Shipping rate calculation (future: automated fulfillment)

**Current Integration:**
- Shipping API: Calculate rates
- Input: Country code, weight
- Output: Standard & Express options

**Future Integration:**
- Automated order submission
- File upload (PNG stickers)
- Order tracking
- Webhook notifications

**Configuration:**
- API Key: PRINTFUL_API_KEY
- Endpoints:
  - `/shipping/rates` - Get shipping costs
  - (Future) `/orders` - Submit orders

---

### 8.5 YouTube Data API

**Purpose:** Search and embed videos for song posts

**Functionality:**
- Search videos by query
- Validate video URLs
- Extract video IDs
- Embed player

**Configuration:**
- API Key: YOUTUBE_API_KEY
- Quota: 10,000 units/day
- Endpoint: `youtube.googleapis.com/youtube/v3/search`

**URL Patterns Supported:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`

---

### 8.6 Nodemailer (Email)

**Purpose:** Send transactional emails

**Email Types:**

**1. Order Confirmation (Customer):**
- To: Customer email
- Subject: "Order Confirmed - {count} LightMyFire Stickers"
- Content: Order details, tracking info, lighter PINs

**2. Order Notification (Fulfillment):**
- To: editionsrevel@gmail.com
- Subject: "New Sticker Order - {count} stickers"
- Content: Customer details, shipping address
- Attachment: Sticker PNG file

**3. Contact Form:**
- To: editionsrevel@gmail.com
- Subject: "{context} - {subject}"
- Content: User message with contact info

**Configuration:**
- Service: Gmail SMTP
- User: EMAIL_USER
- Password: EMAIL_PASSWORD (app password)
- From: Same as EMAIL_USER

---

## 9. Internationalization

### 9.1 Supported Locales

**Complete List (27 languages):**

| Code | Language | Native Name | RTL |
|------|----------|-------------|-----|
| en | English | English | No |
| fr | French | Français | No |
| es | Spanish | Español | No |
| de | German | Deutsch | No |
| it | Italian | Italiano | No |
| pt | Portuguese | Português | No |
| nl | Dutch | Nederlands | No |
| ru | Russian | Русский | No |
| pl | Polish | Polski | No |
| ja | Japanese | 日本語 | No |
| ko | Korean | 한국어 | No |
| zh-CN | Chinese | 中文 | No |
| th | Thai | ไทย | No |
| vi | Vietnamese | Tiếng Việt | No |
| hi | Hindi | हिन्दी | No |
| ar | Arabic | العربية | Yes |
| fa | Persian | فارسی | Yes |
| ur | Urdu | اردو | Yes |
| mr | Marathi | मराठी | No |
| te | Telugu | తెలుగు | No |
| id | Indonesian | Bahasa Indonesia | No |
| uk | Ukrainian | Українська | No |
| tr | Turkish | Türkçe | No |

### 9.2 Translation Coverage

**Fully Translated:**
- All navigation elements
- All page titles and headers
- All form labels and placeholders
- All button text
- All error messages
- All validation messages
- Post type labels
- Pack descriptions
- Sticker invitation text (partial)

**Not Translated:**
- User-generated content
- Lighter names
- Admin dashboard
- Error logs
- Email templates (English only currently)

### 9.3 RTL Language Support

**RTL Languages:**
- Arabic (ar)
- Persian/Farsi (fa)
- Urdu (ur)

**Implementation:**
- Utility function: `isRTL(locale)`
- CSS direction: `dir="rtl"` or `dir="ltr"`
- Text alignment: Auto-adjusted
- Icon positioning: Flipped for RTL

---

## 10. Admin Features

### 10.1 Order Management

**View Orders:**
- List all orders (paginated)
- Filter by status
- Search by customer email or order ID
- Sort by date

**Order Details:**
- Payment intent ID
- Customer information
- Shipping address
- Pack size and lighter details
- Payment amount
- Order date and status

**Refund Order:**
- Button: "Refund Order"
- Confirmation modal
- Calls `/api/admin/refund-order`
- Processes refund via Stripe
- Sends confirmation email
- Updates order status

**Download Stickers:**
- Access to generated sticker files
- PNG format
- For reprints or verification

---

### 10.2 User Management

**View Users:**
- List all registered users
- Search by email or username
- Filter by role
- Sort by registration date

**User Details:**
- Profile information
- Lighters created
- Posts made
- Role and status

**Promote to Moderator:**
- Change user role from 'user' to 'moderator'
- Grants moderation dashboard access

**Ban User (Future):**
- Suspend user account
- Hide all posts
- Prevent login

---

### 10.3 Content Overview

**Recent Posts:**
- All posts (public and private)
- With moderation status
- Filter and search
- Quick approve/reject

**Most Active Lighters:**
- Lighters with most posts
- Sort by post count
- View details

**System Stats:**
- Total users
- Total lighters
- Total posts
- Public posts percentage
- Flagged content count

---

## 11. Edge Cases & Error Handling

### 11.1 Authentication Edge Cases

**Case: User tries to access protected page without login**
- Behavior: Redirect to `/login` with return URL
- After login: Return to original page

**Case: Session expires during activity**
- Behavior: API calls fail with 401
- UI: Show "Session expired, please login" message
- Action: Redirect to login

**Case: Email already registered**
- Behavior: Supabase returns error
- UI: Show "Email already in use"
- Action: Offer login or password reset

**Case: Invalid magic link**
- Behavior: Callback fails
- UI: Show error message
- Action: Offer to resend or use password

---

### 11.2 Lighter Creation Edge Cases

**Case: PIN collision (extremely rare)**
- Behavior: `create_new_lighter` retries
- Loop: Generate new PIN until unique
- Max attempts: 100 (virtually impossible to hit)

**Case: User creates 1000+ lighters**
- Behavior: No limit enforced
- Database: Supports unlimited lighters per user
- UI: Pagination on profile page

**Case: Invalid color format**
- Validation: Frontend ensures valid hex color
- Fallback: Default to blue if invalid

**Case: Name with special characters**
- Behavior: Allowed (UTF-8 support)
- Examples: Emojis, non-Latin scripts
- Max length: 100 characters

---

### 11.3 Post Creation Edge Cases

**Case: Cooldown active**
- Check: Before showing "Add Post" button
- UI: Show countdown timer
- Message: "You can post again in X hours"
- Bypass: None (enforced by database)

**Case: Image upload fails**
- Retry: Allow user to retry upload
- Error message: "Upload failed, please try again"
- Fallback: Suggest reducing file size

**Case: Moderation flags content**
- Status: Set to "pending"
- UI: "Post under review" message
- Notification: Moderator queue updated
- Timeline: Awaits human review

**Case: YouTube video deleted/private**
- Display: Broken embed with error message
- Message: "Video unavailable"
- Post: Still exists with URL

**Case: Location outside valid range**
- Validation: Lat -90 to 90, Lng -180 to 180
- Error: "Invalid coordinates"
- Map: Prevents clicking outside bounds

**Case: User deletes account with posts**
- Posts: Author set to NULL
- Display: "Anonymous" as author
- Likes/flags: Preserved
- Lighter: Remains active

---

### 11.4 Order Edge Cases

**Case: Payment succeeds but order processing fails**
- Logged: Error in system
- Webhook: Retries on failure
- Manual: Admin can process manually
- Refund: Available if unrecoverable

**Case: Shipping address invalid**
- Validation: Required fields
- Shipping calc: May fail for unsupported countries
- Error: "Shipping not available to this country"
- Resolution: Contact support

**Case: Sticker generation fails**
- Error: Logged in system
- Order: Marked as needs attention
- Email: Sent without attachment
- Resolution: Admin regenerates manually

**Case: User requests refund after shipping**
- Policy: No refunds after shipping
- Exception: Case-by-case admin decision
- Process: Admin can force refund via Stripe

**Case: Duplicate order (double-click)**
- Prevention: Disable button after click
- Stripe: Idempotency keys prevent duplicates
- Detection: Check for duplicate payment intents

---

### 11.5 QR Code Edge Cases

**Case: QR code doesn't scan**
- Alternative: Manual PIN entry
- Support: Instructions on sticker
- Reason: Damaged sticker, poor lighting

**Case: QR code points to wrong PIN**
- Prevention: Each QR is unique per lighter
- Validation: PIN embedded in QR URL
- Issue: Should never occur with current system

**Case: User shares QR code URL**
- Behavior: Anyone can access with PIN
- Security: PIN acts as password
- Privacy: User controls via public/private posts

**Case: Pin format mismatch (old stickers)**
- Legacy: Generic QR to `/find`
- Current: Specific QR to `/find?pin=XXX-XXX`
- Support: Both work seamlessly

---

### 11.6 Moderation Edge Cases

**Case: Moderator approves then user deletes**
- Behavior: Post hidden anyway
- Status: Marked as deleted
- Moderation: Decision preserved in logs

**Case: Multiple flags on same post**
- Aggregation: Single queue entry
- Count: Shows number of flags
- Priority: Higher flags = higher priority

**Case: AI flags false positive**
- Review: Human moderator overrides
- Learning: No feedback loop to AI (static)
- Frequency: Monitored by admin

**Case: Moderator account compromised**
- Risk: Can approve/reject posts
- Mitigation: Admin can revoke moderator role
- Audit: All actions logged

---

## 12. Testing Paths

### 12.1 Critical User Journeys

**Journey 1: New User Signup → Create Lighter → Add Post**

Path:
1. Visit homepage
2. Click "Become a LightSaver"
3. Navigate to `/login`
4. Sign up with email/password
5. Verify email (if required)
6. See welcome modal
7. Click "Create Your First Lighter"
8. Enter lighter name "Test Lighter"
9. Select blue color
10. Click "Create"
11. Redirected to success page
12. See PIN and download option
13. Click "View Lighter"
14. Click "Add Your Story"
15. Select "Text Post"
16. Enter message "Testing!"
17. Check "Make Public"
18. Click "Post"
19. See post on lighter page
20. Verify cooldown timer appears

**Expected Results:**
- User account created
- Lighter in database with unique PIN
- Post visible on lighter page
- Post appears on homepage mosaic (public)
- 24-hour cooldown active
- No errors at any step

---

**Journey 2: Find Lighter via QR → Login → Add Post**

Path:
1. Scan physical QR code with phone
2. Opens `/find?pin=ABC-123`
3. PIN pre-filled in input
4. Click "Find Lighter"
5. Navigate to `/lighter/{id}`
6. View existing posts
7. Click "Add Your Story"
8. Prompted to login
9. Complete login
10. Redirected back to lighter page
11. Click "Add Your Story" again
12. No cooldown (first post on this lighter)
13. Select "Image Post"
14. Upload image
15. Add caption
16. Make public
17. Click "Post"
18. Image moderates successfully
19. Post appears
20. Cooldown starts

**Expected Results:**
- QR code opens correct lighter
- PIN recognized
- Login flow preserves intent
- Image uploads to Supabase Storage
- Moderation check passes
- Post visible immediately
- Cooldown prevents double-posting

---

**Journey 3: Order Stickers → Payment → Receive**

Path:
1. Login as user
2. Navigate to `/save-lighter`
3. Select "20 stickers" pack
4. Personalize lighter 1-10:
   - Names: "Lighter 1" through "Lighter 10"
   - All same color (blue)
   - All same language (English)
   - Check "Apply to all"
5. Personalize lighter 11-20:
   - Different names
   - Different colors
   - Same language
6. Click "Save Customizations"
7. Enter shipping address:
   - Name: John Doe
   - Email: test@example.com
   - Address: 123 Main St
   - City: Paris
   - Postal: 75001
   - Country: France
8. Click "Calculate Shipping"
9. Rates appear: Standard (€5.20), Express (€8.40)
10. Select Standard
11. Preview stickers (see first 5)
12. Enter card details (Stripe test card)
13. Click "Pay Now"
14. Payment processes
15. Redirected to order success page
16. Check email for confirmations
17. Admin receives order email with PNG
18. Check profile - see 20 new lighters with PINs
19. Each PIN is unique
20. Download sticker files from admin panel

**Expected Results:**
- 20 lighters created in database
- All have unique PINs
- Sticker PNG file generated (7.5" × 5", 2 sheets)
- Each QR code contains unique URL
- Payment €14.40 + €5.20 = €19.60 processed
- Customer email received
- Fulfillment email received with attachment
- Order recorded in admin dashboard

---

**Journey 4: User Flags Post → Moderator Reviews**

Path:
1. User A creates inappropriate post
2. AI moderation misses it (edge case)
3. Post goes live
4. User B views lighter page
5. Sees inappropriate post
6. Clicks flag icon
7. Confirms flag
8. Post marked as "flagged"
9. Moderator logs in
10. Navigate to `/moderation`
11. Sees flagged post in queue
12. Reviews content
13. Views author's other posts
14. Decides to reject
15. Clicks "Reject"
16. Post hidden from public view
17. Status updated to "rejected"
18. User A sees "Post removed" (future)

**Expected Results:**
- Flag recorded in database
- Post status changes to "flagged"
- Appears in moderation queue
- Moderator can view context
- Rejection hides post
- Decision is permanent

---

### 12.2 Error State Testing

**Test: Invalid PIN Entry**

Steps:
1. Visit homepage
2. Enter PIN: "ZZZ-999"
3. Click "Find Lighter"

Expected:
- Error message: "Invalid PIN. Please try again."
- Input field remains filled
- Can retry with correct PIN

---

**Test: Payment Card Declined**

Steps:
1. Complete order flow through payment
2. Enter test card: 4000 0000 0000 0002 (decline)
3. Click "Pay Now"

Expected:
- Stripe returns decline error
- Error message: "Your card was declined"
- Payment not processed
- Order not created
- User can retry with different card

---

**Test: Upload Oversized Image**

Steps:
1. Navigate to add post (image)
2. Select image > 2 MB
3. Attempt upload

Expected:
- Client-side validation error
- Message: "File too large. Max 2 MB"
- Upload blocked
- User prompted to resize

---

**Test: Post During Cooldown**

Steps:
1. Add post to lighter
2. Immediately try to add another

Expected:
- "Add Your Story" button disabled
- Tooltip: "You can post again in 23 hours 59 minutes"
- Countdown timer visible
- Cannot bypass restriction

---

**Test: Session Expiration**

Steps:
1. Login as user
2. Wait for session to expire (or force expire)
3. Attempt to create lighter

Expected:
- API call returns 401
- Modal: "Session expired. Please login again."
- Redirects to `/login`
- After login, returns to intended action

---

### 12.3 Edge Case Testing

**Test: Create 100 Lighters**

Steps:
1. Login as user
2. Script: Create 100 lighters via API

Expected:
- All 100 created successfully
- All have unique PINs
- Profile page paginates properly
- No performance degradation
- Database constraints enforced

---

**Test: Concurrent Orders**

Steps:
1. User A starts order (10 pack)
2. User B starts order (50 pack) simultaneously
3. Both proceed to payment
4. Both pay within seconds

Expected:
- Both orders process successfully
- No PIN collisions
- All lighters have unique PINs
- Both receive confirmations
- Admin receives 2 separate emails

---

**Test: Unicode Content**

Steps:
1. Create lighter with name: "我的打火机🔥"
2. Add text post with content: "مرحبا! 你好! नमस्ते!"

Expected:
- Lighter name stored correctly
- Displays properly in UI
- Post content preserved
- Sticker renders UTF-8 correctly
- No encoding errors

---

**Test: Deleted Author**

Steps:
1. User A creates post on lighter
2. User A deletes account
3. View lighter page

Expected:
- Post remains visible
- Author shows as "Anonymous"
- Post content preserved
- Likes/flags intact
- No errors

---

**Test: YouTube Video Removed**

Steps:
1. Create song post with valid YouTube URL
2. Post appears with embed
3. Video owner deletes video
4. View post again

Expected:
- Post still exists
- Embed shows "Video unavailable"
- URL stored in database
- No crash or error
- Other posts unaffected

---

### 12.4 Accessibility Testing

**Test: Keyboard Navigation**

Steps:
1. Use only Tab key to navigate
2. Visit all pages
3. Complete all forms

Expected:
- All interactive elements focusable
- Focus indicators visible
- Logical tab order
- Forms submittable with Enter
- Modals closable with Escape

---

**Test: Screen Reader**

Steps:
1. Enable screen reader (NVDA, JAWS, VoiceOver)
2. Navigate homepage
3. Complete PIN entry
4. View lighter page
5. Attempt to add post

Expected:
- All text readable
- Form labels announced
- Buttons have accessible names
- Images have alt text
- Landmarks identified

---

**Test: High Contrast Mode**

Steps:
1. Enable high contrast mode
2. Visit all pages
3. Check readability

Expected:
- Text readable in high contrast
- Buttons visible
- Focus indicators strong
- No white text on white background
- Borders visible

---

### 12.5 Performance Testing

**Test: Large Lighter (1000+ Posts)**

Steps:
1. Create lighter
2. Script: Add 1000 posts
3. View lighter page

Expected:
- Page loads in < 3 seconds
- Pagination/infinite scroll works
- No browser freeze
- Smooth scrolling
- Like buttons responsive

---

**Test: Homepage with 100+ Posts**

Steps:
1. Database: 100 public posts exist
2. Visit homepage
3. Refresh random posts multiple times

Expected:
- Initial load < 2 seconds
- Refresh smooth with animation
- No duplicate posts
- Load more works efficiently
- No memory leaks

---

**Test: Mobile Data (3G)**

Steps:
1. Throttle to 3G speeds
2. Complete order flow
3. Upload image post

Expected:
- Pages load within reasonable time
- Loading indicators shown
- No timeouts
- Image upload completes
- Progress feedback provided

---

## 13. Appendix

### 13.1 Environment Variables

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password
NEXT_PUBLIC_BASE_URL=https://lightmyfire.app
```

**Optional:**
```
YOUTUBE_API_KEY=AIza...
PRINTFUL_API_KEY=...
FULFILLMENT_EMAIL=editionsrevel@gmail.com
```

### 13.2 Common Test Data

**Test Stripe Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
Expired: 4000 0000 0000 0069
```

**Test Lighters:**
```
PIN: ABC-123 (create in test DB)
PIN: XYZ-789 (create in test DB)
```

**Test Users:**
```
Email: test@lightmyfire.app
Password: testpassword123
```

### 13.3 File Structure

```
lightmyfire-web/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx (Homepage)
│   │   ├── find/page.tsx
│   │   ├── about/page.tsx
│   │   ├── login/page.tsx
│   │   ├── my-profile/page.tsx
│   │   ├── save-lighter/page.tsx
│   │   ├── lighter/[id]/
│   │   │   ├── page.tsx
│   │   │   └── add/page.tsx
│   │   ├── moderation/page.tsx
│   │   ├── admin/page.tsx
│   │   └── legal/
│   └── api/
│       ├── create-payment-intent/route.ts
│       ├── process-sticker-order/route.ts
│       ├── calculate-shipping/route.ts
│       ├── moderate-text/route.ts
│       ├── moderate-image/route.ts
│       ├── generate-sticker-pdf/route.ts
│       ├── generate-printful-stickers/route.ts
│       ├── youtube-search/route.ts
│       ├── contact/route.ts
│       ├── admin/refund-order/route.ts
│       └── webhooks/stripe/route.ts
├── components/
│   ├── PinEntryForm.tsx
│   ├── RandomPostFeed.tsx
│   ├── PostCard.tsx
│   ├── Skeleton.tsx
│   ├── LoadingSpinner.tsx
│   └── ...
├── lib/
│   ├── constants.ts
│   ├── utils.ts
│   ├── supabase.ts
│   └── types.ts
├── locales/
│   ├── en.ts
│   ├── fr.ts
│   ├── es.ts
│   └── ... (27 total)
└── public/
    ├── illustrations/
    └── LOGOLONG.png
```

---

## End of Document

**Document Status:** Complete
**Coverage:** 100% of features documented
**Testing Readiness:** Ready for comprehensive QA
**Maintenance:** Update as features added

This specification covers every feature, page, flow, API, database operation, integration, and edge case in the LightMyFire web application. Use it as a complete testing checklist to verify all functionality.
