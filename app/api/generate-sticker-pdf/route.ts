import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { createCanvas } from 'canvas';

// Mark this route as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';

interface StickerDesign {
  id: string;
  name: string;
  backgroundColor: string;
  language?: string;
}

// Stickiply sheet dimensions: 7.5 x 5 inches at 300 DPI
const SHEET_WIDTH_INCHES = 7.5;
const SHEET_HEIGHT_INCHES = 5;
const DPI = 300;
const SHEET_WIDTH_PX = Math.round(SHEET_WIDTH_INCHES * DPI);
const SHEET_HEIGHT_PX = Math.round(SHEET_HEIGHT_INCHES * DPI);

// Sticker dimensions: 5cm high x 2cm wide
const STICKER_WIDTH_CM = 2;
const STICKER_HEIGHT_CM = 5;
const CM_TO_INCHES = 1 / 2.54;
const STICKER_WIDTH_INCHES = STICKER_WIDTH_CM * CM_TO_INCHES;
const STICKER_HEIGHT_INCHES = STICKER_HEIGHT_CM * CM_TO_INCHES;
const STICKER_WIDTH_PX = Math.round(STICKER_WIDTH_INCHES * DPI);
const STICKER_HEIGHT_PX = Math.round(STICKER_HEIGHT_INCHES * DPI);

// Gap between stickers: 1cm
const GAP_CM = 1;
const GAP_INCHES = GAP_CM * CM_TO_INCHES;
const GAP_PX = Math.round(GAP_INCHES * DPI);

// Available width and height accounting for gaps
const AVAILABLE_WIDTH = SHEET_WIDTH_PX - GAP_PX * 2; // 1cm margin on each side
const AVAILABLE_HEIGHT = SHEET_HEIGHT_PX - GAP_PX * 2;

// Calculate how many stickers fit per row/column
const STICKERS_PER_ROW = Math.floor((AVAILABLE_WIDTH + GAP_PX) / (STICKER_WIDTH_PX + GAP_PX));
const STICKERS_PER_COLUMN = Math.floor((AVAILABLE_HEIGHT + GAP_PX) / (STICKER_HEIGHT_PX + GAP_PX));

interface LighterSticker extends StickerDesign {
  pinCode: string;
  language: string; // Second language for translations
}

/**
 * Generate sticker sheet in Stickiply format
 * Creates a PNG file (7.5x5 inches) with transparent areas for die-cutting
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stickers, orderId } = body;

    if (!stickers || !Array.isArray(stickers) || stickers.length === 0) {
      return NextResponse.json(
        { error: 'No stickers provided' },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Ensure stickers have required fields
    const validatedStickers = stickers.map((s: Partial<LighterSticker>) => ({
      id: s.id || `sticker-${Math.random()}`,
      name: s.name || 'Lighter',
      backgroundColor: s.backgroundColor || '#3b82f6',
      pinCode: s.pinCode || 'PIN',
      language: s.language || 'fr', // Default to French as second language
    }));

    // Generate sheet images
    const foregroundPNG = await generateForegroundSheet(validatedStickers);
    const backgroundPNG = await generateBackgroundSheet();

    // Return the foreground PNG as Uint8Array
    return new NextResponse(new Uint8Array(foregroundPNG), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="stickers-${orderId}-foreground.png"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
      status: 200,
    });
  } catch (error) {
    console.error('Sticker generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate sticker sheet. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate foreground sheet (stickers with transparent background)
 */
