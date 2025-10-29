'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import Image from 'next/image';

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
      console.error(error);
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
        <input
          type="text"
          id="nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          className="mt-1 block w-full rounded-lg border-input bg-background p-3 text-foreground focus:border-primary focus:ring-primary"
          placeholder="e.g., French"
        />
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
        className="btn-primary flex justify-center items-center"
      >
        {loading ? (
          <>
            <Image src="/loading.gif" alt="Loading..." width={24} height={24} unoptimized={true} className="mr-2" />
            Saving...
          </>
        ) : (
          'Save Profile'
        )}
      </button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
