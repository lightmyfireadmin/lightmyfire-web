'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/context/ToastContext';
import { useI18n, useCurrentLocale } from '@/locales/client';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();
  const t = useI18n() as any;
  const locale = useCurrentLocale();

  useEffect(() => {
    // Check if we have a valid recovery token
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidToken(true);
      } else {
        // Invalid or expired token
        addToast({ message: t('auth.invalid_reset_link'), type: 'error' });
        router.push(`/${locale}/forgot-password`);
      }
    });
  }, [router, locale, addToast, t]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast({ message: t('auth.passwords_dont_match'), type: 'error' });
      return;
    }

    if (password.length < 6) {
      addToast({ message: t('auth.password_too_short'), type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      addToast({ message: t('auth.password_updated'), type: 'success' });

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push(`/${locale}`);
      }, 2000);
    } catch (error: any) {
      console.error('Password update error:', error);
      addToast({ message: error.message || t('auth.password_update_failed'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl bg-background p-6 sm:p-8 shadow-lg border border-border">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground animate-spin"
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
              <p className="mt-4 text-muted-foreground">{t('auth.verifying_reset_link')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-background p-6 sm:p-8 shadow-lg border border-border">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-center text-3xl font-bold text-foreground">
              {t('auth.reset_password_title')}
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {t('auth.reset_password_subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t('auth.new_password_label')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t('auth.confirm_password_label')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirm_password_placeholder')}
                  required
                  minLength={6}
                  disabled={loading}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">{t('auth.password_requirements')}</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li className={password.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}>
                  {t('auth.min_6_characters')}
                </li>
                <li className={password === confirmPassword && password ? 'text-green-600 dark:text-green-400' : ''}>
                  {t('auth.passwords_match')}
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || password !== confirmPassword || password.length < 6}
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
                  {t('auth.updating_password')}
                </>
              ) : (
                t('auth.update_password')
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            <Link
              href={`/${locale}/login`}
              className="font-medium text-primary hover:text-primary/80"
            >
              {t('auth.back_to_login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
