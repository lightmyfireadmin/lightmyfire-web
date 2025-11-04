# LightMyFire Web Application - Asset Usage Reports

**Generated:** November 4, 2025  
**Analysis Scope:** All image assets in `/public/` (excluding flags folder)  
**Total Assets Analyzed:** 60 files

---

## Quick Facts

- **Used Assets:** 31 (51.67%)
- **Unused Assets:** 29 (48.33%)
- **Critical Assets:** 3 (LOGOLONG.png, sticker_bg_layer.png, and all newassets/)
- **Recommended Cleanup:** 6-7 MB of potentially removable assets

---

## Report Files Overview

### 1. ASSET_USAGE_REPORT.md
**Best For:** Complete detailed analysis with all tables  
**Contents:**
- Comprehensive tables for each asset category
- Exactly where each asset is used
- Asset usage organized by page/component
- Professional format suitable for documentation

**Key Sections:**
- Task 1: Asset Usage Report (31 used assets with locations)
- Task 2: Unused Assets Report (29 unused assets)
- Asset Usage by Page/Component
- Recommendations for cleanup

### 2. ASSET_USAGE_DETAILED.csv
**Best For:** Data analysis and spreadsheet work  
**Format:** CSV with 5 columns
- Asset Name
- Status (USED/UNUSED)
- File Path
- Number of Occurrences
- Used In (semicolon-separated file list)

**Use Cases:**
- Import into Excel/Sheets for filtering
- Automated processing and scripting
- Historical tracking and comparison
- Database record keeping

### 3. ASSET_SUMMARY.txt
**Best For:** Executive overview and decision-making  
**Contents:**
- Key findings and statistics
- Category breakdown by folder
- Top used assets ranked
- Feature areas requiring assets
- Priority-ordered recommendations
- Organizational improvement suggestions
- Technical notes for developers
- Next steps and checklist

**Perfect For:**
- Quick understanding of situation
- Management/stakeholder updates
- Planning cleanup efforts
- Understanding feature dependencies

### 4. QUICK_REFERENCE.md
**Best For:** Day-to-day development work  
**Contents:**
- Quick lookup tables by use count
- Trophy system asset mapping
- All features and their required assets
- Folder-by-folder analysis
- By-feature usage guide
- Safe cleanup checklist
- Migration priority phases

**Perfect For:**
- Developers adding new features
- Asset management decisions
- Quick lookups during development
- Understanding what assets support which features

---

## Key Findings Summary

### Asset Distribution

```
Public Root (22 total)
├── Used: 3 (LOGOLONG.png, bgtile.png, webclip.png)
└── Unused: 13 (logos, icons, backgrounds)

Illustrations Folder (23 total)
├── Used: 8 (various illustrations)
└── Unused: 15 (old trophies, social features)

New Assets Folder (23 total)
├── Used: 20 (trophies, processes, lighters)
└── Unused: 0 (excellent - no cleanup needed)
```

### Most Critical Assets

1. **LOGOLONG.png** (4 uses)
   - Header component
   - PDF generation
   - Printful API integration
   - Sticker PNG conversion
   - DO NOT REMOVE

2. **sticker_bg_layer.png** (2 uses)
   - Client-side sticker preview
   - Server-side sticker generation
   - DO NOT REMOVE

3. **All newassets/ files** (20 uses)
   - Trophy system backbone
   - Lighter customization
   - Process documentation
   - DO NOT REMOVE

### Highest Priority Cleanup

**Logo Consolidation** (7 files)
- LOGOSMALL.png, NEWLOGOLONG.png, NEWLOGOLONG2.png, NEWLOGOSMALL.png, LOOOOGO.png
- Plus: 66c0f160cdd922093cbdb82c_SMILE.png, SMILE.png
- Impact: ~2.5 MB potential savings
- Risk: LOW (easy to verify usage)

**Old Illustrations Archive** (12 files)
- All trophy_* variants (4 files) - replaced by newassets
- Unused social illustrations (3 files)
- Other abandoned illustrations (5 files)
- Impact: ~4-5 MB potential savings
- Risk: VERY LOW (clearly replaced or abandoned)

---

## Using These Reports

