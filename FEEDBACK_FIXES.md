# LightMyFire Web - User Feedback & Fixes Needed

## CRITICAL SAVED INSTRUCTIONS
**DO NOT LOSE THIS FILE - AUTO COMPACT IS COMING**

---

## Index Page & All Pages

### Header & Footer Width Issues
- **Issue**: Header and footer are less wide than page, leaving gaps on left/right
- **Fix**: Extend header and footer to full page borders (remove max-width constraints)

### Hero Section Improvements
- **Move question mark helper**: From hero subtitle to RIGHT of "Lighter PIN" input field TITLE
- **"Found a Lighter" illustration**: Keep height same, fix WIDTH to respect original picture ratios
- **"Find Lighter" button**: Replace Lock emoji (🔒) with magnifying glass emoji (🔍)
- **"I'm too young to die" title**: INCREASE SIZE (make it more prominent)

### Become a Lightsaver Section
- **Issue**: Section is DUPLICATED
- **Fix**: DELETE the one with just button, KEEP the one with card that was created
- **Transfer**: Move the rainbow CTA arrow to the new CTA section

### How It Works Cards
- **Height alignment**: ALL cards should have SAME image height
- **Ratios**: Images must respect their respective original picture ratios
- **Alignment**: Make sure 1.2.3. titles are horizontally aligned
- **Card height**: Align all cards' height on the TALLEST one by expanding down
- **Purpose**: Maintain aesthetics/symmetry

---

## Save a Lighter Page

### Personalization Cards Fix
- **Card count**: Must match chosen pack (5, 10, or 50 cards)
- **Background selector**: NOT a URL input - use CIRCULAR COLOR PICKER
- **Apply to all checkbox**:
  - When checked: Only first card remains visible
  - When unchecked: All cards visible for individual customization
- **Language dropdown**: Choose language for sticker text (9 languages + English)
  - English always added underneath
  - Applies to ALL ordered lighters
- **Structure**: Language selector comes AFTER all personalization cards

---

## Refill Guide Page

### Make it More Interesting
- **Add stats**: Number of lighters sold yearly, thrown away, etc.
- **Reliable sources**: Must mention and cite sources
- **Add illustrations**: Make content more visually engaging

### Text Improvements
- **Be specific about refillable lighters**: DON'T mention brands
- **Educational approach**:
  - "How to know if my lighter is refillable?"
  - Visual explanations with illustrations
  - "If it looks like..." YES ✓
  - "If it has this circle (usually at bottom):" ... etc.
  - "With what do I recharge it?" → Provide options
- **Illustrations**: Add intuitive visual guides

### Map Section
- **For now**: ERASE the map section
- **Reason**: OpenStreetMap doesn't support shops - too complicated for now

---

## My Profile Page

### Trophy & Stats Reordering
- **Move trophies section**: Below stats, BEFORE "Lighters and Contributions" columns
- **Compliment**: Stats and trophy sections look awesome! ✨

### Google OAuth Users Fix
- **Current issue**: Google users can't change username and nationality
- **Fix needed**: Enable both username AND nationality editing for Google users

---

## Lighter Page ([id]/page.tsx)

### Map Improvements
- **Make it smaller**: So posts are more visible below
- **Alignment**: Align map on the LEFT of the card
- **Add right side**: Create space for "Lighter Saved By: ..." section
  - Display in nice/readable way (trust your design judgment)

### Add to Story Button
- **Add icon**: Plus icon (+) before/on button

---

## Add to Story Component

### Content Anchor Issue
- **Problem**: Content moves lot upon changing type of contribution
- **Fix**: Card's beginning should remain ANCHORED where it currently is
- **Reference point**: Location type post should stay ~26px from header
- **Goal**: Prevent jumping/shifting when changing post type

---

## Critical Bugs to Fix

### PIN Input Hyphen Bug (HIGH PRIORITY)
- **Issue**: Hyphen appears on 4th character instead of 3rd
- **Root cause**: Rule says "when >3" (strictly greater than 3)
- **Fix**: Change to "when >=3" or "when input.length >= 3" (on 3rd character)
- **Example**: "XXX-XXX" not "XXXX-XX"

### Burger Menu NOT Appearing on Mobile (HIGH PRIORITY)
- **Issue**: Mobile burger menu doesn't show
- **Status**: CRITICAL - affects mobile usability
- **Needs investigation**: Check Header component mobile breakpoints

### POST CREATION FAILS (HIGH PRIORITY)
- **Error**: "Error: Could not find the function public.create_new_post(...)"
- **Cause**: Likely Supabase function not defined or incorrect parameter names
- **Pending**: Database architecture will be provided
- **Note**: Same issue for YouTube search posting
- **Function signature needed**:
  ```
  create_new_post(
    p_content_text,
    p_content_url,
    p_is_anonymous,
    p_is_creation,
    p_is_find_location,
    p_is_public,
    p_lighter_id,
    p_location_lat,
    p_location_lng,
    p_location_name,
    p_post_type,
    p_title,
    p_user_id
  )
  ```

### YouTube Search Not Working
- **Cause**: Related to post creation RPC error
- **Pending**: Database validation

---

## Mobile Version
- **Note**: Check if separate adaptations needed AFTER these fixes
- **Current priority**: Fix desktop first, then mobile-specific issues

---

## NEXT STEPS

1. Save this file in long-term memory
2. Fix in order of priority:
   - [ ] PIN hyphen bug (3rd character fix)
   - [ ] Mobile burger menu fix
   - [ ] Header/Footer width extension
   - [ ] Page-by-page fixes (see sections above)
   - [ ] Database architecture review for RPC errors
3. Wait for database architecture from user
4. Test all changes
5. Mobile-specific adaptations if needed

---

## User Testing Notes
- User will test on their end
- Will report issues page by page
- We debug together based on findings
- User will provide database architecture separately

---

*Last Updated: Session with comprehensive user feedback*
*Status: PENDING IMPLEMENTATION*
