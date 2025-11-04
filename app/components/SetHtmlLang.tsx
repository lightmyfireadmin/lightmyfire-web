'use client';

import { useCurrentLocale } from '@/locales/client';
import { useEffect } from 'react';

const RTL_LANGUAGES = ['ar', 'fa', 'ur'] as const;

export default function SetHtmlLang() {
  const locale = useCurrentLocale();

  useEffect(() => {
    
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement;

      
      htmlElement.lang = locale;

      
      if (RTL_LANGUAGES.includes(locale as any)) {
        htmlElement.dir = 'rtl';
      } else {
        htmlElement.dir = 'ltr';
      }
    }
  }, [locale]);

  return null;
}
