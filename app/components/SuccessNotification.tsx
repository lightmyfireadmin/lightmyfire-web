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
    if (searchParams.get('login_success') === 'true') {
      msgKey = 'notifications.login_success';
    } else if (searchParams.get('post_success') === 'true') {
      msgKey = 'notifications.post_success';
    } else if (typeof window !== 'undefined' && sessionStorage.getItem('showLoginNotification') === 'true') {
      // Check for login notification flag from login page redirect
      msgKey = 'notifications.login_success';
      sessionStorage.removeItem('showLoginNotification'); // Clear the flag
    }

    if (msgKey) {
      const notificationMessage = t(msgKey);
      // Use Toast system for newer notifications, fallback to old notification for compatibility
      addToast({
        type: 'success',
        message: notificationMessage,
        duration: 3000,
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
