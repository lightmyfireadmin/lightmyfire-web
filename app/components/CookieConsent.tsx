
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n, useCurrentLocale } from '@/locales/client';

const COOKIE_CONSENT_KEY = 'cookie_consent';

const CookieConsent = () => {
  const t = useI18n() as any;
  const locale = useCurrentLocale();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (consent === null) {
        
        setShowBanner(true);
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShowBanner(false);
    
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setShowBanner(false);
    
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 w-full bg-background/70 backdrop-blur-sm text-foreground p-4 text-center z-50 flex flex-wrap justify-center items-center gap-4 shadow-lg"
    >
      <p className="m-0 text-sm max-w-md">
        {t('cookie.message', {
          privacyLink: (
            <Link href={`/${locale}/legal/privacy`} className="text-primary underline">
              {t('cookie.privacy_link_text')}
            </Link>
          ),
        })}
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="bg-primary text-primary-foreground border-none px-4 py-2 rounded-md cursor-pointer text-sm hover:opacity-90 transition"
        >
          {t('cookie.accept')}
        </button>
        <button
          onClick={handleDecline}
          className="bg-muted text-muted-foreground border border-border px-4 py-2 rounded-md cursor-pointer text-sm hover:bg-muted/80 transition"
        >
          {t('cookie.decline')}
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
