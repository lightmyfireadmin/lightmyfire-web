'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const t = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useCurrentLocale();

  const changeLocale = (locale: string) => {
    router.push(`/${locale}${pathname.startsWith(`/${currentLocale}`) ? pathname.substring(3) : pathname}`);
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={currentLocale}
        onChange={(e) => changeLocale(e.target.value)}
        className="block appearance-none w-full bg-background border border-border text-foreground py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-background focus:border-primary"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
