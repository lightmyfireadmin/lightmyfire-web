'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; 
import Image from 'next/image';
import { useI18n, useCurrentLocale } from '@/locales/client';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import InfoPopup from '@/app/components/InfoPopup';

export default function PinEntryForm() {
  const t = useI18n();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const lang = useCurrentLocale();

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.toUpperCase();

    
    input = input.replace(/[^A-Z0-9]/g, '');

    
    input = input.slice(0, 6);

    
    if (input.length >= 3) {
      input = `${input.slice(0, 3)}-${input.slice(3)}`;
    }

    setPin(input);
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
    } else if (data) {
      router.push(`/${lang}/lighter/${data}`);
    } else {
      setError(t('home.pin_entry.error.invalid'));
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-background p-5 sm:p-6 lg:p-8 shadow-md lg:shadow-lg">
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center">
          <Image
            src="/illustrations/around_the_world.png"
            alt="Found a lighter"
            width={48}
            height={48}
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-foreground">
          {t('home.pin_entry.title')}
        </h2>
      </div>
      <p className="mb-6 text-center text-sm sm:text-base text-muted-foreground leading-relaxed">
        {t('home.pin_entry.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <label
              htmlFor="pin"
              className="text-sm font-medium text-foreground"
            >
              {t('home.pin_entry.label')}
            </label>
            <InfoPopup content={t('home.hero.popup_content')} />
          </div>
          <input
            type="text"
            id="pin"
            value={pin}
            onChange={handlePinChange}
            maxLength={7}
            className="w-full rounded-lg border border-input p-3 text-lg sm:text-xl text-center font-mono tracking-widest bg-background focus:border-primary focus:ring-2 focus:ring-primary transition"
            placeholder="ABC-123"
            required
            aria-label={t('home.pin_entry.label')}
          />
        </div>

        {error && (
          <p className="text-center text-sm text-error bg-error/10 p-3 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-base sm:text-lg py-3 flex justify-center items-center gap-2 hover:shadow-lg transition-shadow duration-200"
        >
          {loading ? (
            <LoadingSpinner size="sm" color="foreground" label={t('home.pin_entry.loading')} />
          ) : (
            <>
              <span>🔍</span>
              <span>{t('home.pin_entry.button')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
