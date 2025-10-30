'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Assuming lib is at root
import Image from 'next/image';
import { useI18n, useCurrentLocale } from '@/locales/client';

export default function PinEntryForm() {
  const t = useI18n();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const lang = useCurrentLocale();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // 1. Clean the input: only letters/numbers, uppercase, max 6 chars.
    const cleaned = input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    
    // 2. Handle user backspacing the hyphen (from "ABC-" to "ABC")
    if (input.length === 3 && pin.length === 4) {
      setPin(cleaned); // cleaned is "ABC"
      return;
    }

    // 3. Add hyphen *after* 3rd char, or format 4-6 chars
    if (cleaned.length > 3) {
      setPin(`${cleaned.slice(0, 3)}-${cleaned.slice(3)}`); // "ABC1" -> "ABC-1"
    } else if (cleaned.length === 3 && input.length === 3) {
      // 4. Add hyphen *immediately* after 3rd char is typed
      setPin(cleaned + '-'); // "ABC" -> "ABC-"
    } else {
      setPin(cleaned); // "A", "AB"
    }
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
      setError(t('home.pin_entry.error.generic'));
      console.error(rpcError);
    } else if (data) {
      router.push(`/${lang}/lighter/${data}`);
    } else {
      setError(t('home.pin_entry.error.invalid'));
    }

    setLoading(false);
  };

  return (
    // Applied responsive padding
    <div className="w-full max-w-md rounded-lg bg-background p-6 sm:p-8 shadow-md">
      <div className="flex items-center justify-center mb-6">
        <Image
          src="/illustrations/around_the_world.png"
          alt="Around the World"
          width={40}
          height={40}
          className="mr-2"
        />
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-foreground">
          {t('home.pin_entry.title')}
        </h2>
      </div>
      <p className="mb-6 text-center text-lg text-muted-foreground">
        {t('home.pin_entry.subtitle')}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="pin"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            {t('home.pin_entry.label')}
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
              {t('home.pin_entry.loading')}
            </>
          ) : (
            t('home.pin_entry.button')
          )}
        </button>
      </form>
    </div>
  );
}
