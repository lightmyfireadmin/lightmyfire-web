# Implementation Guide - All Changes
**REFERENCE DOCUMENT FOR FEATURE REQUESTS**
**Last Updated: 2024-11-01**

## File Locations Reference

### Critical Bug Fixes
```
1. Burger Menu
   - File: app/components/Header.tsx
   - Function: Header component, mobile menu state
   - Issue: Dialog or state management not working on mobile

2. Image Upload Foreign Key
   - Files:
     - app/[locale]/lighter/[id]/add/AddPostForm.tsx (frontend)
     - Supabase RPC function (backend)
   - Function: handleSubmit -> supabase.rpc('create_new_post')
   - Issue: user_id not being passed to RPC or database issue

3. Nav Banner Shift
   - File: app/components/Header.tsx
   - Cause: Conditional rendering changing layout
   - Fix: Use CSS to hide/show elements instead of removing them

4. White Background Add to Story
   - Files:
     - app/[locale]/lighter/[id]/add/page.tsx
     - app/[locale]/lighter/[id]/add/AddPostForm.tsx
   - Issue: Body or layout has white bg behind tiled bg
   - Fix: Ensure only tiled background is visible
```

### Homepage (Index Page)
```
1. PIN Input Hyphen (app/components/PinEntryForm.tsx)
   - Function: handlePinChange
   - Current Logic: if (input.length > 3) add hyphen after position 3
   - Issue: User types 4th char, THEN hyphen added
   - Fix: Logic looks correct, might be in display vs actual value

2. Rainbow Arrow (app/[locale]/page.tsx)
   - Location: Hero CTA section
   - Find: CTA_rainbow_arrow.png
   - Current: Left of button
   - Move: To right of button

3. Hero Section Background
   - File: app/[locale]/page.tsx
   - Elements: "Too young to die" paragraph + "?" button
   - Add: Subtle background (perhaps bg-muted/50 or bg-primary/5)

4. Hero Mobile Layout
   - File: app/[locale]/page.tsx
   - Hero Section:
     - Reduce thumbs up illustration by 20%
     - Reposition: title on right, paragraph below both
   - Space: Reduce margin between hero and Found Lighter CTA by 50%

5. CTA Found a Lighter Illustration
   - File: app/[locale]/page.tsx
   - Image: around_the_world.png
   - Change: width * 1.5, height * 1.5

6. Background Movement Speed
   - File: app/globals.css
   - Keyframe: @keyframes scrollBackground
   - Current: 120s linear infinite
   - Change: 60s linear infinite

7. Become Lightsaver Section
   - File: app/[locale]/page.tsx
   - Changes:
     - Add explanatory text (2-3 lines, bold, small font)
     - Make section a card with 95% opacity bg
     - Add heart icon to button
     - Make button darker than Find Lighter
     - Reduce section margin by 50%

8. Stories from Mosaic Subtitle
   - File: app/components/RandomPostFeed.tsx (likely)
   - Add: New subtitle section
   - i18n Keys: 'home.mosaic.subtitle'

9. Random Post Cards
   - File: app/components/RandomPostFeed.tsx
   - Changes:
     - Card size: reduce width/height
     - Opacity: 95% (currently 95% already set, check if working)
     - Duration: Change fade from 4s to 1s (1000ms)
     - Stagger: 2nd card appear 1000ms after 1st
     - Stay longer: Add 3000ms to current duration
     - Gap: 20px between cards
     - Margin: Add space between user/input and like button
     - Like button: Increase size
     - Flexibility: Handle different card heights with smooth animation
     - Don't overflow: Ensure cards fit in container
```

### Authentication & User
```
1. Login/Logout Notifications
   - Files:
     - app/[locale]/login/page.tsx
     - app/components/LogoutButton.tsx
   - Implementation: Use useToast() hook
   - Messages:
     - 'auth.signup_success': 'Account created successfully!'
     - 'auth.login_success': 'Welcome back!'
     - 'auth.logout_success': 'See you next time!'

2. My Profile Button (When Logged In)
   - File: app/components/Header.tsx
   - Current: Shows "My Profile" text always
   - Change: Fetch username and show instead
   - Position: In desktop nav where "My Profile" link is
```

