'use client';

import React, { useState, Fragment, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, QuestionMarkCircleIcon, HeartIcon, PlusIcon, GlobeAltIcon, UserIcon } from '@heroicons/react/24/outline';
import LogoutButton from './LogoutButton';
import { useCurrentLocale, useI18n } from '@/locales/client';
import Image from 'next/image';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';

// Import the new LanguageSwitcher
import LanguageSwitcher from './LanguageSwitcher';

const navigation = [
  { key: 'nav.how_it_works', href: '/legal/faq', icon: QuestionMarkCircleIcon },
  { key: 'nav.refill_guide', href: '/dont-throw-me-away', icon: PlusIcon },
  { key: 'nav.our_philosophy', href: '/about', icon: GlobeAltIcon },
] as const;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type Session = { user: any } | null;

export default function Header({ session }: { session: Session }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLoggedIn = session !== null;
  const lang = useCurrentLocale();
  const t = useI18n();
  const focusTrapRef = useFocusTrap(mobileMenuOpen);

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [pathname, mobileMenuOpen]);

  return (
    <header className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href={`/${lang}`} className="-m-1.5 p-1.5">
            <Image src="/LOGOLONG.png" alt="LightMyFire" width={150} height={40} />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground hover:bg-muted"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">{t('nav.open_menu')}</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.key}
              href={`/${lang}${item.href}`}
              className={classNames(
                pathname === `/${lang}${item.href}` ? 'text-primary font-semibold' : 'text-foreground hover:text-primary',
                'text-sm leading-6 flex items-center'
              )}
            >
              <item.icon className="h-5 w-5 mr-1.5" aria-hidden="true" />
              {t(item.key)}
            </Link>
          ))}
          {isLoggedIn && (
             <>
               <Link href={`/${lang}/save-lighter`} className={classNames(pathname === `/${lang}/save-lighter` ? 'text-primary font-semibold' : 'text-foreground hover:text-primary', 'text-sm leading-6 flex items-center')}>
                 <HeartIcon className="h-5 w-5 mr-1.5" aria-hidden="true" />
                 {t('nav.save_lighter')}
               </Link>
               <Link href={`/${lang}/my-profile`} className={classNames(pathname === `/${lang}/my-profile` ? 'text-primary font-semibold' : 'text-foreground hover:text-primary', 'text-sm leading-6 flex items-center')}>
                 <UserIcon className="h-5 w-5 mr-1.5" aria-hidden="true" />
                 {t('nav.my_profile')}
               </Link>
             </>
          )}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-x-4">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <LogoutButton />
          ) : (
            <Link
              href={`/${lang}/login`}
              className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted"
            >
              {t('nav.login_signup')}
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dialog */}
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-50" />
        </Transition.Child>
        {/* FIXED SECTION: Props are now on the Transition.Child tag */}
        <Transition.Child
          as={Fragment}
          enter="transition ease-in-out duration-300 transform"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          {/* FIXED SECTION: Corrected typo "i@nset-y-0" to "inset-y-0" */}
          <Dialog.Panel ref={focusTrapRef} className="fixed inset-y-0 right-0 z-50 w-[calc(100%-36px)] overflow-y-auto bg-background p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href={`/${lang}`} onClick={() => setMobileMenuOpen(false)} className="-m-1.5 p-1.5">
                <Image src="/LOGOLONG.png" alt="LightMyFire" width={150} height={40} />
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">{t('nav.close_menu')}</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-border">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.key}
                      href={`/${lang}${item.href}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={classNames(
                        pathname === `/${lang}${item.href}` ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted',
                        '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 flex items-center pl-4 gap-x-4'
                      )}
                    >
                      <item.icon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                      {t(item.key)}
                    </Link>
                  ))}
                  {isLoggedIn && (
                      <>
                        <Link
                          href={`/${lang}/save-lighter`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={classNames(pathname === `/${lang}/save-lighter` ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted', '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 flex items-center pl-4 gap-x-4')}
                        >
                          <HeartIcon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                          {t('nav.save_lighter')}
                        </Link>
                      <Link href={`/${lang}/my-profile`} onClick={() => setMobileMenuOpen(false)} className={classNames(pathname === `/${lang}/my-profile` ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted', '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 flex items-center pl-4 gap-x-4')}>
                        <UserIcon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                        {t('nav.my_profile')}
                      </Link>
                    </>
                  )}
                </div>
                <div className="py-6 space-y-4">
                  <LanguageSwitcher />
                  {isLoggedIn ? (
                    <LogoutButton />
                  ) : (
                    <Link
                      href={`/${lang}/login`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                    >
                      {t('nav.login_signup')}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Transition.Child> {/* This now correctly closes the Transition.Child */}
      </Dialog>
    </header>
  );
}