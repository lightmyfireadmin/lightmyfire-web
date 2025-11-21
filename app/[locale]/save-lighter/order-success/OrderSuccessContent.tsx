'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, EnvelopeIcon, FireIcon } from '@heroicons/react/24/outline';
import ContactFormModal from '@/app/components/ContactFormModal';

export default function OrderSuccessContent() {
  // Using unknown cast because useI18n type inference might be tricky here without deeper changes
  const t = useI18n() as unknown as (key: string, params?: Record<string, string | number>) => string;
  const locale = useCurrentLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email');
  const lighterCount = searchParams.get('count');
  const [showConfetti, setShowConfetti] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    
    if (!email || !lighterCount) {
      router.push(`/${locale}/save-lighter`);
    }
  }, [email, lighterCount, locale, router]);

  if (!email || !lighterCount) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {}
        <div className="bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
          {}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CheckCircleIcon className="h-24 w-24 text-white animate-bounce" />
                {showConfetti && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl animate-ping">🎉</span>
                  </div>
                )}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t('order.success.title')}
            </h1>
            <p className="text-white/90 text-lg">
              {t('order.success.subtitle')}
            </p>
          </div>

          {}
          <div className="p-8 space-y-6">
            {}
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <EnvelopeIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2 text-lg">
                    {t('order.success.confirmation_sent')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('order.success.confirmation_description')}
                  </p>
                  <p className="font-mono text-sm md:text-base font-semibold text-gray-900 bg-white px-4 py-3 md:py-2 rounded border border-gray-300 break-all">
                    {email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {t('order.success.check_spam')}
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FireIcon className="h-5 w-5 text-primary" />
                {t('order.success.your_lighters')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('order.success.lighters_created')}</span>
                  <span className="font-bold text-primary text-xl">{lighterCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('order.success.status')}</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 md:dark:bg-green-900/30 md:dark:text-green-200 text-sm font-medium">
                    {t('order.success.status_processing')}
                  </span>
                </div>
              </div>
            </div>

            {}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-3">{t('order.success.what_happens_next')}</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold text-primary">1.</span>
                  <span>{t('order.success.step1')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold text-primary">2.</span>
                  <span>{t('order.success.step2')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold text-primary">3.</span>
                  <span>{t('order.success.step3')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold text-primary">4.</span>
                  <span>{t('order.success.step4')}</span>
                </li>
              </ol>
            </div>

            {}
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-3">{t('order.success.lighters_ready')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('order.success.lighters_ready_description', { count: lighterCount })}
              </p>
              <Link
                href={`/${locale}/my-profile`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors"
              >
                <FireIcon className="h-5 w-5" />
                {t('order.success.view_lighters')}
              </Link>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Link
                href={`/${locale}`}
                className="px-6 py-3 border border-border rounded-md text-center font-semibold text-foreground hover:bg-muted transition-colors"
              >
                {t('order.success.back_home')}
              </Link>
              <Link
                href={`/${locale}/my-profile`}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md text-center font-semibold hover:bg-primary/90 transition-colors"
              >
                {t('order.success.view_profile')}
              </Link>
            </div>
          </div>
        </div>

        {}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            {t('order.success.questions')}{' '}
            <button
              onClick={() => setShowContactModal(true)}
              className="text-primary hover:underline font-semibold"
            >
              {t('order.success.contact_us')}
            </button>
          </p>
        </div>
      </div>

      {}
      <ContactFormModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        subject="Question about my sticker order"
        context="general"
      />
    </div>
  );
}
