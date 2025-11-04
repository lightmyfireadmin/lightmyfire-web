# Asset Usage Quick Reference Guide

## Used Assets Summary (31 Total)

### Critical Assets (Used Multiple Times)
| Asset | Uses | Primary Purpose |
|-------|------|-----------------|
| LOGOLONG.png | 4 | Branding (Header, PDF, Printful API, Sticker Generation) |
| around_the_world.png | 3 | Homepage, About page, Pin entry form |
| telling_stories.png | 3 | Content creation prompts across pages |

### Icon/Illustration Assets (Used Once or Twice)
| Asset | Uses | Purpose |
|-------|------|---------|
| personalise.png | 2 | Customization prompts |
| thumbs_up.png | 2 | Engagement prompts |
| sticker_bg_layer.png | 2 | Sticker background template |

### Trophy System Assets (All in TrophyList.tsx)
| Asset | Purpose |
|-------|---------|
| chronicles_trophy.png | Story collection achievement |
| collector_trophy.png | Lighter collection achievement |
| community_builder_trophy.png | Community contribution |
| epic_saga_trophy.png | Major milestone |
| fire_starter_trophy.png | Community founder |
| globe_trotter_trophy.png | Global participation |
| musician_trophy.png | Music/content creation |
| photographer_trophy.png | Photography achievement |
| popular_contributor_trophy.png | Popular creator |
| story_teller_trophy.png | Storytelling achievement |

### Disposal/Refill Information Assets
Used in: /app/[locale]/dont-throw-me-away/page.tsx

| Asset | Type |
|-------|------|
| butane_refill_process.png | Process diagram |
| butane_refillable.png | Lighter type indicator |
| non_refillable.png | Lighter type indicator |
| gasoline_refill_process.png | Process diagram |
| gasoline_refillable.png | Lighter type indicator |

### Save Lighter Flow Assets
Used in: /app/[locale]/save-lighter/page.tsx

| Asset | Purpose |
|-------|---------|
| act_for_planet.png | Eco-badge |
| creative_lighter.png | Lighter variant |
| human_mosaic.png | Community feature |
| sustainable_lighter.png | Lighter variant |

### System Assets
| Asset | Uses | Purpose |
|-------|------|---------|
| bgtile.png | 1 | Background tile in CSS |
| loading.gif | 2 | Loading indicator |
| webclip.png | 1 | Web app icon metadata |
| CTA_rainbow_arrow.png | 1 | Call-to-action button |
| assistance_questions.png | 1 | FAQ section |
| dreaming_hoping.png | 1 | Empty state illustration |

---

## Unused Assets Summary (29 Total)

### Root Level - Logo Variants (7 unused)
**Status:** CANDIDATES FOR REMOVAL
```
LOGOSMALL.png              (Old version)
NEWLOGOLONG.png            (Superseded by LOGOLONG.png)
NEWLOGOLONG2.png           (Superseded by LOGOLONG.png)
NEWLOGOSMALL.png           (Old version)
LOOOOGO.png                (Old version)
LIGHTMYFIRE.png            (Branding variant)
```

### Root Level - Mascot/Smile Assets (2 unused)
**Status:** CANDIDATES FOR REMOVAL
```
66c0f160cdd922093cbdb82c_SMILE.png  (Hashed filename - legacy)
SMILE.png                            (Duplicate mascot)
```

### Root Level - Other Images (4 unused)
**Status:** VERIFY BEFORE REMOVAL
```
SEE1.png                   (Purpose unclear)
circle-scatter-haikei.png  (Background pattern?)
favicon.png                (Favicon - verify actual usage)
seethrough.png             (Purpose unclear)
```

### SVG Files (3 unused)
**Status:** VERIFY BUILD PROCESS
```
file.svg                   (Icon asset?)
globe.svg                  (Icon asset?)
next.svg                   (Next.js placeholder?)
vercel.svg                 (Vercel placeholder?)
window.svg                 (Icon asset?)
```

