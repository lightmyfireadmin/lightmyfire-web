'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { countries } from '@/lib/countries';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useI18n } from '@/locales/client';

interface Profile {
  username: string;
  nationality: string | null;
  show_nationality: boolean;
}

export default function EditProfileForm({ user, profile }: { user: User; profile: Profile }) {
  const t = useI18n() as any;
  const [username, setUsername] = useState(profile.username);
  const [nationality, setNationality] = useState(profile.nationality || '');
  const [showNationality, setShowNationality] = useState(profile.show_nationality);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      setMessage('Username cannot be empty.');
      return;
    }
    setLoading(true);
    setMessage('');
    const { error } = await supabase
      .from('profiles')
      .update({ 
        username: username,
        nationality: nationality,
        show_nationality: showNationality,
      })
      .eq('id', user.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Profile updated successfully!');
      
      
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-muted-foreground">
          {t('settings.profile.username_label')}
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full rounded-lg border-input bg-background p-3 text-foreground focus:border-primary focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="nationality" className="block text-sm font-medium text-muted-foreground">
          {t('settings.profile.nationality_label')} <span className="text-muted-foreground/70">{t('settings.profile.nationality_optional')}</span>
        </label>
        <select
          id="nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          className="mt-1 block w-full rounded-lg border-input bg-background p-3 text-foreground focus:border-primary focus:ring-primary"
        >
          <option value="">{t('settings.profile.nationality_placeholder')}</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="show_nationality"
          checked={showNationality}
          onChange={(e) => setShowNationality(e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
        />
        <label htmlFor="show_nationality" className="ml-2 block text-sm text-foreground">
          {t('settings.profile.show_nationality_label')}
        </label>
      </div>
      <button
        onClick={handleUpdateProfile}
        disabled={loading}
        className="btn-primary flex justify-center items-center gap-2 py-3 hover:shadow-lg transition-shadow duration-200"
      >
        {loading ? (
          <LoadingSpinner size="sm" color="foreground" label={t('settings.profile.saving')} />
        ) : (
          <>
            <span>💾</span>
            <span>{t('settings.profile.save_button')}</span>
          </>
        )}
      </button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
