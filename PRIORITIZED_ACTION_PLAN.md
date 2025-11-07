# LightMyFire - Prioritized Action Plan

**Created:** 2025-11-07
**Status:** Ready for Implementation
**Confirmed with User:** Yes

---

## ✅ COMPLETED ACTIONS

### 1. Database Pack Size Constraint - FIXED ✅
- **Issue:** Database allowed invalid pack sizes (5, 25) and rejected valid size (20)
- **Fix Applied:** Updated constraint to `CHECK (pack_size IN (10, 20, 50))`
- **Method:** Applied via Supabase MCP migration
- **Verified:** Constraint now correct in database

### 2. Repository Sync - VERIFIED ✅
- **Status:** Fully synced with GitHub main branch
- **Supabase MCP:** Connected and functional
- **Build:** Passing successfully

---

## 🔴 CRITICAL ACTIONS (Must Fix Before Launch)

### 1. Fix Test Sticker Generation Auth Issue
**Problem:** `/api/generate-printful-stickers` requires authentication, but test endpoint can't pass cookies
**Impact:** Cannot test sticker generation in development
**Root Cause:** Server-to-server fetch in `test-generate-stickers/route.ts` doesn't include session cookies

**Solution Options:**
A. Add special header/token for internal test calls
B. Extract generation logic into shared function
C. Make generate-printful-stickers check for development mode

**Recommended:** Extract shared generation function

**Files:**
- `/app/api/test-generate-stickers/route.ts` (line 78 - fetch call)
- `/app/api/generate-printful-stickers/route.ts` (line 145-150 - auth check)

---

### 2. Delete Unused Flags Directory
**Confirmed:** App uses Unicode emoji flags, not PNG files
**Verification:** Zero code references to `/public/flags/` directory
**Savings:** 466KB (254 files)
**Risk:** None - completely safe to delete

**Command:**
```bash
rm -rf public/flags/
```

---

## 🟡 HIGH PRIORITY ACTIONS (Should Do)

### 3. Review Audit Reports with User
**User Directive:** "We thrive for perfection before launch!"

**Need Clarification On:**
1. Which audit findings are **actually critical** vs outdated spec conflicts?
2. Font sizes in sticker generation - are they correct as-is?
3. Unused illustrations (8 files, 27.4MB) - keep for future diversity?
4. Missing i18n translations (109 keys) - which languages are priority?
5. Content humanization - implement now or post-launch?

**Audit Files to Review Together:**
- AUDIT_REPORT.md (21K) - 12 critical + 18 high priority issues
- CODEBASE_REVIEW_REPORT.md (12K) - 207 total issues
- MOBILE_RESPONSIVENESS_AUDIT.md (not yet read)
- SECURITY_AUDIT_REPORT.md (not yet read)
- MODERATION_SYSTEM_REPORT.md (not yet read)

---

## 🟢 MEDIUM PRIORITY ACTIONS (Nice to Have)

### 4. Asset Optimization
**Confirmed NOT to delete:**
- 8 unused illustrations (future diversity potential)
- Trophy images (all in use)
- Lighter type images (all in use)

**Could Optimize:**
- Background tile (bgtile.png): 1.4MB → ~300KB
- Loading.gif: 868KB → CSS spinner (0KB)
- 7 used illustrations: Convert to WebP (~16.5MB savings)
- Trophy images: Optimize (~2-3MB savings)

**Total Potential:** ~20MB additional savings after flag deletion

---

### 5. Documentation Cleanup
**Low Risk Tasks:**
- Remove exposed credentials from IMPLEMENTATION_SUMMARY.md
- Update APP_LAUNCH_MASTER_PLAN.md with final status
- Archive outdated audit reports

---

## 📊 STATUS SUMMARY

### Database
- ✅ Pack size constraint fixed
- ✅ Supabase MCP working
- ⏳ Full schema audit needed (other audit findings)

### Assets
- ✅ Flags directory verified unused
- ⏳ Pending deletion (waiting for final confirmation)
- 🟡 Optimization opportunities identified

### Code
- ✅ Recent critical security/performance fixes (previous session)
- 🔴 Test generation auth issue needs fix
- 🟡 207 issues catalogued in code review

### Launch Readiness
- 🔴 **NOT READY** - Need to address:
  1. Test generation issue (development blocking)
  2. User review of audit findings
  3. Clarify which issues are truly critical

---

## NEXT STEPS - Awaiting User Input

**Questions for User:**

1. **Test Sticker Generation:**
   - Can you log in on `/fr/test-stickers-page` and try again?
   - Or should I fix the auth issue in the test endpoint?

2. **Flags Directory:**
   - Confirmed safe to delete - proceed? (saves 466KB)

3. **Audit Review Priority:**
   - Which audit reports should we review first?
   - Which findings do you consider **actually critical** for launch?

4. **Font Sizes & Sticker Specs:**
   - Are current sticker dimensions/fonts working correctly?
   - Or do they need adjustment per specifications?

5. **Missing i18n:**
   - 109 missing translation keys - which are blockers?
   - Focus on EN/FR first, or all 27 languages?

6. **Timeline:**
   - What's the target launch date?
   - What's the minimum viable feature set?

---

## RECOMMENDATIONS

### Immediate (Today):
1. ✅ Delete `/public/flags/` directory (confirmed safe)
2. 🔴 Fix test generation auth issue (unblock development)
3. 📋 Review audit findings together (clarify priorities)

### Short-term (This Week):
4. Address **actual** critical issues from audits
5. Test full user journey end-to-end
6. Optimize major assets (background, loading gif)

### Medium-term (Next Week):
7. Complete priority i18n translations
8. Mobile responsiveness testing
9. Security & moderation verification
10. Content humanization implementation

### Pre-Launch Checklist:
- [ ] All critical audit issues resolved
- [ ] Full user journey tested
- [ ] Payment flow verified
- [ ] Sticker generation working
- [ ] Mobile experience acceptable
- [ ] Core translations complete (EN/FR minimum)
- [ ] Moderation system verified
- [ ] Security audit passed

---

**Created by:** Claude AI
**Last Updated:** 2025-11-07 18:00
**Status:** Awaiting user decisions on next priorities