### Illustrations Folder - Trophy Variants (4 unused)
**Status:** REPLACED BY NEWASSETS VERSIONS
```
trophy_community_light.png      (→ community_builder_trophy.png)
trophy_first_spark.png          (→ fire_starter_trophy.png)
trophy_master_alchemist.png     (→ No direct replacement)
trophy_storyteller.png          (→ story_teller_trophy.png)
```

### Illustrations Folder - Community/Social (3 unused)
**Status:** ABANDONED FEATURE ASSETS
```
big_group.png              (Community gathering)
commenting.png             (Discussion feature)
community.png              (Community hub)
```

### Illustrations Folder - Other (5 unused)
**Status:** ABANDONED ASSETS
```
confused.png               (Error/help state)
flame_item.png             (Product feature)
presentation_card.png      (Card design)
sharing.png                (Social sharing)
variety.png                (Product showcase)
```

### Other Files (1 unused)
```
refilling-butane-lighter.jpg   (Reference/help image)
```

---

## Folder-by-Folder Analysis

### /public (Root)
- **Used:** 3 files (bgtile.png, LOGOLONG.png, webclip.png)
- **Unused:** 13 files
- **Status:** Consolidate logos, remove duplicates
- **Action:** Move active content to subfolders

### /public/illustrations/
- **Used:** 8 files
- **Unused:** 15 files
- **Status:** Archive to separate folder
- **Action:** Keep active illustrations, move old ones to archive

### /public/newassets/
- **Used:** 20 files
- **Unused:** 0 files
- **Status:** EXCELLENT - Well organized
- **Action:** No cleanup needed

### /public/flags/
- **Status:** Excluded from report (dynamic references)

---

## By Feature Usage

### Trophy/Achievement System
- Component: `/app/[locale]/my-profile/TrophyList.tsx`
- Assets Required: 10 PNG files from newassets/
- Status: All assets present and accounted for

### Sticker/Lighter Customization
- Components: `/app/[locale]/save-lighter/` (3 components)
- Assets Required: 5 images (lighter variants, eco-badges, background layer)
- Status: All assets in use

### Sustainability Information
- Page: `/app/[locale]/dont-throw-me-away/page.tsx`
- Assets Required: 5 process/type indicators
- Status: All assets in use

### Homepage/Landing
- Page: `/app/[locale]/page.tsx`
- Assets Required: 5 illustrations
- Status: All assets in use

### User Profiles
- Components: My profile, My posts list, Lighter details
- Assets Required: Illustrations for storytelling, content prompts
- Status: All assets in use

---

## Storage Impact

### Estimated Space Savings (If Removed)
- Unused root logos: ~2.5 MB
- Unused illustrations folder: ~4-5 MB
- Old SVG variants: minimal
- **Total Potential Savings: ~6-7 MB**

### Current Usage
- Active newassets: ~1-2 MB (all needed)
- Active illustrations: ~500 KB (all needed)
- Critical root assets: ~150 KB (LOGOLONG.png required)

---

## Migration Priority

### Phase 1 (Immediate) - No Risk
- Create archive directory for old illustrations
- Back up unused assets before deletion
- Document removed assets for reference

### Phase 2 (1-2 weeks) - Consolidate
- Verify no hardcoded paths to old logo variants
- Update any documentation using old filenames
- Consolidate logo files to single primary version

### Phase 3 (3-4 weeks) - Optimize
- Reorganize public/ folder structure
- Update import statements if needed
- Verify no build-time image references

### Phase 4 (Ongoing) - Monitor
- Add asset auditing to CI/CD pipeline
- Run this report quarterly
- Document new assets as they're added

---

## Checklist for Safe Cleanup

Before removing any unused assets:
- [ ] Verify asset is NOT in git history (if tracking)
- [ ] Confirm no hardcoded paths exist
- [ ] Check build configuration files
- [ ] Search entire codebase one more time
- [ ] Backup asset before deletion
- [ ] Update documentation
- [ ] Test full build process
- [ ] Verify production deployment

---

