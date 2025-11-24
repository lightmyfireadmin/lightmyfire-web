import en from '@/locales/en';
import es from '@/locales/es';
import fr from '@/locales/fr';
import de from '@/locales/de';

/**
 * Type definition for valid locale keys based on the English locale file.
 */
type LocaleKey = keyof typeof en;

/**
 * Map of supported locales and their corresponding translation objects.
 */
const locales = {
  en,
  es,
  fr,
  de,
} as const;

/**
 * Type definition for supported email languages.
 */
export type SupportedEmailLanguage = keyof typeof locales;

/**
 * Retrieves a translated string for emails, replacing placeholders.
 *
 * This function looks up the translation for the given key in the specified language.
 * If the translation is missing in the requested language, it falls back to English.
 * It also performs variable substitution for placeholders formatted as `{key}`.
 *
 * @param {SupportedEmailLanguage} lang - The language code (e.g., 'en', 'es').
 * @param {LocaleKey} key - The translation key.
 * @param {Record<string, string | number>} [replacements] - Key-value pairs for placeholder replacement.
 * @returns {string} The translated string with replacements applied.
 */
export function getEmailTranslation(
  lang: SupportedEmailLanguage,
  key: LocaleKey,
  replacements?: Record<string, string | number>
): string {
  const locale = locales[lang] || locales.en;
  // Using unknown first to safely cast to string if it exists, though types suggest it matches 'en' structure
  let text = ((locale as unknown as Record<string, string>)[key]) || (en[key] as string) || key;

  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
    });
  }

  return text;
}

/**
 * Creates a translation function for a specific language.
 *
 * This is a curried version of `getEmailTranslation` that pre-binds the language,
 * making it easier to use when generating an email content where the language is constant.
 *
 * @param {SupportedEmailLanguage} lang - The language code.
 * @returns {Function} A function that accepts a key and replacements to return a translated string.
 */
export function t(lang: SupportedEmailLanguage) {
  return (key: LocaleKey, replacements?: Record<string, string | number>) =>
    getEmailTranslation(lang, key, replacements);
}
