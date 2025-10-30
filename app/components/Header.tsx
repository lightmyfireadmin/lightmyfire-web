'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import LogoutButton from './LogoutButton';
import { useCurrentLocale } from '@/locales/client'; // Import locale hook
import Image from 'next/image';

const navigation = [
  { name: 'How It Works', href: '/about' },
  { name: 'Refill Guide', href: '/dont-throw-me-away' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type Session = { user: any } | null;

export default function Header({ session }: { session: Session }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLoggedIn = session !== null;
  const lang = useCurrentLocale(); // Get current language

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
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={`/${lang}${item.href}`}
              className={classNames(
                pathname === `/${lang}${item.href}` ? 'text-primary font-semibold' : 'text-foreground hover:text-primary',
                'text-sm leading-6'
              )}
            >
              {item.name}
            </Link>
          ))}
          {isLoggedIn && (
             <>
               <Link href={`/${lang}/save-lighter`} className={classNames(pathname === `/${lang}/save-lighter` ? 'text-primary font-semibold' : 'text-foreground hover:text-primary', 'text-sm leading-6')}>
                 Save a Lighter
               </Link>
               <Link href={`/${lang}/my-profile`} className={classNames(pathname === `/${lang}/my-profile` ? 'text-primary font-semibold' : 'text-foreground hover:text-primary', 'text-sm leading-6')}>
                 My Profile
               </Link>
             </>
          )}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {isLoggedIn ? (
            <LogoutButton />
          ) : (
            <Link
              href={`/${lang}/login`}
              className="btn-primary text-sm" // Use the button class
            >
              Log in / Sign Up
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dialog */}
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href={`/${lang}`} onClick={() => setMobileMenuOpen(false)} className="-m-1.5 p-1.5">
              <Image src="/LOGOLONG.png" alt="LightMyFire" width={150} height={40} />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-foreground hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-border">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={`/${lang}${item.href}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={classNames(
                      pathname === `/${lang}${item.href}` ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted',
                      '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                 {isLoggedIn && (
                    <>
                     <Link href={`/${lang}/save-lighter`} onClick={() => setMobileMenuOpen(false)} className={classNames(pathname === `/${lang}/save-lighter` ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted', '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7')}>
                       Save a Lighter
                     </Link>
                     <Link href={`/${lang}/my-profile`} onClick={() => setMobileMenuOpen(false)} className={classNames(pathname === `/${lang}/my-profile` ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted', '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7')}>
                       My Profile
                     </Link>
                   </>
                 )}
              </div>
              <div className="py-6">
                {isLoggedIn ? (
                  <LogoutButton />
                ) : (
                  <Link
                    href={`/${lang}/login`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                  >
                    Log in / Sign Up
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