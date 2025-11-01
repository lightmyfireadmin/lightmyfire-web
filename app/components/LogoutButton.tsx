'use client';

import { supabase } from '@/lib/supabase'; // Assuming lib is at root
import { useRouter } from 'next/navigation';
import { useI18n } from '@/locales/client';
import { useToast } from '@/lib/context/ToastContext';

export default function LogoutButton() {
  const router = useRouter();
  const t = useI18n();
  const { addToast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    addToast({
      type: 'success',
      message: t('notifications.logout_success') || 'See you next time!',
      duration: 2000,
    });
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex justify-center gap-x-1.5 rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted whitespace-nowrap"
    >
      {t('nav.logout')}
    </button>
  );
}