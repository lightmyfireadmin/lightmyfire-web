// app/components/CookieConsent.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link for Next.js routing

const COOKIE_CONSENT_KEY = 'cookie_consent';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check localStorage only on the client side
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (consent === null) {
        // If no consent is found, show the banner
        setShowBanner(true);
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShowBanner(false);
    // You can add logic here to enable analytics scripts or other cookie-dependent features
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setShowBanner(false);
    // You can add logic here to disable analytics scripts or other cookie-dependent features
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 w-full bg-background text-foreground p-4 text-center z-50 flex flex-wrap justify-center items-center gap-4 shadow-lg"
    >
      <p className="m-0 text-sm">
        We use cookies to ensure you get the best experience on our website. By continuing to use this site, you agree to our{' '}
        <Link href="/legal/privacy" className="text-primary underline">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="bg-primary text-primary-foreground border-none px-4 py-2 rounded-md cursor-pointer text-sm hover:opacity-90 transition"
        >
          Accept
        </button>
        <button
          onClick={handleDecline}
          className="bg-muted text-muted-foreground border border-border px-4 py-2 rounded-md cursor-pointer text-sm hover:bg-muted/80 transition"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
