'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PinEntryForm() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: rpcError } = await supabase.rpc(
      'get_lighter_id_from_pin',
      {
        pin_to_check: pin.toUpperCase(),
      }
    );

    if (rpcError) {
      setError('An error occurred. Please try again.');
      console.error(rpcError);
    } else if (data) {
      router.push(`/lighter/${data}`);
    } else {
      setError('Invalid PIN. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
        Found a Lighter?
      </h2>
      <p className="mb-6 text-center text-gray-600">
        Enter the PIN from the sticker to see its story.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="pin"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Lighter PIN
          </label>
          <input
            type="text"
            id="pin"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-3 text-lg text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., KFR-9T2"
            required
          />
        </div>

        {error && <p className="mb-4 text-center text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Find Lighter'}
        </button>
      </form>
    </div>
  );
}