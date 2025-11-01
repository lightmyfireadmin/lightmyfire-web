'use client';

import { Fragment } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useCurrentLocale } from '@/locales/client';
import { i18n } from '@/locales/config';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Language names in their native language
const languageNames: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
  de: 'Deutsch',
  es: 'Español',
  fa: 'فارسی',
  fr: 'Français',
  hi: 'हिन्दी',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  mr: 'मराठी',
  nl: 'Nederlands',
  pl: 'Polski',
  pt: 'Português',
  ru: 'Русский',
  te: 'తెలుగు',
  th: 'ไทย',
  tr: 'Türkçe',
  uk: 'Українська',
  ur: 'اردو',
  vi: 'Tiếng Việt',
  'zh-CN': '中文 (简体)',
};

export default function LanguageSwitcher() {
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Replace the current locale in the pathname with the new one
    const segments = pathname.split('/');
    // segments[0] is empty (before the first /), segments[1] is the locale
    segments[1] = newLocale;
    const newPathname = segments.join('/');
    router.push(newPathname);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted">
          <GlobeAltIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          {languageNames[currentLocale]}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {i18n.locales.map((locale) => (
              <Menu.Item key={locale}>
                {({ active }) => (
                  <button
                    onClick={() => handleLocaleChange(locale)}
                    className={classNames(
                      active ? 'bg-muted text-foreground' : 'text-muted-foreground',
                      currentLocale === locale ? 'font-semibold' : '',
                      'block px-4 py-2 text-sm w-full text-left'
                    )}
                  >
                    {languageNames[locale]}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
