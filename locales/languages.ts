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
 * Get all supported languages excluding English
 * Used for the second language selection dropdown in lighter customization
 */
export const getSecondLanguageOptions = () => {
  return Object.entries(languageNames)
    .filter(([code]) => code !== 'en')
    .map(([code, { nativeName }]) => ({
      code,
      label: nativeName,
      name: nativeName,
    }));
};
