# Comprehensive Feature Requests & Bug Fixes
**SAVED BEFORE AUTO-COMPACT - DO NOT LOSE**
**Last Updated: 2024-11-01**

## 🔴 CRITICAL BUGS (Fix Immediately)

### 1. Burger Menu Not Appearing on Mobile
- **Issue**: Mobile burger menu doesn't appear when button is touched
- **Priority**: CRITICAL - Core functionality broken
- **Location**: Header component
- **Status**: NOT STARTED

### 2. Image Upload Foreign Key Error
- **Issue**: "Error: insert or update on table 'posts' violates foreign key constraint 'posts_user_id_fkey'"
- **Priority**: CRITICAL - Users can't upload images
- **Location**: AddPostForm + Backend
- **Root Cause**: Likely user_id not being passed correctly to RPC function
- **Status**: NOT STARTED

### 3. Nav Banner Shift on Login/Logout
- **Issue**: When logging in/out, nav links shift right, making last ones unreadable until refresh
- **Priority**: HIGH - UX breaking
- **Location**: Header/Navigation
- **Status**: NOT STARTED

### 4. White Background Above Tiled Background (Add to Story Page)
- **Issue**: White background showing above tiled background on Add to Story page
- **Priority**: HIGH - Visual issue
- **Location**: app/[locale]/lighter/[id]/add/ (layout)
- **Status**: NOT STARTED

---

## 📱 Homepage Index Page Improvements

