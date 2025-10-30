'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useI18n } from '@/locales/client';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function SuccessNotification() {
  const t = useI18n();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let msgKey: string | null = null;
    if (searchParams.get('login_success') === 'true') {
      msgKey = 'notifications.login_success';
    } else if (searchParams.get('post_success') === 'true') {
      msgKey = 'notifications.post_success';
    }

    if (msgKey) {
      // @ts-ignore
      setMessage(t(msgKey));
      setIsVisible(true);

      // Cache l'alerte après 5 secondes
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      // Nettoie le timer si le composant est démonté
      return () => clearTimeout(timer);
    }
  }, [searchParams, t]);

  if (!isVisible || !message) {
    return null;
  }

  return (
    <div className="fixed top-24 right-4 z-50 rounded-lg bg-secondary p-4 shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <CheckCircleIcon
            className="h-6 w-6 text-secondary-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-secondary-foreground">
            {message}
          </p>
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className="inline-flex rounded-md bg-secondary text-secondary-foreground/70 hover:text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => setIsVisible(false)}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
