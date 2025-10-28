'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { generateStickerPDF } from '@/lib/generateSticker';
import Link from 'next/link';

type LighterInfo = {
  name: string;
  pin_code: string;
};

export default function SaveSuccessPage() {
  const params = useParams();
  const lighterId = params.id as string;
  const [lighter, setLighter] = useState<LighterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Fetch the new lighter's info on load
  useEffect(() => {
    if (lighterId) {
      const fetchLighterInfo = async () => {
        const { data, error } = await supabase
          .from('lighters')
          .select('name, pin_code')
          .eq('id', lighterId)
          .single();

        if (data) {
          setLighter(data);
        }
        setLoading(false);
      };
      fetchLighterInfo();
    }
  }, [lighterId]);

  const handleDownload = async () => {
    if (!lighter) return;
    setDownloading(true);
    await generateStickerPDF(lighter.name, lighter.pin_code);
    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>Loading your lighter's details...</p>
      </div>
    );
  }

  if (!lighter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>Could not find lighter.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <h1 className="mb-4 text-3xl font-bold text-green-600">
          Success!
        </h1>
        <p className="mb-6 text-lg text-gray-700">
          You've saved{' '}
          <span className="font-bold">{lighter.name}</span>!
        </p>
        <p className="mb-2 text-gray-600">Your lighter's unique PIN is:</p>
        <p className="mb-8 font-mono text-3xl font-bold text-gray-900">
          {lighter.pin_code}
        </p>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mb-4 w-full rounded-md bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {downloading ? 'Generating...' : 'Download Sticker PDF'}
        </button>

        <Link
          href={`/lighter/${lighterId}`}
          className="block w-full rounded-md bg-gray-200 py-3 text-lg font-semibold text-gray-800 transition hover:bg-gray-300"
        >
          Go to Your Lighter's Page
        </Link>
      </div>
    </div>
  );
}