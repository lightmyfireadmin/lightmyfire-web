export const i18n = {
  defaultLocale: 'en',
  locales: [
    'en',   // English
    'ar',   // Arabic (RTL)
    'de',   // German
    'es',   // Spanish
    'fa',   // Persian (RTL)
    'fr',   // French
    'hi',   // Hindi
    'id',   // Indonesian
    'it',   // Italian
    'ja',   // Japanese
    'ko',   // Korean
    'mr',   // Marathi
    'nl',   // Dutch
    'pl',   // Polish
    'pt',   // Portuguese
    'ru',   // Russian
    'te',   // Telugu
    'th',   // Thai
    'tr',   // Turkish
    'uk',   // Ukrainian
    'ur',   // Urdu (RTL)
    'vi',   // Vietnamese
    'zh-CN' // Simplified Chinese
  ],
} as const;

export type Locale = (typeof i18n)['locales'][number];