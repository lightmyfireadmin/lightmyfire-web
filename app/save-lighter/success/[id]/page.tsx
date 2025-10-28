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
      <div className="flex min-h-screen items-center justify-center bg-gray-100"> {/* Keep muted bg for loading */}
        <p className="text-muted-foreground">Loading your lighter&apos;s details...</p>
      </div>
    );
  }

  if (!lighter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-600">Could not find lighter.</p> {/* Error text */}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4"> {/* Muted bg */}
      <div className="w-full max-w-md rounded-lg bg-background p-8 text-center shadow-md"> {/* Theme bg */}
        <h1 className="mb-4 text-3xl font-bold text-green-600"> {/* Keep success green */}
          Success!
        </h1>
        <p className="mb-6 text-lg text-foreground"> {/* Theme text */}
          You&apos;ve saved{' '}
          <span className="font-bold text-primary">{lighter.name}</span>! {/* Highlight name */}
        </p>
        <p className="mb-2 text-muted-foreground">Your lighter&apos;s unique PIN is:</p> {/* Theme text */}
        <p className="mb-8 font-mono text-3xl font-bold text-foreground"> {/* Theme text */}
          {lighter.pin_code}
        </p>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary mb-4 w-full text-lg" // Applied btn-primary
        >
          {downloading ? 'Generating...' : 'Download Sticker PDF'}
        </button>

        <Link
          href={`/lighter/${lighterId}`}
          className="btn-secondary block w-full text-lg" // Applied btn-secondary, added block
        >
          Go to Your Lighter&apos;s Page
        </Link>
      </div>
    </div>
  );
}