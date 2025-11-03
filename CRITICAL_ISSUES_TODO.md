# Critical Issues Requiring Attention - Action Plan

## Quick Wins (Completed ✅)
1. ✅ **YouTube API** - Added `NEXT_PUBLIC_YOUTUBE_API_KEY` to `.env.local`
2. ✅ **FAQ Spacing** - Added top padding (`py-4 sm:py-5`) to answer sections
3. ✅ **PIN Helper Alignment** - Already using `items-baseline` (correct)
4. ✅ **Index Page Gaps** - Already using `gap-3 lg:gap-4` (correct)

---

## Medium Priority Issues (Need Investigation)

### 1. Language Dropdown Z-Index
**Issue**: Dropdown appears under header instead of over it
**Location**: Header component language selector
**Required Fix**: Add `z-index` to dropdown container
**Action**:
- Find language selector component
- Add `z-50` or `z-[60]` (higher than header's z-50)
- Ensure parent has `relative` positioning

### 2. FAQ Margin Between Q&A ✅ FIXED
**Previously**: `pb-4 sm:pb-5` (only bottom padding on answer)
**Now**: `py-4 sm:py-5` (padding on both sides)
**Status**: Complete

### 3. Random Posts Feed Continuous Flow
**Issues**:
- Posts render all at once causing glitches
- Should delay initial spawn
- Should never overlap
**Location**: `/app/components/RandomPostFeed.tsx`
**Current**: Uses pixel-based animation (60fps) with 2px/frame movement
**Problem**: May need initial delay on component mount
**Action**: Add delay before first posts spawn

### 4. Trophies Not Unlocking
**Issue**: User with 3 posts doesn't have "Add first post" achievement
**Expected**: Trophy should unlock at 1+ posts
**Location**: Likely in `/app/[locale]/my-profile` or trophy unlock logic
**Root Cause**: Need to check trophy conditions & database link

### 5. Lighter Database Link Broken
**Issue**: Lighter shows 0 posts when database has 21
**Expected**: Post count should match database
**Likely Cause**:
- Post-lighter foreign key issue
- RLS policy blocking queries
- Post visibility filter
**Action**: Check `posts` table → `lighter_id` relationship

---

## Complex Restoration (Requires Major Work)

### 6. Post Type Selection UI with Sliding Animation
**Previously Had**:
- Selection buttons for post type (text, song, image, location, refuel)
- Smooth sliding transition of selected marker
- Colored borders matching post type colors
- Larger buttons with subtitles (e.g., "Poem" for text)
- Centered layout

**Current State**: Basic or missing
**Location**: `/app/[locale]/lighter/[id]/add/AddPostForm.tsx`
**Needs**:
- Rebuild button selector with smooth animations
- Add post type color scheme
- Center and enlarge buttons
- Add descriptive subtitles
- Add sliding indicator

### 7. OpenStreetMap Location Picker
**Previously Had**:
- Embedded OpenStreetMap
- Live search dropdown for addresses
- Click-to-confirm location selection
- Map updates in real-time

**Current State**: Using latitude/longitude inputs (removed)
**Location**: `/app/[locale]/lighter/[id]/add/AddPostForm.tsx`
**Needs**:
- Install `react-leaflet` and `leaflet`
- Implement address search with `nominatim`
- Add map picker interface
- Remove lat/lng input fields
- Save coordinates from map selection

### 8. Post Type UI Subtitles
**Color Scheme** (from posts for reference):
- text: Blue border
- song: Green border
- image: Red border
- location: Purple border
- refuel: Orange border

**Subtitles**:
- text: "Poem, Story, Thought"
- song: "YouTube, Spotify Link"
- image: "Photo, Screenshot"
- location: "Where Found It"
- refuel: "Lighter Refill"

---

## Database Queries to Check

### Check Lighter-Post Link
```sql
SELECT
  l.id, l.name,
  COUNT(p.id) as post_count
FROM lighters l
LEFT JOIN posts p ON l.id = p.lighter_id
GROUP BY l.id, l.name
ORDER BY post_count DESC;
```

### Check Trophy Conditions
```sql
SELECT
  u.id, u.email,
  COUNT(p.id) as post_count,
  COUNT(DISTINCT l.id) as lighter_count
FROM auth.users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN lighters l ON u.id = l.user_id
GROUP BY u.id, u.email;
```

---

## Implementation Priority

### Phase 1 (Today - Quick Fixes)
- [x] YouTube API key
- [x] FAQ spacing
- [ ] Language dropdown z-index
- [ ] Random posts feed initial delay
- [ ] Trophy unlock logic verification
- [ ] Lighter post count query fix

### Phase 2 (Tomorrow - UI Restoration)
- [ ] Post type selector with animations
- [ ] Add color scheme styling
- [ ] Add subtitles to post types

### Phase 3 (Next - Complex Features)
- [ ] OpenStreetMap integration
- [ ] Address search dropdown
- [ ] Map picker UI

---

## Files to Modify

1. **app/components/Header.tsx** - Language dropdown z-index
2. **app/components/RandomPostFeed.tsx** - Add initial spawn delay
3. **app/[locale]/my-profile/*.tsx** - Trophy unlock logic
4. **app/[locale]/lighter/[id]/add/AddPostForm.tsx** - Post types UI
5. **app/[locale]/lighter/[id]/add/AddPostForm.tsx** - OpenStreetMap integration

---

## Next Steps

1. Verify language dropdown component
2. Add initial delay to random posts feed
3. Check trophy conditions in database
4. Rebuild post type selector UI
5. Integrate OpenStreetMap

**Status**: Ready to implement phase 1 items
