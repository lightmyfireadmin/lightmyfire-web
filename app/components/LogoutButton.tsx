'use client';

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`${
        isMobileMenu
          ? 'block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-muted bg-background ring-1 ring-border w-full text-center'
          : 'inline-flex justify-center gap-x-1.5 rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted whitespace-nowrap'
      }`}
    >
      {t('nav.logout')}
    </button>
  );
}