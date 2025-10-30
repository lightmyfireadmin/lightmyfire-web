'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
// These imports are now correct, pointing to your local client file
import { useCurrentLocale, useChangeLocale } from '@/locales/client'; 
import { i18n } from '@/locales/config';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Includes German and Spanish
const languageNames: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
};

export default function LanguageSwitcher() {
  const currentLocale = useCurrentLocale();
  const changeLocale = useChangeLocale(); // This will now work correctly

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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {i18n.locales.map((locale) => (
              <Menu.Item key={locale}>
                {({ active }) => (
                  <button
                    onClick={() => changeLocale(locale)}
                    className={classNames(
                      active ? 'bg-muted text-foreground' : 'text-muted-foreground',
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
