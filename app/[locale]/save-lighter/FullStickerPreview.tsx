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

function getLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

function getContrastTextColor(backgroundColor: string): string {
  return getLuminance(backgroundColor) > 0.5 ? '#000000' : '#ffffff';
}

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

  
  const textColor = getContrastTextColor(backgroundColor);

  
  return (
    <div className="flex justify-center items-center p-4">
      <div
        data-sticker-preview
        className="relative shadow-lg rounded-lg overflow-hidden"
        style={{
          width: '200px',
          height: '500px',
          backgroundColor: backgroundColor,
          fontFamily: 'Helvetica, sans-serif',
        }}
      >
        {}
        <div className="absolute inset-0 p-3 flex flex-col items-center text-center">
          {}
          <div className="w-full bg-white rounded-md p-3 mb-2">
            <p className="text-black text-base font-bold">You found me!</p>
            <p className="text-black text-sm">I&apos;m</p>
            <p className="text-black text-base font-bold">{lighterName}</p>
          </div>

          {}
          <div className="text-[13px] leading-tight mb-2 font-bold" style={{ color: textColor }}>
            <p>Read my Story & Write it</p>
            <p className="text-[11px] mt-1 font-normal">{trans.readStory}</p>
          </div>

          {}
          {qrCodeUrl && (
            <div className="bg-white p-2 rounded mb-2">
              <Image
                src={qrCodeUrl}
                alt="QR Code"
                width={90}
                height={90}
                className="w-[90px] h-[90px]"
              />
            </div>
          )}

          {}
          <div className="w-full bg-white rounded-md p-2.5 mb-2">
            <p className="text-black text-[11px]">or go to</p>
            <p className="text-black text-[12px] font-bold">lightmyfire.app</p>
          </div>

          {}
          <div className="text-[13px] leading-tight mb-2 font-bold" style={{ color: textColor }}>
            <p>and type my code</p>
            <p className="text-[11px] mt-1 font-normal">{trans.typeCode}</p>
          </div>

          {}
          <div className="w-full bg-white rounded-md p-3 mb-2">
            <p className="text-black text-2xl font-bold tracking-wider">{pinCode}</p>
          </div>

          {}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center px-4" style={{ height: '60px', backgroundColor: '#FFF8F0' }}>
            {}
          </div>
        </div>
      </div>
    </div>
  );
}
