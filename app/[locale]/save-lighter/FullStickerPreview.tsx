'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';

interface FullStickerPreviewProps {
  lighterName: string;
  pinCode: string;
  backgroundColor: string;
  language: string;
}

// Translations for the sticker text
const translations: { [key: string]: { readStory: string; typeCode: string } } = {
  en: {
    readStory: 'Read my story and expand it',
    typeCode: 'and type my code',
  },
  fr: {
    readStory: 'Lis mon histoire et enrichis-la',
    typeCode: 'et entre mon code',
  },
  es: {
    readStory: 'Lee mi historia y ampliala',
    typeCode: 'e introduce mi código',
  },
  de: {
    readStory: 'Lesen Sie meine Geschichte und erweitern Sie sie',
    typeCode: 'und geben Sie meinen Code ein',
  },
  it: {
    readStory: 'Leggi la mia storia e ampliala',
    typeCode: 'e digita il mio codice',
  },
  pt: {
    readStory: 'Leia minha história e expanda-a',
    typeCode: 'e digite meu código',
  },
};

export default function FullStickerPreview({
  lighterName,
  pinCode,
  backgroundColor,
  language = 'en',
}: FullStickerPreviewProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code for the /find page
    const generateQR = async () => {
      try {
        const url = `${window.location.origin}/find`;
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrCodeUrl(qrDataUrl);
      } catch (err) {
        console.error('QR Code generation error:', err);
      }
    };
    generateQR();
  }, []);

  const trans = translations[language] || translations.en;

  // Aspect ratio: 2cm width x 5cm height = 2:5
  return (
    <div className="flex justify-center items-center p-4">
      <div
        className="relative shadow-lg rounded-lg overflow-hidden"
        style={{
          width: '200px',
          height: '500px',
          backgroundColor: backgroundColor,
        }}
      >
        {/* Content Container */}
        <div className="absolute inset-0 p-3 flex flex-col items-center text-center">
          {/* Top Card: "You found me" + Lighter Name */}
          <div className="w-full bg-white rounded-md p-2 mb-2">
            <p className="text-black text-xs font-bold">You found me</p>
            <p className="text-black text-xs">I&apos;m {lighterName}</p>
          </div>

          {/* Invitation Text */}
          <div className="text-white text-[10px] leading-tight mb-2">
            <p className="font-semibold">Read my story</p>
            <p className="font-semibold">and expand it</p>
            <p className="text-[8px] mt-1 opacity-90">{trans.readStory}</p>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="bg-white p-1 rounded mb-2">
              <Image
                src={qrCodeUrl}
                alt="QR Code"
                width={64}
                height={64}
                className="w-16 h-16"
              />
            </div>
          )}

          {/* Website URL */}
          <div className="w-full bg-white rounded-md p-1.5 mb-2">
            <p className="text-black text-[8px]">or go to</p>
            <p className="text-black text-[9px] font-bold">lightmyfire.app</p>
          </div>

          {/* Code Text */}
          <div className="text-white text-[10px] leading-tight mb-2">
            <p className="font-bold">and type my code</p>
            <p className="text-[8px] opacity-90">{trans.typeCode}</p>
          </div>

          {/* PIN Code */}
          <div className="w-full bg-white rounded-md p-2">
            <p className="text-black text-xl font-bold tracking-wider">{pinCode}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