### PIN Input Field Hyphen
- **Current**: Hyphen inserted before 4th character is typed (users confused)
- **Fix**: Insert after 3rd character is typed (users understand it's automatic)
- **File**: `app/components/PinEntryForm.tsx`
- **Function**: `handlePinChange`
- **Status**: NOT STARTED

### Rainbow CTA Arrow Position
- **Current**: Arrow on left of button (points wrong direction)
- **Fix**: Move arrow to right of button
- **File**: Need to find arrow illustration/SVG location
- **Status**: NOT STARTED

### Hero Section Background
- **Issue**: "Too young to die..." paragraph and "?" button have no background
- **Fix**: Add subtle background to both for visibility improvement
- **File**: `app/[locale]/page.tsx` (Hero section)
- **Status**: NOT STARTED

### Hero Section Mobile Layout
- **Changes**:
  - Reduce thumbs up illustration by 20%
  - Put "Too young..." title on RIGHT of illustration
  - Put paragraph under BOTH (illustration and title)
  - Reduce margin between hero and "Found a Lighter" CTA by 50%
- **File**: `app/[locale]/page.tsx`
- **Status**: NOT STARTED

### CTA Found a Lighter
- **Change**: Increase "around_the_world" illustration size by 50%
- **File**: `app/[locale]/page.tsx`
- **Status**: NOT STARTED

### Become a Lightsaver Section
- **Changes**:
  - Reduce margin by 50% (desktop & mobile)
  - Add explanatory text above button (engaging, couple lines about joining adventure, creativity, waste reduction)
  - Make button darker than "Find Lighter" button to differentiate
  - Add heart ❤️ icon to button
  - Convert to card with 95% opacity background
  - Text above: bold, small font
- **File**: `app/[locale]/page.tsx`
- **Status**: NOT STARTED

### Background Movement
- **Change**: Double the speed of infinite tiled background movement
- **File**: `app/globals.css` (@keyframes scrollBackground)
- **Current**: 120s
- **New**: 60s
- **Status**: NOT STARTED

### Stories from the Mosaic Section
- **Add**: Subtitle with i18n
- **Text**: "These random posts were added by nice people like you, who chose to give a lighter one more story to tell. Posts appear here only if you choose so."
- **File**: Need to find RandomPostFeed component
- **i18n Keys Needed**:
  - `home.mosaic.subtitle`: English above
  - `home.mosaic.subtitle_fr`: French version
- **Status**: NOT STARTED

### Random Post Cards
- **Issues & Fixes**:
  1. Cards too big - reduce size
  2. Background should be 95% opacity (not 100%)
  3. Cards overflow container, alter page scroll - fix
  4. Fade transitions: change from 4s to 1000ms (1s)
  5. Stagger appearance: second card appears 1000ms AFTER first (not simultaneous)
  6. Add margin between user paragraph/input and like button (currently touching)
  7. Increase like button size
  8. Make cards stay 3000ms LONGER on screen
  9. Add 20px gap between cards
  10. When card above is bigger than previous, smooth animation as current card moves down
  11. Flexible spacing to prevent gaps on mobile
- **Files**: `app/components/RandomPostFeed.tsx`, `app/components/PostCard.tsx`
- **Status**: NOT STARTED

---

## 🔐 Authentication & User Experience

### Login/Registration/Logout Notifications
- **Issue**: No success notification when creating account, logging in, or logging out
- **Fix**: Implement toast notifications (use existing Toast system) for:
  - Account created successfully
  - Logged in successfully
  - Logged out successfully
- **Files**: Login page, logout button component
- **Status**: NOT STARTED

### My Profile Button
- **Change**: When user is logged in, show their USERNAME instead of "My Profile"
- **File**: `app/components/Header.tsx`
- **Status**: NOT STARTED

---

## 👤 My Profile Page

### Edit Profile Illustration
- **Change**: Triple the size of illustration in Edit Profile section
- **File**: `app/[locale]/my-profile/page.tsx`
- **Status**: NOT STARTED

### Card Order
- **Current Order**: Edit Profile - Update Email/Pwd - Combo Saved Lighters + Contributions - My Posts
- **New Order**: Combo Saved Lighters + Contributions (social aspect first) - Edit Profile - Update Email/Pwd - My Posts
- **File**: `app/[locale]/my-profile/page.tsx`
- **Status**: NOT STARTED

### Google Login Edit Profile
- **Issue**: Edit Profile shows no options when logged in with Google (no email/pwd fields, but should allow nickname)
- **Fix**: Ensure users logged in via Google can still edit:
  - Username/Nickname
  - Nationality
  - Show nationality checkbox
- **Files**: `app/[locale]/my-profile/EditProfileForm.tsx`, `app/[locale]/my-profile/UpdateAuthForm.tsx`
- **Status**: NOT STARTED

### Nationality Settings
- **Add to Edit Profile**:
  - Function to set nationality (country selector)
  - Tickbox to display nationality on posts
  - If enabled: flag emoji appears on right of username in postcards
  - On hover (desktop) / touch (mobile): show country name tooltip
- **Files**: `app/[locale]/my-profile/EditProfileForm.tsx`, `app/components/PostCard.tsx`
- **i18n Keys Needed**:
  - `profile.nationality_label`: "Nationality"
  - `profile.show_nationality_label`: "Show nationality on posts"
- **Status**: NOT STARTED

---

## 📝 Add Post / Create Story Page

### Post Category Buttons
- **Changes**:
  - Add icons to each post type (Text, Song, Image, Location, Refuel)
  - Make buttons more attractive/higher
  - Add subtitle explaining each category:
    - Text: "Tell us about your day, share your last poem, or complain about your neighbour"
    - Song: "Share your favorite music moment"
    - Image: "Show what you see"
    - Location: "Mark where this lighter traveled"
    - Refuel: "Keep this lighter's journey alive"
  - Add slider animation: when button is selected, a smooth accent/underline slides to the new selection
- **Files**: `app/[locale]/lighter/[id]/add/AddPostForm.tsx`
- **Status**: NOT STARTED

### Song Post Type Button Order
- **Change**: Place SEARCH first, then URL (opposite of current)
- **File**: `app/[locale]/lighter/[id]/add/AddPostForm.tsx`
- **Status**: NOT STARTED

### Page Stability
- **Issue**: Screen moves too much when changing post category
- **Fix**: Make top of card stable, only expand downward
- **File**: `app/[locale]/lighter/[id]/add/AddPostForm.tsx`
- **Status**: NOT STARTED

### Page Visual Improvements
- **Changes**:
  - Add color to the page (currently bland)
  - Add illustration next to "Add to the Story" title and subtitle
  - Only show tiled background (remove white background above it)
  - Ensure layout is stable when switching categories
- **File**: `app/[locale]/lighter/[id]/add/page.tsx`, `app/[locale]/lighter/[id]/add/AddPostForm.tsx`
- **Status**: NOT STARTED

---

## 🎨 Navigation & UI

### Logo Hover Effect
- **Add**: Primary color smooth halo around logo on hover
- **Animation**: 300ms fade in/out
- **File**: `app/components/Header.tsx`
- **Status**: NOT STARTED

### Navigation Button Order
- **Current**: How it Works - Refill Guide - Our Philosophy - (Save Lighter) - My Profile
- **New Order**: How it Works - Save a Lighter - Our Philosophy - Refill Guide - My Profile
- **File**: `app/components/Header.tsx`
- **Status**: NOT STARTED

---

## 🚚 Save a Lighter Page (Major Overhaul)

### Content & Structure
- **Section 1: Why It Matters** (Illustrations + Engaging Text)
  - Explain importance: fun, human mosaic, anti-waste
  - Hand-made, sustainably manufactured stickers
  - Helps maintain website alive
  - Add inspiring visuals/illustrations
  - Add placeholder pictures for articles (future content)

- **Section 2: The Process/Basket**
  - Explain trophies system
  - Explain community aspect
  - Show what happens when you save a lighter

- **Section 3: Order Summary** (NEW)
  - Display order details before payment
  - Will be variables from Stripe integration

- **Section 4: Delivery/Order Details**
  - User shipping info
  - Order customization

- **Section 5: Payment Details**
  - Card information (moved from current position)
  - Optimized for Stripe

### Design Improvements
- Improve page drastically (currently feels incomplete)
- 'Basket' theme/aesthetic
- Better visual hierarchy
- Ready for Stripe integration
- Consider showing what users are supporting (environmental impact)

### Stripe Integration Preparation
- Optimize layout for Stripe elements
- Plan for payment confirmation
- Ensure order summary is clear
- Test with Stripe API when ready

**File**: `app/[locale]/save-lighter/page.tsx`, `app/[locale]/save-lighter/SaveLighterForm.tsx`
**Status**: NOT STARTED

---

## 💡 Lighter Page (Story Page)

### Header Layout Improvements
- **Current**: Centered "Name" and "PIN"
- **New Layout**:
  - Left: Lighter illustration (small/medium)
  - Center: Name (larger, bold) + PIN below
  - Right: Number of contributions (VERY BIG and BOLD) + "Posts" underneath (same width for aesthetics)
- **Mobile**: Adapt layout for smaller screens (stack vertically or adjust spacing)
- **File**: `app/[locale]/lighter/[id]/page.tsx`
- **Status**: NOT STARTED

---

## 🍪 Footer & Legal

### Cookie Banner Text
- **Change**: Update to explain:
  - Cookies are NOT used for tracking
  - Only for basic functions
  - NOT saved/used by us at any point
  - Focus on privacy
- **File**: `app/components/CookieConsent.tsx`
- **Status**: NOT STARTED

### Footer Spacing
- **Issue**: Space down needs increase; when cookie banner not closed, moderation sentence doesn't appear
- **Fix**: Increase space below footer text
- **File**: `app/components/Footer.tsx`
- **Status**: NOT STARTED

---

## 📊 Summary by Component

| Component | Issues | Priority |
|-----------|--------|----------|
| Header | Burger menu broken, nav shift on login, logo hover, button order | CRITICAL/HIGH |
| Homepage | Hyphen timing, arrow position, hero bg, hero mobile, background speed, stories subtitle, random cards | HIGH |
| My Profile | Card order, Edit Profile size, Google login edit, nationality settings | MEDIUM/HIGH |
| Add Post | Category buttons, button order, page stability, visual improvements | MEDIUM |
| Save Lighter | Complete overhaul, Stripe prep | HIGH |
| Lighter Page | Header layout improvements | MEDIUM |
| Footer | Cookie text, spacing | LOW |

---

## 🔄 Implementation Order Suggested

1. **CRITICAL BUGS FIRST**:
   - Fix burger menu on mobile
   - Fix image upload foreign key error
   - Fix nav banner shift
   - Fix white background on Add to Story page

2. **HIGH PRIORITY**:
   - Success notifications (login/logout/register)
   - Homepage improvements (hyphen, arrow, hero, background, stories, random cards)
   - Save a Lighter page overhaul

3. **MEDIUM PRIORITY**:
   - My Profile improvements
   - Lighter page header
   - Add Post page improvements
   - Logo hover effect
   - Navigation button order

4. **LOW PRIORITY**:
   - Cookie banner text
   - Footer spacing

---

## ✅ Checklist for Validation

- [ ] Burger menu appears on mobile touch
- [ ] Image upload works without foreign key error
- [ ] Nav links stay in place on login/logout
- [ ] White background removed from Add to Story
- [ ] PIN hyphen inserts after 3rd character
- [ ] Rainbow arrow on right of button
- [ ] Random post cards don't overflow
- [ ] Fade animations 1000ms, staggered
- [ ] Login/logout notifications show
- [ ] Profile shows username when logged in
- [ ] Nationality selector works with flag emoji
- [ ] Category buttons have icons and slider
- [ ] Song search button is first
- [ ] Save a Lighter page improved significantly
- [ ] Lighter page header shows contribution count
- [ ] All i18n keys added for new content
- [ ] Mobile layouts adapted for all changes

---

**DO NOT PROCEED WITH IMPLEMENTATION UNTIL ALL REQUIREMENTS ARE SAVED**
