'use client';

import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useI18n, useCurrentLocale } from '@/locales/client';
import Link from 'next/link';
import { getAuthCallbackUrl } from '@/lib/url-helpers';
import { logger } from '@/lib/logger';

export default function LoginClient() {
  const router = useRouter();
  const t = useI18n() as any;
  const locale = useCurrentLocale();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.log('[LoginClient] Auth event:', event);

      if (event === 'SIGNED_IN' && session && !hasRedirectedRef.current) {
        logger.event('user_signed_in', { userId: session.user.id, email: session.user.email });
        hasRedirectedRef.current = true;
        setIsRedirecting(true);

        // Use a more reliable redirect mechanism
        try {
          // Ensure session is properly set before redirecting
          await new Promise(resolve => setTimeout(resolve, 500));
          window.location.href = `/${locale}?login_success=true`;
        } catch (error) {
          console.error('[LoginClient] Redirect error:', error);
          hasRedirectedRef.current = false;
          setIsRedirecting(false);
        }
      }

      if (event === 'SIGNED_OUT') {
        hasRedirectedRef.current = false;
        setIsRedirecting(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [locale]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-background p-6 sm:p-8 shadow-lg border border-border">
          <h1 className="mb-6 text-center text-3xl font-bold text-foreground">
            LightMyFire
          </h1>

          {isRedirecting && (
            <div className="mb-4 rounded-md bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 text-blue-400 mr-3"
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
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t('auth.signing_in')}
                </p>
              </div>
            </div>
          )}

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(255, 107, 107)',
                    brandAccent: 'rgb(255, 87, 87)',
                  },
                },
              },
            }}
            theme="light"
            providers={['google']}
            redirectTo={getAuthCallbackUrl(locale)}
            localization={{
              variables: {
                sign_in: {
                  email_label: t('auth.email_label'),
                  password_label: t('auth.password_label'),
                  email_input_placeholder: t('auth.email_placeholder'),
                  password_input_placeholder: t('auth.password_placeholder'),
                  button_label: t('auth.sign_in'),
                  loading_button_label: t('auth.signing_in'),
                  social_provider_text: t('auth.continue_with'),
                  link_text: t('auth.already_have_account'),
                },
                sign_up: {
                  email_label: t('auth.email_label'),
                  password_label: t('auth.password_label'),
                  email_input_placeholder: t('auth.email_placeholder'),
                  password_input_placeholder: t('auth.password_placeholder'),
                  button_label: t('auth.sign_up'),
                  loading_button_label: t('auth.signing_up'),
                  social_provider_text: t('auth.continue_with'),
                  link_text: t('auth.dont_have_account'),
                },
              },
            }}
          />

          {}
          <div className="mt-4 text-center">
            <Link
              href={`/${locale}/forgot-password`}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              {t('auth.forgot_password')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
