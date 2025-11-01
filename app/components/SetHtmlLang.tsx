'use client';

import { useCurrentLocale } from '@/locales/client';
import { useEffect } from 'react';

// RTL (Right-to-Left) languages
const RTL_LANGUAGES = ['ar', 'fa', 'ur'] as const;

export default function SetHtmlLang() {
  const locale = useCurrentLocale();

  useEffect(() => {
    // Update the html lang attribute and dir attribute based on current locale
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement;

      // Set language attribute
      htmlElement.lang = locale;

      // Set direction attribute for RTL languages
      if (RTL_LANGUAGES.includes(locale as any)) {
        htmlElement.dir = 'rtl';
      } else {
        htmlElement.dir = 'ltr';
      }
    }
  }, [locale]);

  return null;
}
