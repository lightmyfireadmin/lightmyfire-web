import { createCanvas, loadImage, Image, Canvas, CanvasRenderingContext2D as NodeCanvasContext } from 'canvas';
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

// Printful sheet dimensions: 5.83 x 8.27 inches at 300 DPI
const SHEET_WIDTH_INCHES = 5.83;
const SHEET_HEIGHT_INCHES = 8.27;
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

// Gap between stickers: 1cm (for proper lighter fit and spacing)
const GAP_CM = 1.0;
const GAP_INCHES = GAP_CM * CM_TO_INCHES;
const GAP_PX = Math.round(GAP_INCHES * DPI);

// Reserved area (bottom-right): 3" × 3"
const RESERVED_INCHES = 3;
const RESERVED_CM = RESERVED_INCHES / CM_TO_INCHES;
const RESERVED_PX = Math.round(RESERVED_INCHES * DPI);

// Calculate sticker grid
const STICKER_WITH_GAP_PX = STICKER_WIDTH_PX + GAP_PX;
const STICKER_WITH_GAP_HEIGHT_PX = STICKER_HEIGHT_PX + GAP_PX;

// Top section (full width, above reserved area)
const TOP_SECTION_HEIGHT_PX = SHEET_HEIGHT_PX - RESERVED_PX;
const STICKERS_PER_ROW = Math.floor(SHEET_WIDTH_PX / STICKER_WITH_GAP_PX);
const ROWS_TOP = Math.floor(TOP_SECTION_HEIGHT_PX / STICKER_WITH_GAP_HEIGHT_PX);

// Bottom-left section
const BOTTOM_LEFT_WIDTH_PX = SHEET_WIDTH_PX - RESERVED_PX;
const STICKERS_PER_ROW_BOTTOM = Math.floor(BOTTOM_LEFT_WIDTH_PX / STICKER_WITH_GAP_PX);
const ROWS_BOTTOM = Math.floor(RESERVED_PX / STICKER_WITH_GAP_HEIGHT_PX);

const TOTAL_STICKERS = (STICKERS_PER_ROW * ROWS_TOP) + (STICKERS_PER_ROW_BOTTOM * ROWS_BOTTOM);

interface StickerData {
  name: string;
  pinCode: string;
  backgroundColor: string;
  language: string;
}

