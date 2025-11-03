'use client';

import React, { useState, Fragment, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, QuestionMarkCircleIcon, HeartIcon, PlusIcon, GlobeAltIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import LogoutButton from './LogoutButton';
import { useCurrentLocale, useI18n } from '@/locales/client';
import Image from 'next/image';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import type { Session } from '@supabase/supabase-js';

// Import the new LanguageSwitcher
import LanguageSwitcher from './LanguageSwitcher';

// Logo component with fade-out halo on mobile
function LogoLink({ href, lang }: { href: string; lang: string }) {
  const [showHalo, setShowHalo] = useState(false);

  const handleClick = () => {
    setShowHalo(true);
    // Auto-fade out after 3 seconds
    const timer = setTimeout(() => {
      setShowHalo(false);
    }, 3000);
    return () => clearTimeout(timer);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`-m-1.5 p-1.5 rounded-lg transition-shadow duration-300 ${
        showHalo ? 'shadow-lg shadow-primary/30' : ''
      }`}
    >
      <Image src="/LOGOLONG.png" alt="LightMyFire" width={150} height={40} />
    </Link>
  );
}

const navigation = [
  { key: 'nav.how_it_works', href: '/legal/faq', icon: QuestionMarkCircleIcon },
  { key: 'nav.save_lighter', href: '/save-lighter', icon: HeartIcon },
  { key: 'nav.our_philosophy', href: '/about', icon: GlobeAltIcon },
  { key: 'nav.refill_guide', href: '/dont-throw-me-away', icon: PlusIcon },
] as const;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header({ session, username }: { session: Session | null; username: string | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLoggedIn = session !== null;
  const lang = useCurrentLocale();
  const t = useI18n();
  const focusTrapRef = useFocusTrap(mobileMenuOpen);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="bg-background border-b border-border shadow-sm sticky top-0 z-50 w-full">
      <nav className="w-full flex items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <LogoLink href={`/${lang}`} lang={lang} />
        </div>
        <div className="flex lg:hidden gap-2">
          <Link
            href={`/${lang}`}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground hover:bg-muted"
            aria-label="Search for lighter"
            title="Find a lighter"
          >
            <span className="sr-only">Search lighter</span>
            <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground hover:bg-muted"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileMenuOpen(true);
            }}
            aria-label="Open mobile menu"
          >
            <span className="sr-only">{t('nav.open_menu')}</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          <Link
            href={`/${lang}`}
            className={classNames(
              pathname === `/${lang}` ? 'text-primary font-semibold' : 'text-foreground hover:text-primary',
              'text-sm leading-6 flex items-center'
            )}
            aria-label="Search lighter"
            title="Find a lighter"
          >
            <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
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
             <Link href={`/${lang}/my-profile`} className={classNames(pathname === `/${lang}/my-profile` ? 'text-primary font-semibold' : 'text-foreground hover:text-primary', 'text-sm leading-6 flex items-center')}>
               <UserIcon className="h-5 w-5 mr-1.5" aria-hidden="true" />
               {username || t('nav.my_profile')}
             </Link>
          )}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:gap-x-4">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <LogoutButton />
          ) : (
            <Link
              href={`/${lang}/login`}
              className="inline-flex justify-center gap-x-1.5 rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted whitespace-nowrap"
            >
              {t('nav.login_signup')}
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dialog */}
      <Transition show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="lg:hidden z-50" onClose={() => setMobileMenuOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 z-40 bg-black/20" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel ref={focusTrapRef} className="fixed inset-y-0 right-0 z-50 w-[calc(100%-36px)] overflow-y-auto bg-background p-6 sm:max-w-sm shadow-lg border-l border-border">
            <div className="flex items-center justify-between">
              <div onClick={() => setMobileMenuOpen(false)}>
                <LogoLink href={`/${lang}`} lang={lang} />
              </div>
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
                    <Link href={`/${lang}/my-profile`} onClick={() => setMobileMenuOpen(false)} className={classNames(pathname === `/${lang}/my-profile` ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted', '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 flex items-center pl-4 gap-x-4')}>
                      <UserIcon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                      {username || t('nav.my_profile')}
                    </Link>
                  )}
                </div>
                <div className="py-6 space-y-3 border-t border-border">
                  <div className="flex justify-end">
                    <LanguageSwitcher />
                  </div>
                  <div>
                    {isLoggedIn ? (
                      <LogoutButton isMobileMenu={true} />
                    ) : (
                      <Link
                        href={`/${lang}/login`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-muted bg-background ring-1 ring-border w-full text-center"
                      >
                        {t('nav.login_signup')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Transition.Child>
        </Dialog>
      </Transition>
    </header>
  );
}