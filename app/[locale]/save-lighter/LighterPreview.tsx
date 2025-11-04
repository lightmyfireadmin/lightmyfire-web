'use client';

import { useEffect, useRef } from 'react';

interface LighterPreviewProps {
  name: string;
  backgroundColor: string;
  pinCode: string;
  language: string;
}

export default function LighterPreview({
  name,
  backgroundColor,
  pinCode,
  language,
}: LighterPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    drawLighterSticker(ctx, {
      name,
      backgroundColor,
      pinCode,
      language,
      width: canvas.width,
      height: canvas.height,
    });
  }, [name, backgroundColor, pinCode, language]);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-semibold text-foreground">
        Live Preview (Actual Size)
      </p>
      <div className="bg-muted rounded-lg p-8 overflow-auto max-h-[700px]">
        <canvas
          ref={canvasRef}
          width={236}
          height={591}
          className="border border-muted-foreground rounded-lg"
          style={{
            maxWidth: '100%',
            height: 'auto',
            backgroundColor: '#f5f5f5',
            display: 'block'
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Size: 2cm × 5cm at 300 DPI (236px × 591px)
      </p>
    </div>
  );
}

function drawLighterSticker(
  ctx: CanvasRenderingContext2D,
  options: {
    name: string;
    backgroundColor: string;
    pinCode: string;
    language: string;
    width: number;
    height: number;
  }
): void {
  const { name, backgroundColor, pinCode, language, width, height } = options;
  const padding = width * 0.08;
  const contentWidth = width - padding * 2;
  const contentHeight = height - padding * 2;

  let currentY = padding;

  
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  
  const radius = width * 0.1;
  roundRect(ctx, 0, 0, width, height, radius);
  ctx.fillStyle = backgroundColor;
  ctx.fill();

  
  const cardHeight = contentHeight * 0.28;
  const cardRadius = padding * 0.5;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, padding, currentY, contentWidth, cardHeight, cardRadius);
  ctx.fill();

  
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${height * 0.09}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('You found me', width / 2, currentY + cardHeight * 0.4);

  
  ctx.font = `bold ${height * 0.08}px sans-serif`;
  ctx.fillText(`I'm ${name}`, width / 2, currentY + cardHeight * 0.75);

  currentY += cardHeight + padding;

  
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${height * 0.055}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Read my story', width / 2, currentY);
  ctx.fillText('and expand it', width / 2, currentY + height * 0.065);

  
  const translations: { [key: string]: string } = {
    fr: 'Lis mon histoire et enrichis-la',
    es: 'Lee mi historia y ampliala',
    de: 'Lesen Sie meine Geschichte',
    it: 'Leggi la mia storia e ampliala',
    pt: 'Leia minha história e expanda',
  };

  const translationText = translations[language] || translations.fr;
  ctx.font = `bold ${height * 0.045}px sans-serif`;
  ctx.fillText(translationText, width / 2, currentY + height * 0.12);

  currentY += height * 0.18;

  
  const qrSize = height * 0.18;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect((width - qrSize) / 2, currentY, qrSize, qrSize);

  
  ctx.fillStyle = '#cccccc';
  ctx.font = `${qrSize * 0.3}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('QR', width / 2, currentY + qrSize / 2 + qrSize * 0.1);

  currentY += qrSize + height * 0.05;

  
  const urlBgHeight = height * 0.14;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, padding, currentY, contentWidth, urlBgHeight, cardRadius);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.font = `bold ${height * 0.05}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('or go to', width / 2, currentY + urlBgHeight * 0.45);
  ctx.font = `bold ${height * 0.055}px sans-serif`;
  ctx.fillText('lightmyfire.app', width / 2, currentY + urlBgHeight * 0.85);

  currentY += urlBgHeight + height * 0.03;

  
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${height * 0.055}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('and type my code', width / 2, currentY);

  
  const codeTranslations: { [key: string]: string } = {
    fr: 'et entre mon code',
    es: 'e introduce mi código',
    de: 'und gib meinen Code ein',
    it: 'e digita il mio codice',
    pt: 'e digite meu código',
  };

  const codeText = codeTranslations[language] || codeTranslations.fr;
  ctx.font = `bold ${height * 0.04}px sans-serif`;
  ctx.fillText(codeText, width / 2, currentY + height * 0.07);

  currentY += height * 0.12;

  
  const pinBgHeight = height * 0.13;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, padding, currentY, contentWidth, pinBgHeight, cardRadius);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.font = `bold ${height * 0.105}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(pinCode, width / 2, currentY + pinBgHeight * 0.75);

  currentY += pinBgHeight + height * 0.02;

  
  const logoSectionHeight = height - currentY; 
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, currentY, width, logoSectionHeight); 

  
  ctx.fillStyle = '#888888';
  ctx.font = `${height * 0.03}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('LightMyFire', width / 2, currentY + logoSectionHeight / 2);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