export async function POST(request: NextRequest) {
  try {
    const { stickers, brandingText } = await request.json();

    if (!Array.isArray(stickers) || stickers.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of stickers' },
        { status: 400 }
      );
    }

    // Create canvas with transparent background
    const canvas = createCanvas(SHEET_WIDTH_PX, SHEET_HEIGHT_PX);
    const ctx = canvas.getContext('2d');

    // Transparent background (Printful requirement for kiss-cut)
    ctx.clearRect(0, 0, SHEET_WIDTH_PX, SHEET_HEIGHT_PX);

    // Calculate centering offset for top section
    const topSectionUsedWidth = STICKERS_PER_ROW * STICKER_WIDTH_PX + (STICKERS_PER_ROW - 1) * GAP_PX;
    const topOffsetX = Math.round((SHEET_WIDTH_PX - topSectionUsedWidth) / 2);
    const topOffsetY = Math.round(GAP_PX / 2);

    // Draw stickers in top section
    let stickerIndex = 0;
    for (let row = 0; row < ROWS_TOP && stickerIndex < stickers.length; row++) {
      for (let col = 0; col < STICKERS_PER_ROW && stickerIndex < stickers.length; col++) {
        const x = topOffsetX + col * (STICKER_WIDTH_PX + GAP_PX);
        const y = topOffsetY + row * (STICKER_HEIGHT_PX + GAP_PX);
        await drawSticker(ctx, stickers[stickerIndex], x, y);
        stickerIndex++;
      }
    }

    // Draw stickers in bottom-left section
    const bottomLeftUsedWidth = STICKERS_PER_ROW_BOTTOM * STICKER_WIDTH_PX + (STICKERS_PER_ROW_BOTTOM - 1) * GAP_PX;
    const bottomOffsetX = Math.round((BOTTOM_LEFT_WIDTH_PX - bottomLeftUsedWidth) / 2);
    const bottomOffsetY = SHEET_HEIGHT_PX - RESERVED_PX + Math.round(GAP_PX / 2);

    for (let row = 0; row < ROWS_BOTTOM && stickerIndex < stickers.length; row++) {
      for (let col = 0; col < STICKERS_PER_ROW_BOTTOM && stickerIndex < stickers.length; col++) {
        const x = bottomOffsetX + col * (STICKER_WIDTH_PX + GAP_PX);
        const y = bottomOffsetY + row * (STICKER_HEIGHT_PX + GAP_PX);
        await drawSticker(ctx, stickers[stickerIndex], x, y);
        stickerIndex++;
      }
    }

    // Draw branding in reserved area (bottom-right)
    await drawBrandingArea(ctx, brandingText || 'LightMyFire');

    // Convert to PNG buffer
    const buffer = canvas.toBuffer('image/png', {
      compressionLevel: 9,
      filters: Canvas.PNG_FILTER_NONE
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="lightmyfire-stickers-printful.png"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating Printful sticker sheet:', error);
    return NextResponse.json(
      { error: 'Failed to generate sticker sheet', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function drawSticker(
  ctx: NodeCanvasContext,
  sticker: StickerData,
  x: number,
  y: number
) {
  const padding = Math.round(STICKER_WIDTH_PX * 0.05);
  const contentWidth = STICKER_WIDTH_PX - padding * 2;
  const contentHeight = STICKER_HEIGHT_PX - padding * 2;

  // Draw colored background
  ctx.fillStyle = sticker.backgroundColor;
  ctx.fillRect(x, y, STICKER_WIDTH_PX, STICKER_HEIGHT_PX);

  let currentY = y + padding;

  // White card for "You found me" + name
  const cardHeight = Math.round(contentHeight * 0.28);

  // Draw white background directly without path
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + padding, currentY, contentWidth, cardHeight);

  // "You found me" text
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.round(STICKER_HEIGHT_PX * 0.10)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('You found me', x + STICKER_WIDTH_PX / 2, currentY + Math.round(cardHeight * 0.4));

  // "I'm + name" text
  ctx.font = `bold ${Math.round(STICKER_HEIGHT_PX * 0.09)}px Arial`;
  ctx.textBaseline = 'middle';
  ctx.fillText(`I'm ${sticker.name}`, x + STICKER_WIDTH_PX / 2, currentY + Math.round(cardHeight * 0.75));

  currentY += cardHeight + padding;

  // "Read my story and expand it"
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(STICKER_HEIGHT_PX * 0.065)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Read my story', x + STICKER_WIDTH_PX / 2, currentY);
  ctx.fillText('and expand it', x + STICKER_WIDTH_PX / 2, currentY + Math.round(STICKER_HEIGHT_PX * 0.075));

  // Translation
  const translations: { [key: string]: string } = {
    fr: 'Lis mon histoire et enrichis-la',
    es: 'Lee mi historia y ampliala',
    de: 'Lesen Sie meine Geschichte',
    it: 'Leggi la mia storia e ampliala',
    pt: 'Leia minha história e expanda',
  };

  const translationText = translations[sticker.language] || translations.fr;
  ctx.font = `bold ${Math.round(STICKER_HEIGHT_PX * 0.055)}px Arial`;
  ctx.textBaseline = 'top';
  ctx.fillText(translationText, x + STICKER_WIDTH_PX / 2, currentY + Math.round(STICKER_HEIGHT_PX * 0.14));

  currentY += Math.round(STICKER_HEIGHT_PX * 0.18);

  // QR Code - reduced by 30% (0.36 * 0.7 = 0.252)
  const qrSize = Math.round(STICKER_HEIGHT_PX * 0.252);
  try {
    const qrUrl = process.env.NEXT_PUBLIC_BASE_URL ?
      `${process.env.NEXT_PUBLIC_BASE_URL}/find` :
      'https://lightmyfire.app/find';

    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: qrSize,
      margin: 0,
      color: { dark: '#000000', light: '#ffffff' }
    });

    const qrImage = await loadImage(qrDataUrl);
    const qrX = x + (STICKER_WIDTH_PX - qrSize) / 2;
    ctx.drawImage(qrImage, qrX, currentY, qrSize, qrSize);
  } catch (error) {
    console.error('QR code generation error:', error);
  }

  currentY += qrSize + Math.round(STICKER_HEIGHT_PX * 0.05);

  // "or go to lightmyfire.app" section
  const urlBgHeight = Math.round(STICKER_HEIGHT_PX * 0.15);

  // Draw white background directly without path
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + padding, currentY, contentWidth, urlBgHeight);

  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.round(STICKER_HEIGHT_PX * 0.055)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('or go to', x + STICKER_WIDTH_PX / 2, currentY + Math.round(urlBgHeight * 0.45));
  ctx.font = `bold ${Math.round(STICKER_HEIGHT_PX * 0.06)}px Arial`;
  ctx.fillText('lightmyfire.app', x + STICKER_WIDTH_PX / 2, currentY + Math.round(urlBgHeight * 0.85));

  currentY += urlBgHeight + Math.round(STICKER_HEIGHT_PX * 0.03);

  // "and type my code"
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(STICKER_HEIGHT_PX * 0.065)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('and type my code', x + STICKER_WIDTH_PX / 2, currentY);

  // Translation
  const codeTranslations: { [key: string]: string } = {
    fr: 'et entre mon code',
    es: 'e introduce mi código',
    de: 'und gib meinen Code ein',
    it: 'e digita il mio codice',
    pt: 'e digite meu código',
  };

  const codeText = codeTranslations[sticker.language] || codeTranslations.fr;
  ctx.font = `bold ${Math.round(STICKER_HEIGHT_PX * 0.055)}px Arial`;
  ctx.textBaseline = 'top';
  ctx.fillText(codeText, x + STICKER_WIDTH_PX / 2, currentY + Math.round(STICKER_HEIGHT_PX * 0.075));

  currentY += Math.round(STICKER_HEIGHT_PX * 0.12);

  // PIN code
  const pinBgHeight = Math.round(STICKER_HEIGHT_PX * 0.14);

  // Draw white background directly without path
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + padding, currentY, contentWidth, pinBgHeight);

  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.round(STICKER_HEIGHT_PX * 0.09)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sticker.pinCode, x + STICKER_WIDTH_PX / 2, currentY + Math.round(pinBgHeight * 0.75));

  currentY += pinBgHeight + Math.round(STICKER_HEIGHT_PX * 0.02);

  // Logo section at bottom
  const logoSectionHeight = STICKER_HEIGHT_PX - currentY + y;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, currentY, STICKER_WIDTH_PX, logoSectionHeight);

  // Load and draw logo
  try {
    const { Image } = await import('canvas');
    const fs = await import('fs');
    const path = await import('path');

    const logoPath = path.join(process.cwd(), 'public', 'LOGOLONG.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoImage = new Image();
    logoImage.src = logoBuffer;

    const logoPadding = Math.round(STICKER_WIDTH_PX * 0.1);
    const logoWidth = STICKER_WIDTH_PX - (logoPadding * 2);
    const logoHeight = Math.round(logoWidth * (logoImage.height / logoImage.width));

    const logoX = x + logoPadding;
    const logoY = currentY + (logoSectionHeight - logoHeight) / 2;

    ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
  } catch (error) {
    console.error('Logo loading error:', error);
  }
}

