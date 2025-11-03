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

// Translations for the sticker text (aligned with server-side)
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
    readStory: 'Lesen Sie meine Geschichte',
    typeCode: 'und gib meinen Code ein',
  },
  it: {
    readStory: 'Leggi la mia storia e ampliala',
    typeCode: 'e digita il mio codice',
  },
  pt: {
    readStory: 'Leia minha história e expanda',
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
          fontFamily: 'Helvetica, sans-serif',
        }}
      >
        {/* Content Container */}
        <div className="absolute inset-0 p-3 flex flex-col items-center text-center">
          {/* Top Card: "You found me" + Lighter Name */}
          <div className="w-full bg-white rounded-md p-3 mb-2">
            <p className="text-black text-base font-bold">You found me</p>
            <p className="text-black text-[15px] font-bold">I&apos;m {lighterName}</p>
          </div>

          {/* Invitation Text */}
          <div className="text-white text-[12px] leading-tight mb-2 font-bold">
            <p>Read my story</p>
            <p>and expand it</p>
            <p className="text-[10px] mt-1">{trans.readStory}</p>
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
          <div className="w-full bg-white rounded-md p-2.5 mb-2">
            <p className="text-black text-[11px] font-bold">or go to</p>
            <p className="text-black text-[12px] font-bold">lightmyfire.app</p>
          </div>

          {/* Code Text */}
          <div className="text-white text-[12px] leading-tight mb-2 font-bold">
            <p>and type my code</p>
            <p className="text-[9px] mt-1">{trans.typeCode}</p>
          </div>

          {/* PIN Code */}
          <div className="w-full bg-white rounded-md p-3 mb-2">
            <p className="text-black text-3xl font-bold tracking-wider">{pinCode}</p>
          </div>

          {/* Logo Section - White background extending to edges */}
          <div className="absolute bottom-0 left-0 right-0 bg-white flex items-center justify-center px-4" style={{ height: '60px' }}>
            <Image
              src="/NEWLOGOLONG.png"
              alt="LightMyFire Logo"
              width={150}
              height={40}
              className="object-contain w-full max-w-[150px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
