'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import type { User } from '@supabase/supabase-js';
import { useI18n } from '@/locales/client';

export default function UpdateAuthForm() {
  const t = useI18n() as any;
  const [user, setUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  
  const isOAuthUser = user?.app_metadata?.provider && user.app_metadata.provider !== 'email';

  useEffect(() => {
    
    let isMounted = true;

    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted) {
        setUser(user);
      }
    };

    getCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError(t('settings.auth.error.passwords_no_match'));
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail || undefined,
      password: newPassword || undefined,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage(t('settings.auth.success_message'));
      setNewEmail('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  if (isOAuthUser) {
    const provider = user?.app_metadata?.provider === 'google' ? 'Google' : user?.app_metadata?.provider || 'external provider';

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t('settings.auth.title')}</h3>
        <div className="rounded-md bg-blue-50 p-4 mb-4">
          <p className="text-sm text-blue-800">
            {t('settings.auth.oauth_notice', { provider })}
          </p>
        </div>

        <div>
          <label htmlFor="current-email" className="block text-sm font-medium text-muted-foreground">
            {t('settings.auth.current_email')}
          </label>
          <input
            type="email"
            id="current-email"
            value={user?.email || ''}
            disabled
            className="mt-1 block w-full rounded-lg border-input bg-muted p-3 text-muted-foreground cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {t('settings.auth.email_managed_by', { provider })}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {t('settings.auth.change_via_provider', {
            providerLink: (
              <a
                href={user?.app_metadata?.provider === 'google' ? 'https://myaccount.google.com' : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                {user?.app_metadata?.provider === 'google' ? t('settings.auth.provider_link_google') : t('settings.auth.provider_link_generic')}
              </a>
            ),
          })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleUpdateAuth} className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{t('settings.auth.update_title')}</h3>
      <div>
        <label htmlFor="new-email" className="block text-sm font-medium text-muted-foreground">
          {t('settings.auth.new_email_label')}
        </label>
        <input
          type="email"
          id="new-email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border-input bg-background p-3 text-foreground focus:border-primary focus:ring-primary"
          placeholder={t('settings.auth.new_email_placeholder')}
        />
      </div>
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-muted-foreground">
          {t('settings.auth.new_password_label')}
        </label>
        <input
          type="password"
          id="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 block w-full rounded-lg border-input bg-background p-3 text-foreground focus:border-primary focus:ring-primary"
          placeholder={t('settings.auth.new_password_placeholder')}
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-muted-foreground">
          {t('settings.auth.confirm_password_label')}
        </label>
        <input
          type="password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full rounded-lg border-input bg-background p-3 text-foreground focus:border-primary focus:ring-primary"
          placeholder={t('settings.auth.confirm_password_placeholder')}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-secondary flex justify-center items-center gap-2 py-2 hover:shadow-md transition-shadow duration-200"
      >
        {loading ? (
          <LoadingSpinner size="sm" color="foreground" label={t('settings.auth.saving')} />
        ) : (
          <>
            <span>🔐</span>
            <span>{t('settings.auth.update_button')}</span>
          </>
        )}
      </button>
      {message && <p className="text-sm text-green-500">{message}</p>}
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  );
}
