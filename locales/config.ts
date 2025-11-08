export const i18n = {
  defaultLocale: 'en',
  locales: [
    'en',   // English
    'de',   // German
    'es',   // Spanish
    'fr',   // French
    // Hidden for launch - will be activated later:
    // 'ar',   // Arabic (RTL)
    // 'fa',   // Persian (RTL)
    // 'hi',   // Hindi
    // 'id',   // Indonesian
    // 'it',   // Italian
    // 'ja',   // Japanese
    // 'ko',   // Korean
    // 'mr',   // Marathi
    // 'nl',   // Dutch
    // 'pl',   // Polish
    // 'pt',   // Portuguese
    // 'ru',   // Russian
    // 'te',   // Telugu
    // 'th',   // Thai
    // 'tr',   // Turkish
    // 'uk',   // Ukrainian
    // 'ur',   // Urdu (RTL)
    // 'vi',   // Vietnamese
    // 'zh-CN' // Simplified Chinese
  ],
} as const;

export type Locale = (typeof i18n)['locales'][number];