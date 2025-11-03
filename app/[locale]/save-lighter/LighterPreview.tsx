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

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sticker
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
      <div className="border border-border rounded-lg p-4 bg-background">
        <canvas
          ref={canvasRef}
          width={200}
          height={500}
          className="border border-muted-foreground"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Actual size: 2cm × 5cm (will be printed on sticker sheet)
      </p>
    </div>
  );
}

/**
 * Draw a lighter sticker preview on canvas
 */
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

  // Colored background for sticker
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Add rounded corners
  const radius = width * 0.1;
  roundRect(ctx, 0, 0, width, height, radius);
  ctx.fillStyle = backgroundColor;
  ctx.fill();

  // White card background for header
  const cardHeight = contentHeight * 0.25;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(padding, currentY, contentWidth, cardHeight);

  // "You found me" text (bold, centered)
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${height * 0.08}px 'Poppins', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('You found me', width / 2, currentY + cardHeight * 0.4);

  // "I'm + name" text
  ctx.font = `${height * 0.07}px 'Poppins', Arial, sans-serif`;
  ctx.fillText(`I'm ${name}`, width / 2, currentY + cardHeight * 0.75);

  currentY += cardHeight + padding;

  // Invitation text: "Read my story and expand it"
  ctx.fillStyle = '#ffffff';
  ctx.font = `${height * 0.05}px 'Poppins', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Read my story', width / 2, currentY);
  ctx.fillText('and expand it', width / 2, currentY + height * 0.06);

  // Translation (smaller)
  const translations: { [key: string]: string } = {
    fr: 'Lis mon histoire et enrichis-la',
    es: 'Lee mi historia y ampliala',
    de: 'Lesen Sie meine Geschichte und erweitern Sie sie',
    it: 'Leggi la mia storia e ampliala',
    pt: 'Leia minha história e expanda-a',
  };

  const translationText = translations[language] || translations.fr;
  ctx.font = `${height * 0.035}px 'Poppins', Arial, sans-serif`;
  ctx.fillText(translationText, width / 2, currentY + height * 0.11);

  currentY += height * 0.18;

  // QR Code placeholder
  const qrSize = height * 0.18;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect((width - qrSize) / 2, currentY, qrSize, qrSize);

  // QR code placeholder pattern
  ctx.fillStyle = '#cccccc';
  ctx.font = `${qrSize * 0.3}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('QR', width / 2, currentY + qrSize / 2 + qrSize * 0.1);

  currentY += qrSize + height * 0.05;

  // "or go to lightmyfire.app" section with background
  const urlBgHeight = height * 0.12;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(padding, currentY, contentWidth, urlBgHeight);

  ctx.fillStyle = '#000000';
  ctx.font = `${height * 0.04}px 'Poppins', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('or go to', width / 2, currentY + urlBgHeight * 0.5);
  ctx.fillText('lightmyfire.app', width / 2, currentY + urlBgHeight * 0.85);

  currentY += urlBgHeight + height * 0.03;

  // "and type my code" (bold)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${height * 0.05}px 'Poppins', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('and type my code', width / 2, currentY);

  // Translation
  const codeTranslations: { [key: string]: string } = {
    fr: 'et entre mon code',
    es: 'e introduce mi código',
    de: 'und geben Sie meinen Code ein',
    it: 'e digita il mio codice',
    pt: 'e digite meu código',
  };

  const codeText = codeTranslations[language] || codeTranslations.fr;
  ctx.font = `${height * 0.035}px 'Poppins', Arial, sans-serif`;
  ctx.fillText(codeText, width / 2, currentY + height * 0.07);

  currentY += height * 0.13;

  // PIN code (bold, with background)
  const pinBgHeight = height * 0.12;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(padding, currentY, contentWidth, pinBgHeight);

  ctx.fillStyle = '#000000';
  ctx.font = `bold ${height * 0.1}px 'Poppins', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(pinCode, width / 2, currentY + pinBgHeight * 0.75);
}

/**
 * Helper function to draw rounded rectangles
 */
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
