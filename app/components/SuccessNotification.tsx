'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useI18n } from '@/locales/client';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useToast } from '@/lib/context/ToastContext';

// Define a type for the keys we expect to use here.
// This makes the code type-safe and removes the need for @ts-ignore.
type SuccessMessageKey = 'notifications.login_success' | 'notifications.logout_success' | 'notifications.signup_success' | 'notifications.post_success';

export default function SuccessNotification() {
  const t = useI18n();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let msgKey: SuccessMessageKey | null = null;
    if (searchParams.get('signup_success') === 'true') {
      msgKey = 'notifications.signup_success';
    } else if (searchParams.get('login_success') === 'true') {
      msgKey = 'notifications.login_success';
    } else if (searchParams.get('post_success') === 'true') {
      msgKey = 'notifications.post_success';
    } else if (typeof window !== 'undefined' && sessionStorage.getItem('showLoginNotification') === 'true') {
      // Check for login notification flag from login page redirect (deprecated, use query params instead)
      msgKey = 'notifications.login_success';
      sessionStorage.removeItem('showLoginNotification'); // Clear the flag
    }

    if (msgKey) {
      const notificationMessage = t(msgKey);
      // Use Toast system for newer notifications
      addToast({
        type: 'success',
        message: notificationMessage,
        duration: 4000,
      });

      // Also keep the old notification behavior for compatibility
      setMessage(notificationMessage);
      setIsVisible(true);

      // Hide the old notification after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      // Clean up timer on unmount
      return () => clearTimeout(timer);
    }
  }, [searchParams, t, addToast]);

  if (!isVisible || !message) {
    return null;
  }

  return (
    <div className="fixed top-20 sm:top-24 right-2 sm:right-4 left-2 sm:left-auto z-40 rounded-lg bg-secondary p-4 shadow-lg ring-1 ring-black ring-opacity-5 max-w-sm animate-slide-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <CheckCircleIcon
            className="h-5 w-5 sm:h-6 sm:w-6 text-secondary-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-secondary-foreground break-words">
            {message}
          </p>
        </div>
        <button
          type="button"
          className="flex-shrink-0 p-1 rounded hover:bg-secondary-foreground/10 transition-colors text-secondary-foreground/70 hover:text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => setIsVisible(false)}
          aria-label="Close notification"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
