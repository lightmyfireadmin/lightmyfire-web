'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// We accept the 'user' object as a prop from the parent page
export default function SaveLighterForm({ user }: { user: User }) {
  const router = useRouter();
  const [lighterName, setLighterName] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [showUsername, setShowUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Call the database function we just created!
    const { data, error: rpcError } = await supabase.rpc(
      'create_new_lighter',
      {
        lighter_name: lighterName,
        background_url: backgroundUrl || null, // Send null if empty
        show_username: showUsername,
      }
    );

    if (rpcError) {
      setError(`Error: ${rpcError.message}`);
      setLoading(false);
    } else if (data) {
      // Success! 'data' contains the new lighter's UUID.
      // Let's redirect to the new lighter's page.
      router.push(`/save-lighter/success/${data}`);    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-lg rounded-lg bg-white p-8 shadow-md"
    >
      <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
        Save a Lighter
      </h1>
      <p className="mb-6 text-gray-600">
        You are a LightSaver! Give your lighter a name to begin its journey.
      </p>

      {/* Lighter Name Input */}
      <div className="mb-4">
        <label
          htmlFor="lighterName"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Lighter Name (Required)
        </label>
        <input
          type="text"
          id="lighterName"
          value={lighterName}
          onChange={(e) => setLighterName(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., The Wanderer"
          required
        />
      </div>

      {/* Background URL Input */}
      <div className="mb-4">
        <label
          htmlFor="backgroundUrl"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Custom Background URL (Optional)
        </label>
        <input
          type="url"
          id="backgroundUrl"
          value={backgroundUrl}
          onChange={(e) => setBackgroundUrl(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://.../my-image.png"
        />
      </div>

      {/* Show Username Checkbox */}
      <div className="mb-6 flex items-center">
        <input
          type="checkbox"
          id="showUsername"
          checked={showUsername}
          onChange={(e) => setShowUsername(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="showUsername"
          className="ml-2 block text-sm text-gray-700"
        >
          Show my username as the "LightSaver"
        </label>
      </div>

      {error && <p className="mb-4 text-center text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Lighter'}
      </button>
    </form>
  );
}