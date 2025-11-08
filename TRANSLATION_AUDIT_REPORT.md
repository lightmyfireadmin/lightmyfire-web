# LightMyFire Translation Audit Report
**Date:** 2025-11-08
**Total English Keys:** 1,090

---

## Executive Summary

| Language | Total Keys | Missing Keys | Completion % | Status |
|----------|------------|--------------|--------------|--------|
| **English (EN)** | 1,090 | 0 | 100.0% | ✅ Complete |
| **Spanish (ES)** | 1,082 | 8 | 99.3% | 🟡 Almost Complete |
| **German (DE)** | 1,063 | 29 | 97.3% | 🟡 Almost Complete |
| **French (FR)** | 1,080 | 9 | 99.2% | 🟡 Almost Complete |

---

## Important Note: French Locale Format

**The French locale uses a different key format from English:**
- **English:** Uses underscores (e.g., `'add_post.button.save'`)
- **French:** Uses dots throughout (e.g., `'add.post.button.save'`)

Both formats work correctly with the translation system. When adding missing French keys, maintain the dot notation format for consistency.

---

## 1. Spanish (ES) - Missing 8 Keys

### All Missing Keys (Notifications Category)

```typescript
// Add these to /home/user/lightmyfire-web/locales/es.ts

'notifications.success': 'Success!',
'notifications.error': 'Error',
'notifications.warning': 'Warning',
'notifications.auth_failed': 'Authentication failed. Please try again.',
'notifications.invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
'notifications.user_not_found': 'No account found with this email. Please sign up first!',
'notifications.session_expired': 'Your session has expired. Please log in again to continue.',
'notifications.password_reset_sent': 'Password reset email sent! Check your inbox.',
```

---

## 2. German (DE) - Missing 29 Keys

### Category Breakdown
- **Notifications:** 8 keys
- **Terms of Service:** 8 keys
- **Privacy Policy:** 4 keys
- **FAQ:** 2 keys
- **How It Works:** 3 keys
- **Add Post:** 2 keys
- **Save Lighter:** 1 key
- **Language:** 1 key

### All Missing Keys

```typescript
// Add these to /home/user/lightmyfire-web/locales/de.ts

// Home
'home.how_it_works.step2.description': 'Stick it on and let it go. Pass it to a friend or ',

// Notifications
'notifications.success': 'Success!',
'notifications.error': 'Error',
'notifications.warning': 'Warning',
'notifications.auth_failed': 'Authentication failed. Please try again.',
'notifications.invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
'notifications.user_not_found': 'No account found with this email. Please sign up first!',
'notifications.session_expired': 'Your session has expired. Please log in again to continue.',
'notifications.password_reset_sent': 'Password reset email sent! Check your inbox.',

// Privacy Policy
'privacy.p1': 'LightMyFire (',
'privacy.h4.right_erasure': '6.3. Right to Erasure - ',
'privacy.p18': 'You can request deletion of your personal data. You can delete individual posts anytime from ',
'privacy.ul15.li3': 'Update the ',

// Terms of Service
'terms.p1': 'These Terms of Service (',
'terms.p8': 'All content, features, and functionality of the Service—including but not limited to text, graphics, logos, icons, images, audio clips, data compilations, software, and the ',
'terms.p10': 'By posting User-Generated Content (',
'terms.ul9.li1': 'Manufacturing defects in the stickers',
'terms.h4.as_is': '7.1. ',
'terms.p26': 'THE SERVICE IS PROVIDED ',
'terms.ul16.li1': 'We\'ll update the ',

// How It Works Details
'how_it_works_details.step2.desc': 'Stick it on your lighter and give it away or ',
'how_it_works_details.step6.desc': 'By participating, you and your lighters will unlock achievements. Add your first post to get the ',

// FAQ
'faq.q4.desc': 'You have two choices. All posts are visible on the lighter\'s page (which requires the PIN to access). When you post, you can also check a box to make it ',
'faq.public_post.answer': 'You have full control! All posts are visible on the lighter\'s private page (which requires the PIN to access). When you post, you can also check a box to make it ',

// Save Lighter
'save_lighter.show_username_label': 'Show my username as the ',

// Add Post
'add_post.youtube_search.no_results': 'No results found.',
'add_post.refuel_message': 'You\'re a hero! Clicking ',

// Language
'language.zh-CN': '中文',
```

**Note:** Some keys like `'terms.p9'` were not found in the English locale and may be deprecated.

---

## 3. French (FR) - Missing 9 Keys

### Category Breakdown
- **Notifications:** 8 keys
- **Language:** 1 key

### All Missing Keys (with dot notation)

```typescript
// Add these to /home/user/lightmyfire-web/locales/fr.ts
// Note: Maintain dot notation format for consistency with existing French translations

// Notifications
'notifications.success': 'Success!',
'notifications.error': 'Error',
'notifications.warning': 'Warning',
'notifications.auth.failed': 'Authentication failed. Please try again.',
'notifications.invalid.credentials': 'Invalid email or password. Please check your credentials and try again.',
'notifications.user.not.found': 'No account found with this email. Please sign up first!',
'notifications.session.expired': 'Your session has expired. Please log in again to continue.',
'notifications.password.reset.sent': 'Password reset email sent! Check your inbox.',

// Language
'language.zh-CN': '中文',
```

---

## Action Items

### For Spanish (ES)
1. Translate 8 notification messages from English to Spanish
2. Add translations to `/home/user/lightmyfire-web/locales/es.ts`

### For German (DE)
1. Translate 29 keys across multiple categories:
   - 8 notification messages
   - 8 terms of service fragments
   - 4 privacy policy fragments
   - 2 FAQ entries
   - 3 how-it-works descriptions
   - 2 add-post messages
   - 1 save-lighter label
   - 1 language code (Chinese)
2. Add translations to `/home/user/lightmyfire-web/locales/de.ts`

### For French (FR)
1. Translate 9 keys (8 notifications + 1 language code)
2. Add translations to `/home/user/lightmyfire-web/locales/fr.ts`
3. **Important:** Maintain dot notation format (convert underscores to dots)

---

## File Locations

- **English:** `/home/user/lightmyfire-web/locales/en.ts`
- **Spanish:** `/home/user/lightmyfire-web/locales/es.ts`
- **German:** `/home/user/lightmyfire-web/locales/de.ts`
- **French:** `/home/user/lightmyfire-web/locales/fr.ts`

---

## Additional Notes

1. **Admin Panel Keys:** Not all keys need to be translated for all languages. Focus on client-side features first.

2. **Notification Keys:** All three languages are missing the same 8 notification keys, suggesting these were recently added to English.

3. **Chinese Language Code:** The key `'language.zh-CN': '中文'` is missing from ES, DE, and FR. This is a language selector option and doesn't need translation (it should remain '中文' in all locales).

4. **Terms & Privacy Fragments:** Some German keys appear to be partial sentences or fragments. Review the full context in the English file before translating.

5. **Format Consistency:** When adding new keys, follow the existing format in each locale file (spacing, quotes, comma placement).

---

## Validation

After adding translations, you can validate completeness by running:

```bash
node /home/user/lightmyfire-web/audit_translations_normalized.js
```

This will show you the updated completion percentages.
