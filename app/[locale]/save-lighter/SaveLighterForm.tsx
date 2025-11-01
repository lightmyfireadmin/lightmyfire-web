'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Assuming lib is at root
import type { User } from '@supabase/supabase-js';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useI18n } from '@/locales/client';

export default function SaveLighterForm({ user }: { user: User }) {
  const router = useRouter();
  const t = useI18n();
  const [lighterName, setLighterName] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [showUsername, setShowUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: rpcError } = await supabase.rpc(
      'create_new_lighter',
      {
        lighter_name: lighterName,
        background_url: backgroundUrl || null,
        show_username: showUsername,
      }
    );

    if (rpcError) {
      setError(t('save_lighter.error.rpc_error', { message: rpcError.message }));
      setLoading(false);
    } else if (data) {
      router.push(`/save-lighter/success/${data}`);
    } else {
      setError(t('save_lighter.error.failed_to_create'));
      setLoading(false);
    }
  };

  return (
    // Applied responsive padding
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg rounded-xl bg-background p-6 sm:p-8 shadow-lg" // Use rounded-xl, shadow-lg
    >
      <h1 className="mb-6 text-center text-3xl font-bold text-foreground">
        {t('save_lighter.form_title')}
      </h1>
      <p className="mb-6 text-muted-foreground">
        {t('save_lighter.form_subtitle')}
      </p>

      <div className="mb-4">
        <label
          htmlFor="lighterName"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {t('save_lighter.lighter_name_label')}
        </label>
        <input
          type="text"
          id="lighterName"
          value={lighterName}
          onChange={(e) => setLighterName(e.target.value)}
          className="w-full rounded-lg border border-input p-3 text-foreground bg-background focus:border-primary focus:ring-primary" // Use rounded-lg
          placeholder={t('save_lighter.lighter_name_placeholder')}
          required
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="backgroundUrl"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          {t('save_lighter.background_url_label')}
        </label>
        <input
          type="url"
          id="backgroundUrl"
          value={backgroundUrl}
          onChange={(e) => setBackgroundUrl(e.target.value)}
          className="w-full rounded-lg border border-input p-3 text-foreground bg-background focus:border-primary focus:ring-primary" // Use rounded-lg
          placeholder={t('save_lighter.background_url_placeholder')}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {t('save_lighter.helper.background_url')}
        </p>
      </div>

      <div className="mb-6 flex items-center">
        <input
          type="checkbox"
          id="showUsername"
          checked={showUsername}
          onChange={(e) => setShowUsername(e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary focus:ring-offset-background" // Added offset
        />
        <label
          htmlFor="showUsername"
          className="ml-2 block text-sm text-foreground"
        >
          {t('save_lighter.show_username_label')}
        </label>
      </div>

      {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>} {/* Smaller error */}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full text-lg py-3 flex justify-center items-center gap-2 hover:shadow-lg transition-shadow duration-200"
      >
        {loading ? (
          <LoadingSpinner size="sm" color="primary-foreground" label={t('save_lighter.button.saving')} />
        ) : (
          <>
            <span>🔥</span>
            <span>{t('save_lighter.button.save_lighter')}</span>
          </>
        )}
      </button>
    </form>
  );
}