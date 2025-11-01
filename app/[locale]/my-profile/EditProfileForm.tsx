'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { countries } from '@/lib/countries';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface Profile {
  username: string;
  nationality: string | null;
  show_nationality: boolean;
}

export default function EditProfileForm({ user, profile }: { user: User; profile: Profile }) {
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
      // Optionally, refresh the page to show the new username in the header
      // window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-muted-foreground">
          Username
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
          Nationality
        </label>
        <select
          id="nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          className="mt-1 block w-full rounded-lg border-input bg-background p-3 text-foreground focus:border-primary focus:ring-primary"
        >
          <option value="">Select a country</option>
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
          Show my nationality on my posts
        </label>
      </div>
      <button
        onClick={handleUpdateProfile}
        disabled={loading}
        className="btn-primary flex justify-center items-center gap-2 py-3 hover:shadow-lg transition-shadow duration-200"
      >
        {loading ? (
          <LoadingSpinner size="sm" color="primary-foreground" label="Saving..." />
        ) : (
          <>
            <span>💾</span>
            <span>Save Profile</span>
          </>
        )}
      </button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