### My Profile Page
```
1. Edit Profile Illustration
   - File: app/[locale]/my-profile/page.tsx
   - Element: Personalise illustration in Edit Profile section
   - Change: width * 3, height * 3 (or max-width in Tailwind)

2. Card Reordering
   - File: app/[locale]/my-profile/page.tsx
   - Current Structure:
     ```
     1. Profile Header (username, level, points, moderator badge)
     2. Stats Grid
     3. Trophies
     4. Edit Profile
     5. Update Auth
     6. Grid:
        - Saved Lighters
        - My Posts (col-span-2)
     ```
   - New Structure:
     ```
     1. Profile Header
     2. Stats Grid + Saved Lighters
     3. Edit Profile (with larger illustration)
     4. Update Auth
     5. My Posts
     ```

3. Google Login Edit Profile
   - Files:
     - app/[locale]/my-profile/EditProfileForm.tsx
     - app/[locale]/my-profile/UpdateAuthForm.tsx
   - Fix: Allow nationality and username edit for Google users
   - Don't show password fields for Google users

4. Nationality Settings
   - File: app/[locale]/my-profile/EditProfileForm.tsx
   - Add to form:
     - Nationality selector (country dropdown)
     - Checkbox: "Show nationality on posts"
   - Backend: Update profiles table if needed
   - PostCard: Show flag emoji next to username if enabled
   - File: app/components/PostCard.tsx
     - Access role from post data
     - Check show_nationality
     - Display flag emoji + hover tooltip with country name
   - i18n Keys:
     - 'profile.nationality': "Nationality"
     - 'profile.show_nationality': "Show my nationality on posts"
```

### Add Post / Create Story Page
```
1. Post Category Buttons
   - File: app/[locale]/lighter/[id]/add/AddPostForm.tsx
   - Section: Post type selector tabs
   - Changes:
     - Add emoji icons: 📝 📻 🖼️ 📍 ⛽
     - Make buttons taller (py-3 or py-4)
     - Add subtitle text below each icon/name
     - Subtitles (add to i18n):
       - 'add_post.subtitle.text': 'Tell us about your day'
       - 'add_post.subtitle.song': 'Share a musical moment'
       - 'add_post.subtitle.image': 'Show what you see'
       - 'add_post.subtitle.location': 'Mark the journey'
       - 'add_post.subtitle.refuel': 'Keep it alive'
     - Add slider animation on selection
       - When button selected, smooth accent bar slides to new position

2. Song Button Order
   - File: app/[locale]/lighter/[id]/add/AddPostForm.tsx
   - Function: renderFormInputs()
   - Change: Order of URL and Search buttons
   - New: [Search 🔍] [URL 🔗] instead of [URL] [Search]

3. Page Stability (Fix Scroll Jump)
   - File: app/[locale]/lighter/[id]/add/AddPostForm.tsx
   - Issue: Content jumps when changing post type
   - Fix:
     - Use fixed heights for conditional sections
     - Or ensure section is min-height and expands downward only
     - Don't change top content height

4. Visual Improvements
   - File: app/[locale]/lighter/[id]/add/page.tsx
   - Add: Illustration next to "Add to the Story" title
   - Add: Subtle background color or gradient
   - Remove: White background above tiled bg
   - Ensure: Only tiled background visible
```

### Navigation & UI
```
1. Logo Hover Halo
   - File: app/components/Header.tsx
   - Element: Logo Link
   - Add:
     - box-shadow: 0 0 30px rgba(primary-color, 0.3)
     - Transition: shadow 300ms ease
     - On hover: box-shadow with stronger color
     - Use Tailwind: shadow-lg with custom color

2. Navigation Button Reorder
   - File: app/components/Header.tsx
   - Current: How It Works - Refill Guide - Our Philosophy
   - New: How It Works - Save a Lighter - Our Philosophy - Refill Guide
   - Note: "Save a Lighter" already exists for logged in users
```

### Save a Lighter Page (Major Overhaul)
```
Files:
- app/[locale]/save-lighter/page.tsx
- app/[locale]/save-lighter/SaveLighterForm.tsx
- Create new component: app/[locale]/save-lighter/SaveLighterWhy.tsx (optional)

Sections to Add/Reorganize:
1. Hero/Why Section
   - Illustrations (from /public/illustrations/)
   - Engaging text about:
     - Fun aspect
     - Human mosaic
     - Anti-waste
     - Hand-made, sustainable stickers
     - Helps maintain website
   - Tone: Inspirational, engaging

2. Process Section
   - What happens when you save a lighter
   - Trophies explanation
   - Community aspect
   - Visual guides (with illustrations)

3. Order Summary (New)
   - Will receive variables from Stripe
   - Show:
     - Items (stickers)
     - Quantity
     - Subtotal
     - Shipping
     - Total
   - Format: Clean, clear layout

4. Delivery Details
   - User shipping address
   - Expected delivery
   - Customization options

5. Payment Details
   - Move from current top position
   - Stripe payment form integration
   - Card information (hidden/secure)
   - Billing address

Design Notes:
- Use 'basket' aesthetic/theme
- Multiple illustrations
- Better visual hierarchy
- Placeholder images for articles
- Stripe-ready structure
- Mobile responsive
```

