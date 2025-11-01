'use client';

import { useCurrentLocale } from '@/locales/client';
import { useEffect } from 'react';

export default function SetHtmlLang() {
  const locale = useCurrentLocale();

  useEffect(() => {
    // Update the html lang attribute based on current locale
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return null;
}