async function generateForegroundSheet(stickers: LighterSticker[]): Promise<Buffer> {
  const canvas = createCanvas(SHEET_WIDTH_PX, SHEET_HEIGHT_PX);
  const ctx = canvas.getContext('2d');

  // Transparent background
  ctx.clearRect(0, 0, SHEET_WIDTH_PX, SHEET_HEIGHT_PX);

  // Calculate starting position to center stickers on sheet
  const totalStickersWidth = STICKERS_PER_ROW * STICKER_WIDTH_PX + (STICKERS_PER_ROW - 1) * GAP_PX;
  const totalStickersHeight = STICKERS_PER_COLUMN * STICKER_HEIGHT_PX + (STICKERS_PER_COLUMN - 1) * GAP_PX;

  const startX = (SHEET_WIDTH_PX - totalStickersWidth) / 2;
  const startY = (SHEET_HEIGHT_PX - totalStickersHeight) / 2;

  // Draw stickers on the sheet
  let stickerIndex = 0;
  for (let row = 0; row < STICKERS_PER_COLUMN && stickerIndex < stickers.length; row++) {
    for (let col = 0; col < STICKERS_PER_ROW && stickerIndex < stickers.length; col++) {
      const x = startX + col * (STICKER_WIDTH_PX + GAP_PX);
      const y = startY + row * (STICKER_HEIGHT_PX + GAP_PX);

      const sticker = stickers[stickerIndex];
      drawStickerDesign(ctx, x, y, sticker);

      stickerIndex++;
    }
  }

  return canvas.toBuffer('image/png');
}

/**
 * Generate background sheet (white background)
 */
async function generateBackgroundSheet(): Promise<Buffer> {
  const canvas = createCanvas(SHEET_WIDTH_PX, SHEET_HEIGHT_PX);
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SHEET_WIDTH_PX, SHEET_HEIGHT_PX);

  return canvas.toBuffer('image/png');
}

/**
 * Draw a single sticker design on the canvas
 */
function drawStickerDesign(
  ctx: any,
  x: number,
  y: number,
  sticker: LighterSticker
): void {
  // Colored background for sticker
  ctx.fillStyle = sticker.backgroundColor;
  ctx.fillRect(x, y, STICKER_WIDTH_PX, STICKER_HEIGHT_PX);

  // Add rounded corners
  const radius = Math.round(STICKER_WIDTH_PX * 0.1);
  roundRect(ctx, x, y, STICKER_WIDTH_PX, STICKER_HEIGHT_PX, radius);
  ctx.fillStyle = sticker.backgroundColor;
  ctx.fill();

  // Draw sticker content
  drawStickerContent(ctx, x, y, sticker);
}

/**
 * Draw the content of a single sticker
 */
