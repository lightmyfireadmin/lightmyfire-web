'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/context/ToastContext';
import { useI18n, useCurrentLocale } from '@/locales/client';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getPasswordResetUrl } from '@/lib/url-helpers';

const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();
  const t = useI18n() as any;
  const locale = useCurrentLocale();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      addToast({ message: t('auth.email_required'), type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getPasswordResetUrl(locale),
      });

      if (error) throw error;

      setSent(true);
      addToast({ message: t('auth.reset_email_sent'), type: 'success' });
    } catch (error: any) {
      console.error('Password reset error:', error);
      addToast({ message: error.message || t('auth.reset_failed'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-background p-6 sm:p-8 shadow-lg border border-border">
          {}
          <div className="mb-6">
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('auth.back_to_login')}
            </Link>
            <h1 className="text-center text-3xl font-bold text-foreground">
              {t('auth.forgot_password_title')}
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {t('auth.forgot_password_subtitle')}
            </p>
          </div>

          {sent ? (
            
            <div className="rounded-md bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    {t('auth.reset_email_sent_title')}
                  </h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <p>{t('auth.reset_email_sent_description')}</p>
                    <p className="mt-2 font-mono text-xs">{email}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setSent(false);
                        setEmail('');
                      }}
                      className="text-sm font-medium text-green-700 dark:text-green-300 hover:text-green-600 dark:hover:text-green-200"
                    >
                      {t('auth.send_to_different_email')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  {t('auth.email_label')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.email_placeholder')}
                  required
                  disabled={loading}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t('auth.sending')}
                  </>
                ) : (
                  t('auth.send_reset_link')
                )}
              </button>
            </form>
          )}

          {}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">
                {t('auth.or')}
              </span>
            </div>
          </div>

          {}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t('auth.remember_password')} </span>
            <Link
              href={`/${locale}/login`}
              className="font-medium text-primary hover:text-primary/80"
            >
              {t('auth.sign_in')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
