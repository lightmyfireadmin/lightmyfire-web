'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useI18n } from '@/locales/client';
import { useCurrentLocale } from '@/locales/client';
import Link from 'next/link';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function SignupWelcomeModal() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show modal only on signup_success
    if (searchParams.get('signup_success') === 'true') {
      setIsVisible(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-lg shadow-lg max-w-sm w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-primary text-white px-6 py-4 flex items-center justify-between border-b border-border">
          <h2 className="text-xl font-bold">
            🎉 {t('signup_welcome.title') || 'Welcome to LightMyFire!'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label={t('signup_welcome.close') || 'Close'}
          >
            <XMarkIcon className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <p className="text-foreground text-sm leading-relaxed">
            {t('signup_welcome.subtitle') || 'Thank you for joining our community! Here are a few things you can do:'}
          </p>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground text-sm">
              {t('signup_welcome.quick_actions') || 'Quick Start:'}
            </h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="text-primary flex-shrink-0 mt-0.5">✨</span>
                <span>{t('signup_welcome.action_lighter') || 'Save a lighter and start collecting stories'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary flex-shrink-0 mt-0.5">🔍</span>
                <span>{t('signup_welcome.action_find') || 'Find a lighter and add to its journey'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary flex-shrink-0 mt-0.5">👥</span>
                <span>{t('signup_welcome.action_community') || 'Connect with other LightSavers worldwide'}</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href={`/${locale}/save-a-lighter`}
              className="block text-center px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm"
              onClick={handleClose}
            >
              {t('signup_welcome.cta_lighter') || 'Save Your First Lighter'}
            </Link>
            <button
              onClick={handleClose}
              className="px-4 py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold text-sm"
            >
              {t('signup_welcome.cta_explore') || 'Explore the Community'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
