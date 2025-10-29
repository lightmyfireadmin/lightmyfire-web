'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
// Import LogoutButton from the same components folder
import LogoutButton from './LogoutButton';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n } from '@/locales/client';

const navigation = [
  { nameKey: 'nav.how_it_works', href: '/about' },
  { nameKey: 'nav.refill_guide', href: '/dont-throw-me-away' },
] as const;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type Session = { user: any } | null;

export default function Header({ session }: { session: Session }) {
  const t = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLoggedIn = session !== null;

  return (
    <header className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">LightMyFire</span>
            <Image src="/LOGOLONG.png" alt="LightMyFire Logo" width={150} height={40} className="h-10 w-auto" />
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
              key={item.nameKey}
              href={item.href}
              className={classNames(
                pathname === item.href ? 'text-primary font-semibold' : 'text-foreground hover:text-primary',
                'text-sm leading-6'
              )}
            >
              {t(item.nameKey)}
            </Link>
          ))}
          {isLoggedIn && (
             <>
               <Link href="/save-lighter" className={classNames(pathname === '/save-lighter' ? 'text-primary font-semibold' : 'text-foreground hover:text-primary', 'text-sm leading-6')}>
                 {t('nav.save_lighter')}
               </Link>
               <Link href="/my-profile" className={classNames(pathname === '/my-profile' ? 'text-primary font-semibold' : 'text-foreground hover:text-primary', 'text-sm leading-6')}>
                 {t('nav.my_profile')}
               </Link>
             </>
          )}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-x-4">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="btn-primary text-sm" // Use the button class
            >
              {t('nav.login_signup')}
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dialog */}
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">LightMyFire</span>
              <Image src="/LOGOLONG.png" alt="LightMyFire Logo" width={150} height={40} className="h-10 w-auto" />
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
                    key={item.nameKey}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={classNames(
                      pathname === item.href ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted',
                      '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7'
                    )}
                  >
                    {t(item.nameKey)}
                  </Link>
                ))}
                 {isLoggedIn && (
                    <>
                     <Link href="/save-lighter" onClick={() => setMobileMenuOpen(false)} className={classNames(pathname === '/save-lighter' ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted', '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7')}>
                       {t('nav.save_lighter')}
                     </Link>
                     <Link href="/my-profile" onClick={() => setMobileMenuOpen(false)} className={classNames(pathname === '/my-profile' ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted', '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7')}>
                       {t('nav.my_profile')}
                     </Link>
                   </>
                 )}
              </div>
              <div className="py-6">
                <LanguageSwitcher />
                {isLoggedIn ? (
                  <LogoutButton />
                ) : (
                  <Link
                    href="/login"
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
      </Dialog>
    </header>
  );
}