function drawStickerContent(
  ctx: any,
  x: number,
  y: number,
  sticker: LighterSticker
): void {
  const padding = Math.round(STICKER_WIDTH_PX * 0.08);
  const contentWidth = STICKER_WIDTH_PX - padding * 2;
  const contentHeight = STICKER_HEIGHT_PX - padding * 2;

  let currentY = y + padding;

  // White card background
  const cardHeight = Math.round(contentHeight * 0.25);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + padding, currentY, contentWidth, cardHeight);

  // "You found me" text (bold, centered)
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.round(STICKER_HEIGHT_PX * 0.08)}px 'Poppins', Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('You found me', x + STICKER_WIDTH_PX / 2, currentY + Math.round(cardHeight * 0.4));

  // "I'm + name" text
  ctx.font = `${Math.round(STICKER_HEIGHT_PX * 0.07)}px 'Poppins', Arial`;
  ctx.fillText(`I'm ${sticker.name}`, x + STICKER_WIDTH_PX / 2, currentY + Math.round(cardHeight * 0.75));

  currentY += cardHeight + padding;

  // Invitation text: "Read my story and expand it"
  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.round(STICKER_HEIGHT_PX * 0.05)}px 'Poppins', Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('Read my story', x + STICKER_WIDTH_PX / 2, currentY);
  ctx.fillText('and expand it', x + STICKER_WIDTH_PX / 2, currentY + Math.round(STICKER_HEIGHT_PX * 0.06));

  // Translation (smaller)
  const translations: { [key: string]: string } = {
    fr: 'Lis mon histoire et enrichis-la',
    es: 'Lee mi historia y ampliala',
    de: 'Lesen Sie meine Geschichte und erweitern Sie sie',
    it: 'Leggi la mia storia e ampliala',
    pt: 'Leia minha história e expanda-a',
  };

  const translationText = translations[sticker.language] || translations.fr;
  ctx.font = `${Math.round(STICKER_HEIGHT_PX * 0.035)}px 'Poppins', Arial`;
  ctx.fillText(translationText, x + STICKER_WIDTH_PX / 2, currentY + Math.round(STICKER_HEIGHT_PX * 0.11));

  currentY += Math.round(STICKER_HEIGHT_PX * 0.18);

  // QR Code (generate and draw)
  // For now, draw a placeholder QR code area
  const qrSize = Math.round(STICKER_HEIGHT_PX * 0.18);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + (STICKER_WIDTH_PX - qrSize) / 2, currentY, qrSize, qrSize);

  currentY += qrSize + Math.round(STICKER_HEIGHT_PX * 0.05);

  // "or go to lightmyfire.app" section with background
  const urlBgHeight = Math.round(STICKER_HEIGHT_PX * 0.12);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + padding, currentY, contentWidth, urlBgHeight);

  ctx.fillStyle = '#000000';
  ctx.font = `${Math.round(STICKER_HEIGHT_PX * 0.04)}px 'Poppins', Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('or go to', x + STICKER_WIDTH_PX / 2, currentY + Math.round(urlBgHeight * 0.5));
  ctx.fillText('lightmyfire.app', x + STICKER_WIDTH_PX / 2, currentY + Math.round(urlBgHeight * 0.85));

  currentY += urlBgHeight + Math.round(STICKER_HEIGHT_PX * 0.03);

  // "and type my code" (bold)
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(STICKER_HEIGHT_PX * 0.05)}px 'Poppins', Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('and type my code', x + STICKER_WIDTH_PX / 2, currentY);

  // Translation
  const codeTranslations: { [key: string]: string } = {
    fr: 'et entre mon code',
    es: 'e introduce mi código',
    de: 'und geben Sie meinen Code ein',
    it: 'e digita il mio codice',
    pt: 'e digite meu código',
  };

  const codeText = codeTranslations[sticker.language] || codeTranslations.fr;
  ctx.font = `${Math.round(STICKER_HEIGHT_PX * 0.035)}px 'Poppins', Arial`;
  ctx.fillText(codeText, x + STICKER_WIDTH_PX / 2, currentY + Math.round(STICKER_HEIGHT_PX * 0.07));

  currentY += Math.round(STICKER_HEIGHT_PX * 0.13);

  // PIN code (bold, with background)
  const pinBgHeight = Math.round(STICKER_HEIGHT_PX * 0.12);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + padding, currentY, contentWidth, pinBgHeight);

  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.round(STICKER_HEIGHT_PX * 0.1)}px 'Poppins', Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(sticker.pinCode, x + STICKER_WIDTH_PX / 2, currentY + Math.round(pinBgHeight * 0.75));
}

/**
 * Helper function to draw rounded rectangles
 */
function roundRect(
  ctx: any,
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

/**
 * Get translation for a key and language
 */
function getTranslation(key: string, language: string): string {
  const translations: { [key: string]: { [lang: string]: string } } = {
    readMyStory: {
      fr: 'Lis mon histoire et enrichis-la',
      es: 'Lee mi historia y ampliala',
      de: 'Lesen Sie meine Geschichte und erweitern Sie sie',
      it: 'Leggi la mia storia e ampliala',
      pt: 'Leia minha história e expanda-a',
    },
    andTypeCode: {
      fr: 'et entre mon code',
      es: 'e introduce mi código',
      de: 'und geben Sie meinen Code ein',
      it: 'e digita il mio codice',
      pt: 'e digite meu código',
    },
  };

  return translations[key]?.[language] || translations[key]?.fr || '';
}
