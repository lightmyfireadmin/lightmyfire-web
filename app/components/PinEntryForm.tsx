'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Assuming lib is at root

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
    // Applied responsive padding
    <div className="w-full max-w-md rounded-lg bg-background p-6 sm:p-8 shadow-md">
      <h2 className="mb-6 text-center text-3xl sm:text-4xl font-bold text-foreground">
        Found a Lighter?
      </h2>
      <p className="mb-6 text-center text-lg text-muted-foreground">
        Enter the PIN from the sticker to see its story.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="pin"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Lighter PIN
          </label>
          <input
            type="text"
            id="pin"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-lg border border-input p-3 text-lg text-foreground bg-background focus:border-primary focus:ring-primary" // Use rounded-lg
            placeholder="e.g., KFR-9T2"
            required
          />
        </div>

        {error && <p className="mb-4 text-center text-sm text-error">{error}</p>} {/* Smaller error */}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-lg" // Applied btn-primary
        >
          {loading ? 'Searching...' : 'Find Lighter'}
        </button>
      </form>
    </div>
  );
}