### Lighter Page (Story Page)
```
File: app/[locale]/lighter/[id]/page.tsx

Header Section Changes:
Current Layout:
```
┌─────────────────────┐
│    Lighter Name     │
│      PIN: XXX       │
└─────────────────────┘
```

New Layout (Desktop):
```
┌──────┬──────────────┬──────────┐
│ 🕯️   │  Name        │ 999      │
│Illus │  PIN: XXX    │ Posts    │
└──────┴──────────────┴──────────┘
```

Mobile Layout:
Stack vertically or adjust spacing based on screen size

Implementation:
- Add lighter illustration (small container, left side)
- Keep name/PIN in center (or restructure grid)
- Add contribution count (large, bold, right side)
- Add "Posts" label under count
- Ensure mobile adaptation
```

### Footer & Legal
```
1. Cookie Banner
   - File: app/components/CookieConsent.tsx
   - Update text to explain:
     - NOT used for tracking
     - Only basic functions
     - NOT saved by us
     - Privacy-focused message

2. Footer Spacing
   - File: app/components/Footer.tsx
   - Issue: Moderation sentence hidden when cookie banner showing
   - Fix: Increase bottom padding/margin of footer
     - Or adjust cookie banner positioning
     - Or add bottom margin to body when banner present
```

---

## i18n Keys Checklist

### New Keys to Add (English & French)
```
🏠 Homepage
- home.hero.background: (not text key, styling)
- home.mosaic.subtitle
- home.become_lightsaver_text: (explanatory text)
- home.become_lightsaver_button: (maybe "Become a LightSaver")

📝 Add Post
- add_post.subtitle.text
- add_post.subtitle.song
- add_post.subtitle.image
- add_post.subtitle.location
- add_post.subtitle.refuel

👤 Profile
- profile.nationality
- profile.show_nationality

🔐 Auth
- auth.signup_success
- auth.login_success
- auth.logout_success

🚚 Save Lighter
- save_lighter.why_title
- save_lighter.why_description
- save_lighter.sustainable_text
- save_lighter.helps_website
- save_lighter.order_summary
- etc. (will have many new keys)
```

---

## Database/Backend Changes Needed

1. **Image Upload Foreign Key Error**
   - Check: Ensure user_id is being sent to RPC
   - Check: RPC function receives user_id parameter
   - Check: User exists in profiles table
   - Fix Location: app/api/posts/route.ts (if exists) or RPC function

2. **Nationality Display**
   - Ensure profiles table has:
     - nationality (string, nullable)
     - show_nationality (boolean, default false)
   - Ensure detailed_posts view includes user's nationality

3. **Save a Lighter Stripe Integration**
   - Plan database changes for:
     - Order tracking
     - Payment status
     - Delivery info
   - Prepare structure for Stripe webhook handling

---

## Testing Checklist

- [ ] PIN hyphen appears after 3rd character typed
- [ ] Burger menu opens/closes on mobile
- [ ] Rainbow arrow points correctly
- [ ] Hero section visible with background
- [ ] Mobile hero layout correct
- [ ] Random posts fade in/out at 1000ms
- [ ] Random posts staggered 1000ms apart
- [ ] Random posts don't overflow container
- [ ] Login notification appears
- [ ] Logout notification appears
- [ ] Nationality flag appears on posts when enabled
- [ ] Category buttons show subtitles
- [ ] Category selection smooth slider animation
- [ ] Add post page stable when changing category
- [ ] Image upload works without error
- [ ] Save a Lighter page loads correctly
- [ ] Navigation buttons in correct order
- [ ] Logo has hover halo effect
- [ ] Mobile responsive for all changes

---

**KEEP THIS FILE FOR REFERENCE DURING IMPLEMENTATION**
**LAST SAVED: 2024-11-01 Before Auto-Compact**
