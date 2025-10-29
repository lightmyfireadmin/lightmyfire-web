'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Assuming lib is at root
import Image from 'next/image';

export default function PinEntryForm() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    let formattedValue = rawValue;

    if (rawValue.length > 3) {
      formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 6)}`;
    }
    
    setPin(formattedValue);
  };

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
            onChange={handlePinChange}
            maxLength={7}
            className="w-full rounded-lg border border-input p-3 text-lg text-center font-mono tracking-widest bg-background focus:border-primary focus:ring-primary" // Use rounded-lg
            placeholder="ABC-123"
            required
          />
        </div>

        {error && <p className="mb-4 text-center text-sm text-error">{error}</p>} {/* Smaller error */}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-lg flex justify-center items-center" // Applied btn-primary
        >
          {loading ? (
            <>
              <Image src="/loading.gif" alt="Loading..." width={24} height={24} unoptimized={true} className="mr-2" />
              Searching...
            </>
          ) : (
            'Find Lighter'
          )}
        </button>
      </form>
    </div>
  );
}