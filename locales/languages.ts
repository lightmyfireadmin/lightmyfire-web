/**
 * Language names mapping for all supported locales
 * Maps locale codes to their native language names
 */

export const languageNames: Record<string, { nativeName: string; englishName: string }> = {
  en: { nativeName: 'English', englishName: 'English' },
  ar: { nativeName: 'العربية', englishName: 'Arabic' },
  de: { nativeName: 'Deutsch', englishName: 'German' },
  es: { nativeName: 'Español', englishName: 'Spanish' },
  fa: { nativeName: 'فارسی', englishName: 'Persian' },
  fr: { nativeName: 'Français', englishName: 'French' },
  hi: { nativeName: 'हिन्दी', englishName: 'Hindi' },
  id: { nativeName: 'Bahasa Indonesia', englishName: 'Indonesian' },
  it: { nativeName: 'Italiano', englishName: 'Italian' },
  ja: { nativeName: '日本語', englishName: 'Japanese' },
  ko: { nativeName: '한국어', englishName: 'Korean' },
  mr: { nativeName: 'मराठी', englishName: 'Marathi' },
  nl: { nativeName: 'Nederlands', englishName: 'Dutch' },
  pl: { nativeName: 'Polski', englishName: 'Polish' },
  pt: { nativeName: 'Português', englishName: 'Portuguese' },
  ru: { nativeName: 'Русский', englishName: 'Russian' },
  te: { nativeName: 'తెలుగు', englishName: 'Telugu' },
  th: { nativeName: 'ไทย', englishName: 'Thai' },
  tr: { nativeName: 'Türkçe', englishName: 'Turkish' },
  uk: { nativeName: 'Українська', englishName: 'Ukrainian' },
  ur: { nativeName: 'اردو', englishName: 'Urdu' },
  vi: { nativeName: 'Tiếng Việt', englishName: 'Vietnamese' },
  'zh-CN': { nativeName: '中文', englishName: 'Mandarin Chinese' },
};

/**
 * Get supported second languages for stickers (excluding English which is always included)
 * All locales are now supported for sticker second language
 */
export const getSecondLanguageOptions = () => {
  // All languages are now supported for stickers (excluding English)
  return Object.entries(languageNames)
    .filter(([code]) => code !== 'en')
    .map(([code, { nativeName }]) => ({
      code,
      label: nativeName,
      name: nativeName,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Get default second language for stickers based on user's current locale
 * Returns 'fr' by default, unless user's locale is not English, then use their locale
 */
export const getDefaultStickerLanguage = (currentLocale: string): string => {
  // If current locale is not English, use it as default
  if (currentLocale !== 'en' && languageNames[currentLocale]) {
    return currentLocale;
  }

  // Otherwise default to French
  return 'fr';
};