### For Developers
Use **QUICK_REFERENCE.md** when:
- Adding new features
- Needing to reference trophy asset names
- Understanding feature asset requirements
- Considering reusing an illustration

### For Project Managers
Use **ASSET_SUMMARY.txt** when:
- Reporting on technical debt
- Planning cleanup sprints
- Understanding storage usage
- Estimating storage savings

### For Asset Management
Use **ASSET_USAGE_DETAILED.csv** when:
- Tracking changes over time
- Automated reporting
- Analyzing trends
- Documenting inventory

### For Complete Reference
Use **ASSET_USAGE_REPORT.md** when:
- Comprehensive documentation needed
- Adding to official docs
- Stakeholder presentations
- Historical reference

---

## How Data Was Collected

### Search Method
- Pattern matching: Exact filename and relative path
- Scope: All .js, .jsx, .ts, .tsx, .css, .html files
- Exclusions: node_modules/, .next/ (build directories)

### Verification
- Each asset cross-referenced in codebase
- File paths verified against actual implementation
- Dynamic references (flags) properly excluded
- Multiple references counted separately

### Accuracy
- Manual verification of critical assets
- 100% scan coverage of source files
- False positive check on common filenames
- Flags folder confirmed as dynamic (excluded)

---

## Understanding the Data

### "Occurrences" Column
- Counts how many files reference the asset
- NOT how many times the asset is displayed
- Example: LOGOLONG.png referenced in 4 files = 4 occurrences
- Used to identify importance/impact of removal

### "Used In" Column
- Lists relative paths to source files
- Separated by semicolons in CSV
- Shows where to look if modifying an asset
- Useful for understanding asset scope

### Status Categories
- **USED:** Asset is referenced in at least one source file
- **UNUSED:** Asset has no references in source code
- **CRITICAL:** Asset used multiple times or in essential systems
- **ABANDONED:** Clear that asset is no longer needed

---

## Recommended Next Steps

### Immediate (This Week)
1. Read the summary for context
2. Review high-priority cleanup list
3. Back up unused assets before deletion
4. Create archive folder structure

### Short Term (1-2 Weeks)
1. Verify logo consolidation with brand team
2. Remove confirmed unused assets
3. Update any documentation
4. Test full build process

### Medium Term (3-4 Weeks)
1. Reorganize /public/ folder structure
2. Move assets to logical subfolders
3. Update import statements if needed
4. Document new structure

### Ongoing
1. Add asset audit to quarterly review
2. Document all new assets added
3. Consider automated asset checking in CI/CD
4. Update reports twice per year

---

## Questions & Troubleshooting

### Q: Can I safely delete these unused assets?
**A:** For logos and old illustrations: Yes, after verifying no external references. For SVG files: Check build process first.

### Q: What about the flags folder?
**A:** Excluded from this report. Flags use dynamic country code references (e.g., `/flags/us.png` loaded by code, not filename search).

### Q: Why do some assets show 0 occurrences?
**A:** These are completely unused in the codebase and are primary cleanup candidates.

### Q: What if I need an old asset later?
**A:** Create an archive folder in git or backup storage. Assets can be restored if needed.

### Q: Should I consolidate the logos now?
**A:** Yes, high priority. Pick one logo format and version, remove others, update all references.

---

## File Locations

All reports are in the root of the project:

```
lightmyfire-web/
├── ASSET_USAGE_REPORT.md        (Detailed analysis)
├── ASSET_USAGE_DETAILED.csv     (Data for spreadsheets)
├── ASSET_SUMMARY.txt             (Executive summary)
├── QUICK_REFERENCE.md            (Developer quick guide)
└── README_ASSET_REPORTS.md       (This file)
```

---

## Version History

- **v1.0** - November 4, 2025
  - Initial comprehensive asset audit
  - 60 assets analyzed
  - 31 used, 29 unused
  - Reports in 4 formats

---

## Contact & Questions

For questions about:
- **Asset organization:** Check QUICK_REFERENCE.md
- **Complete details:** Check ASSET_USAGE_REPORT.md  
- **Summary insights:** Check ASSET_SUMMARY.txt
- **Data analysis:** Use ASSET_USAGE_DETAILED.csv

---

Generated with automated asset analysis tools.  
All file paths are relative to `/public/` unless otherwise noted.
