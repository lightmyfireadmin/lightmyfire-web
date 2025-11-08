'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FlagIcon } from '@heroicons/react/24/outline';
import ConfirmModal from './ConfirmModal';
import { useI18n } from '@/locales/client';

export default function FlagButton({
  postId,
  isLoggedIn,
}: {
  postId: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const t = useI18n() as any;
  const [isFlagged, setIsFlagged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    if (!isLoggedIn) {
      router.push('/login?message=' + t('auth.login_to_flag'));
      return;
    }
    if (isFlagged || isLoading) {
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmFlag = async () => {
    setIsLoading(true);
    const { error } = await supabase.rpc('flag_post', {
      post_to_flag_id: postId,
    });

    if (!error) {
      setIsFlagged(true);
    } else {
      alert(t('flag.error_flagging'));
      setIsLoading(false);
    }
  };

  if (isFlagged) {
    return (
      <span className="flex items-center space-x-1 text-sm text-muted-foreground">
        <FlagIcon className="h-5 w-5" aria-hidden="true" />
        <span>{t('flag.flagged')}</span>
      </span>
    );
  }

  return (
    <>
      <button
        onClick={openModal}
        disabled={isLoading}
        className="flex items-center space-x-1 text-sm text-muted-foreground transition hover:text-red-600 disabled:opacity-50"
      >
        <FlagIcon className="h-5 w-5" aria-hidden="true" />
        <span>{t('flag.flag')}</span>
      </button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmFlag}
        title={t('flag.confirm_title')}
        message={t('flag.confirm_message')}
      />
    </>
  );
}
