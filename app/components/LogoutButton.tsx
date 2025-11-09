'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { useToast } from '@/lib/context/ToastContext';

interface LogoutButtonProps {
  isMobileMenu?: boolean;
}

export default function LogoutButton({ isMobileMenu = false }: LogoutButtonProps) {
  const router = useRouter();
  const locale = useCurrentLocale();
  const t = useI18n() as any;
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return; // Prevent double-click

    setIsLoading(true);
    try {
      await supabase.auth.signOut();

      // Clear all stored data to prevent session leakage
      localStorage.clear();
      sessionStorage.clear();

      addToast({
        type: 'success',
        message: t('notifications.logout_success') || 'See you next time!',
        duration: 2000,
      });
      // Redirect to home page after logout
      window.location.href = `/${locale}`;
    } catch (error) {
      console.error('Logout error:', error);
      addToast({
        type: 'error',
        message: t('notifications.logout_failed') || 'Logout failed. Please try again.',
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`${
        isMobileMenu
          ? 'block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-muted bg-background ring-1 ring-border w-full text-center'
          : 'inline-flex justify-center gap-x-1.5 rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted whitespace-nowrap'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('nav.logging_out') || 'Logging out...'}
        </span>
      ) : (
        t('nav.logout')
      )}
    </button>
  );
}