async function drawBrandingArea(ctx: NodeCanvasContext, brandingText: string) {
  const x = SHEET_WIDTH_PX - RESERVED_PX;
  const y = SHEET_HEIGHT_PX - RESERVED_PX;

  // Draw white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, RESERVED_PX, RESERVED_PX);

  // Load and draw logo
  try {
    const { Image } = await import('canvas');
    const fs = await import('fs');
    const path = await import('path');

    const logoPath = path.join(process.cwd(), 'public', 'LOGOLONG.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoImage = new Image();
    logoImage.src = logoBuffer;

    const logoPadding = Math.round(RESERVED_PX * 0.15);
    const logoWidth = RESERVED_PX - (logoPadding * 2);
    const logoHeight = Math.round(logoWidth * (logoImage.height / logoImage.width));

    const logoX = x + logoPadding;
    const logoY = y + logoPadding;

    ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);

    // Add branding text below logo
    const textY = logoY + logoHeight + Math.round(RESERVED_PX * 0.1);
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(RESERVED_PX * 0.08)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(brandingText, x + RESERVED_PX / 2, textY);

    // Add "Join our community" text
    ctx.font = `${Math.round(RESERVED_PX * 0.06)}px Arial`;
    ctx.textBaseline = 'top';
    ctx.fillText('Join our community!', x + RESERVED_PX / 2, textY + Math.round(RESERVED_PX * 0.1));
    ctx.fillText('lightmyfire.app', x + RESERVED_PX / 2, textY + Math.round(RESERVED_PX * 0.18));
  } catch (error) {
    console.error('Branding area error:', error);
  }
}

function roundRect(
  ctx: NodeCanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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
