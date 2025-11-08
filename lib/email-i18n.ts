import en from '@/locales/en';
import es from '@/locales/es';
import fr from '@/locales/fr';
import de from '@/locales/de';

type LocaleKey = keyof typeof en;

const locales = {
  en,
  es,
  fr,
  de,
} as const;

export type SupportedEmailLanguage = keyof typeof locales;

export function getEmailTranslation(
  lang: SupportedEmailLanguage,
  key: LocaleKey,
  replacements?: Record<string, string | number>
): string {
  const locale = locales[lang] || locales.en;
  let text = ((locale as Record<string, any>)[key] as string) || (en[key] as string) || key;

  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
    });
  }

  return text;
}

export function t(lang: SupportedEmailLanguage) {
  return (key: LocaleKey, replacements?: Record<string, string | number>) =>
    getEmailTranslation(lang, key, replacements);
}
