'use client';

import { Fragment, useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Transition, Portal } from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useCurrentLocale } from '@/locales/client';
import { i18n } from '@/locales/config';
import { languageNames } from '@/locales/languages';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function LanguageSwitcher() {
  const currentLocale = useCurrentLocale();
  const router = useRouter();
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuStyle, setMenuStyle] = useState({});

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        top: `${rect.bottom}px`,
        right: `${window.innerWidth - rect.right}px`,
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    // Replace the current locale in the pathname with the new one
    // segments[0] is empty (before the first /), segments[1] is the locale
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/');

    // Push to the new pathname, preserving the current page
    router.push(newPathname);
  };

  return (
    <Menu as="div" className="relative inline-block text-left z-50">
      <div>
        <Menu.Button 
          ref={buttonRef}
          onClick={updatePosition}
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted whitespace-nowrap">
          <GlobeAltIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          {languageNames[currentLocale as keyof typeof languageNames]?.nativeName || currentLocale}
        </Menu.Button>
      </div>

      <Portal>
        <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items 
          style={menuStyle}
          className="fixed z-60 mt-2 max-h-96 overflow-y-auto w-48 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                    {languageNames[locale as keyof typeof languageNames]?.nativeName || locale}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
              </Transition>
            </Portal>    </Menu>
  );
}
