'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCurrentLocale, useI18n } from '@/locales/client';

interface WelcomeBannerProps {
  isLoggedIn: boolean;
  username?: string | null;
}

export default function WelcomeBanner({ isLoggedIn, username }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const lang = useCurrentLocale();
  const t = useI18n();

  
  const shouldHideBanner = pathname.includes('/my-profile') ||
                           pathname.includes('/login') ||
                           pathname.includes('/signup');

  useEffect(() => {
    
    const bannerClosed = sessionStorage.getItem('welcome-banner-closed');
    if (!bannerClosed && !shouldHideBanner) {
      setIsVisible(true);
    }
  }, [shouldHideBanner]);

  const handleClose = () => {
    setIsVisible(false);
    
    sessionStorage.setItem('welcome-banner-closed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="sticky top-0 z-40 bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex-1 flex items-center justify-center gap-2 text-center sm:text-left pr-2">
          {isLoggedIn ? (
            <p className="text-xs sm:text-sm font-bold line-clamp-2 sm:line-clamp-1">
              👋 {t('banner.welcome')} {username || t('banner.user')}!
            </p>
          ) : (
            <p className="text-xs sm:text-sm font-bold line-clamp-2 sm:line-clamp-1">
              🔥 {t('banner.connect_cta')}{' '}
              <Link
                href={`/${lang}/login`}
                className="underline hover:text-primary-foreground transition-colors whitespace-nowrap"
              >
                {t('banner.connect_link')}
              </Link>
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors self-start sm:self-center"
          aria-label={t('banner.close')}
        >
          <XMarkIcon className="h-5 w-5 sm:h-4 sm:w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
