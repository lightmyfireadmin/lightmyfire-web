'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useI18n } from '@/locales/client';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

type NotificationType = 'success' | 'error' | 'warning';

interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  icon: typeof CheckCircleIcon;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
}

export default function AuthNotification() {
  const t = useI18n() as any;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notification, setNotification] = useState<NotificationConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let config: NotificationConfig | null = null;

    // Check URL parameters for auth events
    if (searchParams.get('signup_success') === 'true') {
      config = {
        type: 'success',
        title: t('notifications.success'),
        message: t('notifications.signup_success'),
        icon: CheckCircleIcon,
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        textColor: 'text-green-900 dark:text-green-100',
      };
    } else if (searchParams.get('login_success') === 'true') {
      config = {
        type: 'success',
        title: t('notifications.success'),
        message: t('notifications.login_success'),
        icon: CheckCircleIcon,
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        textColor: 'text-green-900 dark:text-green-100',
      };
    } else if (searchParams.get('logout_success') === 'true') {
      config = {
        type: 'success',
        title: t('notifications.success'),
        message: t('notifications.logout_success'),
        icon: CheckCircleIcon,
        bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-400',
        textColor: 'text-blue-900 dark:text-blue-100',
      };
    } else if (searchParams.get('password_reset') === 'true') {
      config = {
        type: 'success',
        title: t('notifications.success'),
        message: t('notifications.password_reset_sent'),
        icon: CheckCircleIcon,
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        textColor: 'text-green-900 dark:text-green-100',
      };
    } else if (searchParams.get('password_updated') === 'true') {
      config = {
        type: 'success',
        title: t('notifications.success'),
        message: t('notifications.password_updated'),
        icon: CheckCircleIcon,
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        textColor: 'text-green-900 dark:text-green-100',
      };
    } else if (searchParams.get('error') === 'auth_failed') {
      config = {
        type: 'error',
        title: t('notifications.error'),
        message: t('notifications.auth_failed'),
        icon: XCircleIcon,
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        textColor: 'text-red-900 dark:text-red-100',
      };
    } else if (searchParams.get('error') === 'invalid_credentials') {
      config = {
        type: 'error',
        title: t('notifications.error'),
        message: t('notifications.invalid_credentials'),
        icon: XCircleIcon,
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        textColor: 'text-red-900 dark:text-red-100',
      };
    } else if (searchParams.get('error') === 'user_not_found') {
      config = {
        type: 'error',
        title: t('notifications.error'),
        message: t('notifications.user_not_found'),
        icon: XCircleIcon,
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        textColor: 'text-red-900 dark:text-red-100',
      };
    } else if (searchParams.get('error') === 'session_expired') {
      config = {
        type: 'warning',
        title: t('notifications.warning'),
        message: t('notifications.session_expired'),
        icon: ExclamationTriangleIcon,
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        textColor: 'text-yellow-900 dark:text-yellow-100',
      };
    }

    if (config) {
      setNotification(config);
      setIsVisible(true);

      // Animate in
      setTimeout(() => setIsAnimating(true), 10);

      // Auto-hide after 6 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, t]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      setNotification(null);

      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('signup_success');
      url.searchParams.delete('login_success');
      url.searchParams.delete('logout_success');
      url.searchParams.delete('password_reset');
      url.searchParams.delete('password_updated');
      url.searchParams.delete('error');

      // Use replace to avoid adding to history
      router.replace(url.pathname + url.search, { scroll: false });
    }, 300);
  };

  if (!isVisible || !notification) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-8 pointer-events-none">
      {/* Notification Box */}
      <div
        className={`
          relative w-full max-w-md pointer-events-auto
          rounded-xl shadow-2xl border-2
          ${notification.bgColor} ${notification.borderColor}
          transform transition-all duration-300 ease-out
          ${isAnimating
            ? 'translate-y-0 opacity-100 scale-100'
            : '-translate-y-4 opacity-0 scale-95'
          }
        `}
        style={{ marginTop: '80px' }} // Space from top nav
      >
        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 ${notification.iconColor}`}>
              <notification.icon className="h-7 w-7" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold ${notification.textColor} mb-1`}>
                {notification.title}
              </h3>
              <p className={`text-sm ${notification.textColor} opacity-90 leading-relaxed`}>
                {notification.message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className={`
                flex-shrink-0 p-1.5 rounded-lg
                ${notification.textColor} opacity-60 hover:opacity-100
                hover:bg-black/5 dark:hover:bg-white/5
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${notification.type === 'success' ? 'focus:ring-green-500' : ''}
                ${notification.type === 'error' ? 'focus:ring-red-500' : ''}
                ${notification.type === 'warning' ? 'focus:ring-yellow-500' : ''}
              `}
              aria-label="Close notification"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-black/5 dark:bg-white/5 overflow-hidden rounded-b-xl">
          <div
            className={`h-full ${notification.iconColor} bg-current opacity-40`}
            style={{
              animation: isAnimating ? 'shrink 6s linear forwards' : 'none',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
